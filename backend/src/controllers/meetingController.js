import fs from "fs";
import path from "path";
import Meeting from "../models/Meeting.js";

const generateMeetingCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createMeeting = async (req, res) => {
  try {
    const { title, description } = req.body;

    const meeting = await Meeting.create({
      title,
      description,
      meetingCode: generateMeetingCode(),
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const joinMeeting = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        message: "Meeting code is required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const meeting = await Meeting.findOne({
      meetingCode: normalizedCode,
    });

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    const alreadyJoined = meeting.participants.some(
      (participant) => participant.toString() === req.user._id.toString(),
    );

    if (!alreadyJoined) {
      meeting.participants.push(req.user._id);
    }

    if (meeting.status === "Scheduled") {
      meeting.status = "Live";
      meeting.startedAt = new Date();
    }

    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMeetingHistory = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      participants: req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const uploadRecording = async (req, res) => {
  console.log(req.file);
  try {
    // FIX: check req.file exists before reading off it. If multer's
    // fileFilter rejects the upload, or the frontend's FormData field
    // name doesn't match upload.single("recording"), req.file is
    // undefined and reading req.file.filename throws a confusing
    // "Cannot read properties of undefined" 500 instead of a clear
    // "no file received" message.
    if (!req.file) {
      return res.status(400).json({
        message: "No recording file received",
      });
    }

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      // Clean up the orphaned file multer already wrote to disk.
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    // FIX: only the meeting's creator or a participant can attach a
    // recording to it. Without this, any authenticated user can upload
    // a file to any meeting ID just by guessing/iterating IDs.
    const isCreator = meeting.createdBy.toString() === req.user._id.toString();
    const isParticipant = meeting.participants.some(
      (p) => p.toString() === req.user._id.toString(),
    );

    if (!isCreator && !isParticipant) {
      fs.unlink(req.file.path, () => {});
      return res.status(403).json({
        message: "Not authorized to upload a recording for this meeting",
      });
    }

    // If a previous recording already exists for this meeting, remove
    // the old file from disk before overwriting the reference — otherwise
    // every re-recording leaves the previous file orphaned on disk
    // forever with nothing pointing to it.
    if (meeting.recordingUrl) {
      fs.unlink(
        path.join(process.cwd(), "uploads", meeting.recordingUrl),
        () => {},
      );
    }

    meeting.recordingUrl = req.file.filename;
    meeting.isRecorded = true;

    await meeting.save();

    res.json({
      message: "Uploaded",
      url: req.file.filename,
    });
  } catch (err) {
    console.log(err);
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      message: err.message,
    });
  }
};

// ---- Stream a meeting's recording for playback ----
// Supports HTTP range requests so a <video> player can seek instead of
// downloading the entire file before playback can start.
export const streamRecording = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting || !meeting.recordingUrl) {
      return res.status(404).json({
        message: "No recording found for this meeting",
      });
    }

    const filePath = path.join(process.cwd(), "uploads", meeting.recordingUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Recording file is missing on the server",
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/webm",
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/webm",
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
