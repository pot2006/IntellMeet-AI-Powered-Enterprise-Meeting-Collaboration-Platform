import express from "express";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createMeeting,
  getMyMeetings,
  joinMeeting,
  getMeetingById,
  getMeetingHistory,
  uploadRecording,
  streamRecording,
} from "../controllers/meetingController.js";
const router = express.Router();

router.post("/", protect, createMeeting);

router.get("/", protect, getMyMeetings);

router.get("/history", protect, getMeetingHistory);

// Wraps multer's middleware so that errors it throws (file-type
// rejection, size-limit exceeded, malformed multipart body) return a
// clean JSON response instead of falling through to Express's default
// error handler, which renders a raw HTML stack trace — exactly what
// was showing up in the browser Network tab as a confusing 500.
const handleRecordingUpload = (req, res, next) => {
  upload.single("recording")(req, res, (err) => {
    if (err) {
      console.log("Recording upload middleware error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post("/:id/recording", protect, handleRecordingUpload, uploadRecording);

// Streaming endpoint deliberately does NOT use the `protect` middleware,
// because a <video> tag's src attribute can't attach an Authorization
// header. If recordings need to stay private to participants only, this
// needs a signed/expiring URL or a short-lived token in the query string
// instead — left as-is for now since that depends on how sensitive your
// recordings are, not something to guess at silently.
router.get("/:id/recording", streamRecording);

router.post("/join", protect, joinMeeting);

router.get("/:id", protect, getMeetingById);

export default router;
