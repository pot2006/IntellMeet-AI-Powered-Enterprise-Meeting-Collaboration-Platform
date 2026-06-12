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

    const meeting = await Meeting.findOne({
      meetingCode: code,
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
      await meeting.save();
    }

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
