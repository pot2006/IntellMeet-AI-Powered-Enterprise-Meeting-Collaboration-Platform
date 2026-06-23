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

router.post(
  "/:id/recording",
  protect,
  upload.single("recording"),
  uploadRecording,
);

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
