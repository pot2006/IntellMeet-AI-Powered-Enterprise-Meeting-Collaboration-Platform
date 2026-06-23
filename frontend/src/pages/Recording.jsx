import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Recording() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedMeeting = location.state?.meeting;
  const [meeting, setMeeting] = useState(passedMeeting || null);
  const [loading, setLoading] = useState(!passedMeeting);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (passedMeeting) return;

    const meetingId = location.state?.meetingId;
    if (!meetingId) {
      setError("No meeting selected.");
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      try {
        const res = await API.get(`/meetings/${meetingId}`);
        setMeeting(res.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load meeting");
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [passedMeeting, location.state]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // API's baseURL already includes /api (or whatever prefix the rest of
  // the app uses for API calls) — reuse it so this doesn't hardcode a
  // separate host/port that could drift from the real backend URL.
  const recordingSrc = meeting
    ? `${API.defaults.baseURL}/meetings/${meeting._id}/recording`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-lg text-red-400">{error || "Meeting not found"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 px-5 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (!meeting.recordingUrl) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-lg text-slate-400">
          No recording is available for this meeting.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 px-5 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">🎥 Meeting Recording</h1>

        <button
          onClick={() => navigate("/meeting-history")}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* Recording Details */}
      <div className="bg-slate-900 rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Recording Details
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400">Meeting Name</p>
            <p className="font-semibold">{meeting.title}</p>
          </div>

          <div>
            <p className="text-slate-400">Date</p>
            <p>{formatDate(meeting.createdAt)}</p>
          </div>

          <div>
            <p className="text-slate-400">Duration</p>
            <p>{meeting.duration ? `${meeting.duration} Minutes` : "—"}</p>
          </div>

          <div>
            <p className="text-slate-400">Participants</p>
            <p>{meeting.participants?.length || 0} Members</p>
          </div>

          <div>
            <p className="text-slate-400">Status</p>
            <p className="text-green-400 font-semibold">Available</p>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="bg-slate-900 rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Video Playback
        </h2>

        <div className="bg-black rounded-xl overflow-hidden border border-slate-700">
          <video src={recordingSrc} controls className="w-full max-h-[600px]">
            Your browser does not support video playback.
          </video>
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          <a
            href={recordingSrc}
            download={`${meeting.title || "recording"}.webm`}
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold inline-block"
          >
            ⬇ Download Video
          </a>
        </div>
      </div>
    </div>
  );
}

export default Recording;
