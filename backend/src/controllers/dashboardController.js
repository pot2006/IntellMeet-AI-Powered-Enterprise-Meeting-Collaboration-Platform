import Meeting from "../models/Meeting.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalMeetings = await Meeting.countDocuments({
      createdBy: req.user._id,
    });

    const liveMeetings = await Meeting.countDocuments({
      createdBy: req.user._id,
      status: "Live",
    });

    const meetings = await Meeting.find({
      createdBy: req.user._id,
    });

    const participants = meetings.reduce(
      (total, meeting) => total + meeting.participants.length,
      0,
    );
    res.json({
      totalMeetings,
      liveMeetings,
      participants,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
