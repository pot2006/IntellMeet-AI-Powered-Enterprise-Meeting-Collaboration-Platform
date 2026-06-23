import Meeting from "../models/Meeting.js";

// Same scope as analyticsController/dashboardController: creator OR
// participant. No admin/role field exists yet, so this stays personal.
const scopeToUser = (userId) => ({
  $or: [{ createdBy: userId }, { participants: userId }],
});

// Builds a notification feed entirely derived from real Meeting
// documents — no separate Notification collection. Each meeting can
// produce more than one notification across its lifecycle (scheduled,
// started, ended, recorded), since those are genuinely distinct events
// that happened at different times, not the same fact restated.
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const meetings = await Meeting.find(scopeToUser(userId))
      .select(
        "title status createdAt startedAt endedAt isRecorded aiSummary participants createdBy",
      )
      .sort({ createdAt: -1 })
      .limit(50); // cap the lookback window; this isn't meant to be a full history browser

    const notifications = [];

    meetings.forEach((m) => {
      const isOwnMeeting = m.createdBy.toString() === userId.toString();

      // Scheduled: only notify the creator — a participant being told
      // "your meeting was scheduled" for a meeting they didn't create
      // doesn't make sense the way it's worded.
      if (isOwnMeeting) {
        notifications.push({
          id: `${m._id}-scheduled`,
          type: "scheduled",
          message: `📅 Meeting "${m.title}" was scheduled`,
          timestamp: m.createdAt,
          meetingId: m._id,
        });
      }

      if (m.status === "Live" && m.startedAt) {
        notifications.push({
          id: `${m._id}-started`,
          type: "started",
          message: `🔴 Meeting "${m.title}" is live now`,
          timestamp: m.startedAt,
          meetingId: m._id,
        });
      }

      if (m.status === "Completed" && m.endedAt) {
        notifications.push({
          id: `${m._id}-ended`,
          type: "meetingEnded",
          message: `✅ Meeting "${m.title}" has ended`,
          timestamp: m.endedAt,
          meetingId: m._id,
          meetingTitle: m.title,
        });
      }

      if (m.isRecorded) {
        notifications.push({
          id: `${m._id}-recorded`,
          type: "recorded",
          // No exact timestamp exists for "when the recording finished
          // uploading" on the schema, so endedAt is the closest honest
          // anchor — it's not exact, but it's not invented either.
          message: `🎥 Recording is available for "${m.title}"`,
          timestamp: m.endedAt || m.createdAt,
          meetingId: m._id,
        });
      }

      if (m.aiSummary && m.aiSummary.trim().length > 0) {
        notifications.push({
          id: `${m._id}-summary`,
          type: "aiSummary",
          message: `🤖 AI summary is ready for "${m.title}"`,
          timestamp: m.endedAt || m.createdAt,
          meetingId: m._id,
        });
      }
    });

    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(notifications.slice(0, 30));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
