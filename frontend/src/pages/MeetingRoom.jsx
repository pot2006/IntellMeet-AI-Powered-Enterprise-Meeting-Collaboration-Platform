import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";
import socket from "../socket";

// STUN-only ICE config. This works for peers on simple/open NATs but will
// fail for a meaningful fraction of real-world users (symmetric NAT,
// strict corporate firewalls, some mobile carriers). Before shipping this
// beyond same-network testing, add a TURN server here, e.g.:
//
// const ICE_SERVERS = [
//   { urls: "stun:stun.l.google.com:19302" },
//   { urls: "turn:your-turn-host:3478", username: "...", credential: "..." },
// ];
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function MeetingRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const [meeting, setMeeting] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [roomFullError, setRoomFullError] = useState(false);

  // ---- Recording state ----
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadingRecording, setUploadingRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);

  // Remote participants, keyed by socketId. Each entry:
  // { socketId, userInfo, stream, connectionState }
  const [remoteParticipants, setRemoteParticipants] = useState({});

  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Map<socketId, RTCPeerConnection>
  const peerConnections = useRef(new Map());
  // Map<socketId, RTCIceCandidate[]>
  const pendingCandidates = useRef(new Map());
  // Map<socketId, HTMLVideoElement>
  const remoteVideoRefs = useRef(new Map());

  // remoteParticipants mirrored into a ref so the recording draw loop
  // (running outside React's render cycle via requestAnimationFrame) can
  // always read current participant info/streams without needing to be
  // recreated whenever state changes.
  const remoteParticipantsRef = useRef({});
  useEffect(() => {
    remoteParticipantsRef.current = remoteParticipants;
  }, [remoteParticipants]);

  // ---- Recording internals ----
  const recordingCanvasRef = useRef(null);
  const recordingAnimationFrame = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingAudioContextRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordingStartTimeRef = useRef(null);

  const meetingId = location.state?.meetingId || location.state?.meeting?._id;
  const from = location.state?.from || "/dashboard";

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  // ---- Create a new RTCPeerConnection for a given remote socket ----
  const createPeerConnection = useCallback(
    (targetSocketId) => {
      const existingPc = peerConnections.current.get(targetSocketId);
      if (existingPc) {
        existingPc.close();
        peerConnections.current.delete(targetSocketId);
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            roomId: meetingId,
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (!stream) return;

        setRemoteParticipants((prev) => ({
          ...prev,
          [targetSocketId]: {
            ...(prev[targetSocketId] || {}),
            socketId: targetSocketId,
            stream,
          },
        }));
      };

      pc.oniceconnectionstatechange = () => {
        setRemoteParticipants((prev) => {
          if (!prev[targetSocketId]) return prev;
          return {
            ...prev,
            [targetSocketId]: {
              ...prev[targetSocketId],
              connectionState: pc.iceConnectionState,
            },
          };
        });
      };

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current);
        });
      }

      peerConnections.current.set(targetSocketId, pc);
      pendingCandidates.current.set(targetSocketId, []);

      return pc;
    },
    [meetingId],
  );

  const flushPendingCandidates = async (targetSocketId, pc) => {
    const queued = pendingCandidates.current.get(targetSocketId) || [];
    pendingCandidates.current.set(targetSocketId, []);

    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.log("Error flushing queued ICE candidate:", err);
      }
    }
  };

  // ---- Tear down the connection + tile for one peer ----
  const removePeer = useCallback((targetSocketId) => {
    const pc = peerConnections.current.get(targetSocketId);
    pc?.close();
    peerConnections.current.delete(targetSocketId);
    pendingCandidates.current.delete(targetSocketId);
    remoteVideoRefs.current.delete(targetSocketId);

    setRemoteParticipants((prev) => {
      const next = { ...prev };
      delete next[targetSocketId];
      return next;
    });
  }, []);

  // ==========================================================
  // ---- RECORDING: canvas video mix + Web Audio mix + MediaRecorder ----
  // ==========================================================

  const drawRecordingFrame = useCallback(() => {
    const canvas = recordingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const tiles = [
      { el: localVideoRef.current, label: "You" },
      ...Array.from(remoteVideoRefs.current.entries()).map(([id, el]) => ({
        el,
        label:
          remoteParticipantsRef.current[id]?.userInfo?.name || "Participant",
      })),
    ].filter((t) => t.el && t.el.videoWidth > 0);

    ctx.fillStyle = "#202124";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (tiles.length === 0) {
      recordingAnimationFrame.current =
        requestAnimationFrame(drawRecordingFrame);
      return;
    }

    const cols = tiles.length <= 1 ? 1 : tiles.length <= 4 ? 2 : 3;
    const rows = Math.ceil(tiles.length / cols);
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    tiles.forEach((tile, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellW;
      const y = row * cellH;

      const videoAspect = tile.el.videoWidth / tile.el.videoHeight;
      const cellAspect = cellW / cellH;
      let drawW = cellW;
      let drawH = cellH;
      let offsetX = 0;
      let offsetY = 0;

      if (videoAspect > cellAspect) {
        drawH = cellH;
        drawW = cellH * videoAspect;
        offsetX = (cellW - drawW) / 2;
      } else {
        drawW = cellW;
        drawH = cellW / videoAspect;
        offsetY = (cellH - drawH) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellW, cellH);
      ctx.clip();
      ctx.drawImage(tile.el, x + offsetX, y + offsetY, drawW, drawH);
      ctx.restore();

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(x + 8, y + cellH - 32, 120, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.fillText(tile.label, x + 14, y + cellH - 15);
    });

    recordingAnimationFrame.current = requestAnimationFrame(drawRecordingFrame);
  }, []);

  // Uploads the finished recording to the user's actual backend route:
  // POST /meetings/:id/recording, multipart field name "recording" —
  // matching upload.single("recording") in their uploadMiddleware.js.
  const uploadRecordingBlob = async (blob) => {
    setUploadingRecording(true);
    setRecordingError(null);

    try {
      const formData = new FormData();
      formData.append(
        "recording",
        blob,
        `meeting-${meetingId}-${Date.now()}.webm`,
      );

      await API.post(`/meetings/${meetingId}/recording`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.log("Recording upload failed:", err);
      setRecordingError(
        "Recording finished but upload failed: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setUploadingRecording(false);
    }
  };

  const startRecording = useCallback(() => {
    if (isRecording) return;
    setRecordingError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      recordingCanvasRef.current = canvas;

      const canvasStream = canvas.captureStream(30);

      // ---- Audio mixing via Web Audio API ----
      // MediaRecorder reliably takes one audio track, so every
      // participant's audio must be summed into a single destination
      // track before recording, rather than attached separately.
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      recordingAudioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();

      const connectStreamAudio = (stream) => {
        if (!stream) return;
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return;
        try {
          const source = audioContext.createMediaStreamSource(
            new MediaStream(audioTracks),
          );
          source.connect(destination);
        } catch (err) {
          console.log("Error connecting audio track to mixer:", err);
        }
      };

      connectStreamAudio(localStream.current);
      Object.values(remoteParticipantsRef.current).forEach((p) =>
        connectStreamAudio(p.stream),
      );

      const mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus",
      )
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(mixedStream, { mimeType });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cancelAnimationFrame(recordingAnimationFrame.current);
        recordingAudioContextRef.current?.close();
        clearInterval(recordingIntervalRef.current);

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        await uploadRecordingBlob(blob);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;

      recordingStartTimeRef.current = Date.now();
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(
          Math.floor((Date.now() - recordingStartTimeRef.current) / 1000),
        );
      }, 1000);

      drawRecordingFrame();
      setIsRecording(true);
    } catch (err) {
      console.log("Failed to start recording:", err);
      setRecordingError(
        "Could not start recording: " + (err.message || "unknown error"),
      );
    }
  }, [isRecording, drawRecordingFrame]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, [isRecording]);

  // Stop recording cleanly if the component unmounts mid-recording
  // (e.g. user navigates away without clicking "Stop").
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      cancelAnimationFrame(recordingAnimationFrame.current);
      clearInterval(recordingIntervalRef.current);
      recordingAudioContextRef.current?.close();
    };
  }, []);

  // ==========================================================

  // ---- Camera/mic setup (runs once) ----
  useEffect(() => {
    let stream;
    let cancelled = false;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStream.current = stream;
        setLocalVideoStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log(err);

        if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setCameraError(
            "Camera is already in use by another tab or app. Close other tabs using the camera and reload.",
          );
        } else if (err.name === "NotAllowedError") {
          setCameraError(
            "Camera/microphone permission was denied. Allow access in your browser settings and reload.",
          );
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera or microphone was found on this device.");
        } else {
          setCameraError("Could not access camera/microphone: " + err.message);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      pendingCandidates.current.clear();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localVideoStream) {
      localVideoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  // ---- existingParticipants: we just joined, create offers to each ----
  useEffect(() => {
    const handleExistingParticipants = async (participants) => {
      for (const { socketId, userInfo } of participants) {
        setRemoteParticipants((prev) => ({
          ...prev,
          [socketId]: { ...(prev[socketId] || {}), socketId, userInfo },
        }));

        const pc = createPeerConnection(socketId);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("offer", {
            roomId: meetingId,
            targetSocketId: socketId,
            offer,
          });
        } catch (err) {
          console.log("Error creating offer to", socketId, err);
        }
      }
    };

    socket.on("existingParticipants", handleExistingParticipants);
    return () => socket.off("existingParticipants", handleExistingParticipants);
  }, [createPeerConnection, meetingId]);

  // ---- newParticipant ----
  useEffect(() => {
    const handleNewParticipant = ({ socketId, userInfo }) => {
      setRemoteParticipants((prev) => ({
        ...prev,
        [socketId]: { ...(prev[socketId] || {}), socketId, userInfo },
      }));
    };

    socket.on("newParticipant", handleNewParticipant);
    return () => socket.off("newParticipant", handleNewParticipant);
  }, []);

  // ---- Offer received ----
  useEffect(() => {
    const handleOffer = async (data) => {
      const { fromSocketId, offer } = data;

      try {
        let pc = peerConnections.current.get(fromSocketId);
        if (!pc) {
          pc = createPeerConnection(fromSocketId);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingCandidates(fromSocketId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          roomId: meetingId,
          targetSocketId: fromSocketId,
          answer,
        });
      } catch (err) {
        console.log("OFFER ERROR from", fromSocketId, err);
      }
    };

    socket.on("offer", handleOffer);
    return () => socket.off("offer", handleOffer);
  }, [createPeerConnection, meetingId]);

  // ---- Answer received ----
  useEffect(() => {
    const handleAnswer = async (data) => {
      const { fromSocketId, answer } = data;
      const pc = peerConnections.current.get(fromSocketId);

      if (!pc) {
        console.log("No peer connection for answer from", fromSocketId);
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingCandidates(fromSocketId, pc);
      } catch (err) {
        console.log("ANSWER ERROR from", fromSocketId, err);
      }
    };

    socket.on("answer", handleAnswer);
    return () => socket.off("answer", handleAnswer);
  }, []);

  // ---- ICE candidate received ----
  useEffect(() => {
    const handleIceCandidate = async (data) => {
      const { fromSocketId, candidate } = data;
      const pc = peerConnections.current.get(fromSocketId);
      const iceCandidate = new RTCIceCandidate(candidate);

      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(iceCandidate);
        } catch (err) {
          console.log(err);
        }
      } else {
        const queue = pendingCandidates.current.get(fromSocketId) || [];
        queue.push(iceCandidate);
        pendingCandidates.current.set(fromSocketId, queue);
      }
    };

    socket.on("iceCandidate", handleIceCandidate);
    return () => socket.off("iceCandidate", handleIceCandidate);
  }, []);

  // ---- Peer left ----
  useEffect(() => {
    const handlePeerLeft = ({ socketId }) => {
      console.log("Peer left:", socketId);
      removePeer(socketId);
    };

    socket.on("peerLeft", handlePeerLeft);
    return () => socket.off("peerLeft", handlePeerLeft);
  }, [removePeer]);

  // ---- Room full ----
  useEffect(() => {
    const handleRoomFull = () => setRoomFullError(true);
    socket.on("roomFull", handleRoomFull);
    return () => socket.off("roomFull", handleRoomFull);
  }, []);

  // ---- Fetch meeting + join room ----
  const hasJoinedRoom = useRef(false);
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await API.get(`/meetings/${meetingId}`);
        setMeeting(res.data);

        if (!hasJoinedRoom.current) {
          const user = getCurrentUser();
          socket.emit("joinRoom", meetingId, {
            name: user?.name || "Guest",
          });
          hasJoinedRoom.current = true;
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (meetingId) fetchMeeting();
  }, [meetingId]);

  // ---- Chat ----
  useEffect(() => {
    const handleReceive = (data) => setMessages((prev) => [...prev, data]);
    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    const user = getCurrentUser();

    const msg = {
      roomId: meetingId,
      sender: user?.name || "Guest",
      text: message.trim(),
    };

    socket.emit("sendMessage", msg);
    setMessage("");
  };

  // ---- Mic / camera toggles ----
  const toggleMic = () => {
    const enabled = !micOn;
    localStream.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = enabled));
    setMicOn(enabled);
  };

  const toggleCamera = () => {
    const enabled = !cameraOn;
    localStream.current
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = enabled));
    setCameraOn(enabled);
  };

  const handleLeave = async () => {
    // If a recording is in progress, stop it and wait for the upload to
    // finish before navigating away — navigating immediately would
    // unmount the component while the async onstop/upload handler is
    // still running, risking a lost or truncated recording.
    if (isRecording && mediaRecorderRef.current) {
      await new Promise((resolve) => {
        const recorder = mediaRecorderRef.current;
        const originalOnStop = recorder.onstop;
        recorder.onstop = async (event) => {
          await originalOnStop(event);
          resolve();
        };
        recorder.stop();
        setIsRecording(false);
      });
    }

    localStream.current?.getTracks().forEach((track) => track.stop());
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    navigate(from);
  };

  // Ref callback: attaches a remote stream to its <video> element as soon
  // as both the element and stream exist.
  const setRemoteVideoRef = (socketId, stream) => (el) => {
    if (el) {
      remoteVideoRefs.current.set(socketId, el);
      if (stream && el.srcObject !== stream) {
        el.srcObject = stream;
      }
    } else {
      remoteVideoRefs.current.delete(socketId);
    }
  };

  const remoteList = Object.values(remoteParticipants);
  const tileCount = remoteList.length + 1;

  const gridColsClass =
    tileCount <= 1
      ? "grid-cols-1"
      : tileCount === 2
        ? "grid-cols-2"
        : tileCount <= 4
          ? "grid-cols-2"
          : "grid-cols-3";

  const formatDuration = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (roomFullError) {
    return (
      <div className="min-h-screen bg-[#202124] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-lg">This meeting is full.</p>
        <p className="text-sm text-gray-400">
          Mesh calls support up to 6 participants right now.
        </p>
        <button
          onClick={() => navigate(from)}
          className="bg-[#3c4043] hover:bg-[#4a4d4f] px-5 py-2 rounded-full"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#202124] border-b border-[#3c4043]">
        <div>
          <h1 className="text-base font-medium text-gray-100">
            {meeting.title}
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {meeting.meetingCode} · {tileCount}{" "}
            {tileCount === 1 ? "participant" : "participants"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRecording && (
            <span className="flex items-center gap-2 text-sm bg-[#3c4043] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#ea4335] animate-pulse" />
              Recording {formatDuration(recordingSeconds)}
            </span>
          )}
          {uploadingRecording && (
            <span className="text-sm text-gray-400">
              Uploading recording...
            </span>
          )}

          <button
            onClick={handleLeave}
            className="bg-[#ea4335] hover:bg-[#d33a2c] text-sm px-4 py-2 rounded-full font-medium"
          >
            Leave call
          </button>
        </div>
      </div>

      {recordingError && (
        <div className="bg-[#ea4335]/20 border-b border-[#ea4335] text-sm px-6 py-2 text-red-200">
          {recordingError}
        </div>
      )}

      {/* Main area: video grid + optional side panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div
          className={`flex-1 grid ${gridColsClass} gap-3 p-4 auto-rows-fr content-center`}
        >
          {/* Local tile */}
          <div className="relative bg-[#3c4043] rounded-xl overflow-hidden flex items-center justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${
                cameraOn && !cameraError ? "" : "hidden"
              }`}
            />
            {cameraError ? (
              <div className="flex flex-col items-center gap-2 text-center px-6 text-sm text-gray-300">
                <span className="text-2xl">🚫</span>
                <span>{cameraError}</span>
              </div>
            ) : (
              !cameraOn && (
                <div className="w-16 h-16 rounded-full bg-[#5f6368] flex items-center justify-center text-2xl font-medium">
                  {(getCurrentUser()?.name || "Y")[0].toUpperCase()}
                </div>
              )
            )}
            <span className="absolute bottom-2 left-3 text-sm bg-black/40 px-2 py-0.5 rounded">
              You {!micOn && "🔇"}
            </span>
          </div>

          {/* Remote tiles */}
          {remoteList.map(({ socketId, userInfo, stream, connectionState }) => (
            <div
              key={socketId}
              className="relative bg-[#3c4043] rounded-xl overflow-hidden flex items-center justify-center"
            >
              {stream ? (
                <video
                  ref={setRemoteVideoRef(socketId, stream)}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
                  <div className="w-16 h-16 rounded-full bg-[#5f6368] flex items-center justify-center text-2xl font-medium text-white">
                    {(userInfo?.name || "?")[0].toUpperCase()}
                  </div>
                  <span>Connecting...</span>
                </div>
              )}
              <span className="absolute bottom-2 left-3 text-sm bg-black/40 px-2 py-0.5 rounded">
                {userInfo?.name || "Participant"}
                {connectionState === "disconnected" && " (reconnecting...)"}
              </span>
            </div>
          ))}
        </div>

        {/* Side panel: participants or chat */}
        {(participantsOpen || chatOpen) && (
          <div className="w-80 bg-[#2a2b2e] border-l border-[#3c4043] flex flex-col">
            {participantsOpen && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                <h3 className="text-base font-medium mb-3">
                  People ({tileCount})
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#5f6368] flex items-center justify-center text-xs">
                      {(getCurrentUser()?.name || "Y")[0].toUpperCase()}
                    </span>
                    You
                  </li>
                  {remoteList.map(({ socketId, userInfo }) => (
                    <li key={socketId} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#5f6368] flex items-center justify-center text-xs">
                        {(userInfo?.name || "?")[0].toUpperCase()}
                      </span>
                      {userInfo?.name || "Participant"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {chatOpen && (
              <div className="flex-1 flex flex-col p-4 min-h-0">
                <h3 className="text-base font-medium mb-3">In-call messages</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-sm">
                  {messages.map((msg, index) => (
                    <p key={index}>
                      <span className="text-[#8ab4f8] font-medium">
                        {msg.sender}:
                      </span>{" "}
                      {msg.text}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Send a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 p-2 rounded-lg bg-[#3c4043] text-sm outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-[#8ab4f8] text-[#202124] px-3 rounded-lg text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls — Meet-style floating pill bar */}
      <div className="flex justify-center items-center gap-3 py-4">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
            micOn ? "bg-[#3c4043] hover:bg-[#4a4d4f]" : "bg-[#ea4335]"
          }`}
          title={micOn ? "Turn off microphone" : "Turn on microphone"}
        >
          {micOn ? "🎤" : "🔇"}
        </button>

        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
            cameraOn ? "bg-[#3c4043] hover:bg-[#4a4d4f]" : "bg-[#ea4335]"
          }`}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? "🎥" : "🚫"}
        </button>

        <button
          className="w-12 h-12 rounded-full bg-[#3c4043] hover:bg-[#4a4d4f] flex items-center justify-center text-lg"
          title="Share screen (not yet implemented)"
        >
          🖥
        </button>

        <button
          onClick={() => {
            setChatOpen((v) => !v);
            setParticipantsOpen(false);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
            chatOpen
              ? "bg-[#8ab4f8] text-[#202124]"
              : "bg-[#3c4043] hover:bg-[#4a4d4f]"
          }`}
          title="Chat"
        >
          💬
        </button>

        <button
          onClick={() => {
            setParticipantsOpen((v) => !v);
            setChatOpen(false);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
            participantsOpen
              ? "bg-[#8ab4f8] text-[#202124]"
              : "bg-[#3c4043] hover:bg-[#4a4d4f]"
          }`}
          title="Show participants"
        >
          👥
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={uploadingRecording}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
            isRecording
              ? "bg-[#ea4335] animate-pulse"
              : "bg-[#3c4043] hover:bg-[#4a4d4f]"
          } ${uploadingRecording ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          ⏺
        </button>

        <button
          onClick={handleLeave}
          className="px-6 h-12 rounded-full bg-[#ea4335] hover:bg-[#d33a2c] font-medium ml-2"
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default MeetingRoom;
