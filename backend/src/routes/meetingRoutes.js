import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createMeeting,
  getMyMeetings,
  joinMeeting,
  getMeetingById,
} from "../controllers/meetingController.js";
const router = express.Router();

router.post("/", protect, createMeeting);

router.get("/", protect, getMyMeetings);

router.post("/join", protect, joinMeeting);

router.get("/:id", protect, getMeetingById);

export default router;
