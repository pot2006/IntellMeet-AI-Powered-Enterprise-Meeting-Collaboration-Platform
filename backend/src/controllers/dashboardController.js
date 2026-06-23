import Meeting from "../models/Meeting.js";

// Scoped to "creator OR participant", matching analyticsController.js.
// Previously this only counted meetings the user created, which
// undercounts real usage — a user who joins meetings via a meeting code
// (pushed into `participants` by joinMeeting) but never creates their
// own would see 0 meetings here despite actively using the product.
const scopeToUser = (userId) => ({
  $or: [{ createdBy: userId }, { participants: userId }],
});

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const baseFilter = scopeToUser(userId);

    const totalMeetings = await Meeting.countDocuments(baseFilter);

    const liveMeetings = await Meeting.countDocuments({
      ...baseFilter,
      status: "Live",
    });

    const meetings = await Meeting.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(8);

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
