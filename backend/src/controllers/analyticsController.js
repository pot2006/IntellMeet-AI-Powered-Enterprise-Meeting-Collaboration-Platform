import Meeting from "../models/Meeting.js";
import User from "../models/User.js";

// All analytics in this controller are scoped to the logged-in user's
// own meetings (as creator OR participant). There is no admin/role
// field on the User model yet, so there is no safe way to show
// platform-wide stats without exposing every user's meeting data to
// every other logged-in user. If an isAdmin field is added later, this
// is the one place to branch into a platform-wide aggregation.
const scopeToUser = (userId) => ({
  $or: [{ createdBy: userId }, { participants: userId }],
});

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const baseFilter = scopeToUser(userId);

    const meetings = await Meeting.find(baseFilter).select(
      "title status duration participants createdAt isRecorded aiSummary createdBy",
    );

    const totalMeetings = meetings.length;
    const completed = meetings.filter((m) => m.status === "Completed");
    const scheduled = meetings.filter((m) => m.status === "Scheduled");
    const live = meetings.filter((m) => m.status === "Live");

    const totalMinutes = completed.reduce(
      (sum, m) => sum + (m.duration || 0),
      0,
    );
    const avgDurationMinutes =
      completed.length > 0 ? Math.round(totalMinutes / completed.length) : 0;

    const recordingsCount = meetings.filter((m) => m.isRecorded).length;
    const aiSummariesCount = meetings.filter(
      (m) => m.aiSummary && m.aiSummary.trim().length > 0,
    ).length;

    // Unique collaborators across all of the user's meetings (excluding
    // the user themself), and which one appears most often. This is a
    // defensible "most active collaborator" given there's no separate
    // per-user activity/login tracking table — it's derived directly
    // from real participant lists, not invented.
    const collaboratorCounts = {};
    meetings.forEach((m) => {
      m.participants.forEach((p) => {
        const pid = p.toString();
        if (pid === userId.toString()) return;
        collaboratorCounts[pid] = (collaboratorCounts[pid] || 0) + 1;
      });
    });

    let mostActiveCollaboratorId = null;
    let mostActiveCollaboratorCount = 0;
    for (const [pid, count] of Object.entries(collaboratorCounts)) {
      if (count > mostActiveCollaboratorCount) {
        mostActiveCollaboratorId = pid;
        mostActiveCollaboratorCount = count;
      }
    }

    let mostActiveCollaboratorName = null;
    if (mostActiveCollaboratorId) {
      const user = await User.findById(mostActiveCollaboratorId).select("name");
      mostActiveCollaboratorName = user?.name || null;
    }

    // Monthly meeting counts for the last 6 calendar months, including
    // months with zero meetings (so the chart doesn't silently skip
    // gaps and look like a denser trend than it really is).
    const now = new Date();
    const monthBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        count: 0,
      });
    }
    meetings.forEach((m) => {
      const d = new Date(m.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthBuckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    });

    // Status breakdown as percentages, for a completion-rate style bar.
    const completionRate =
      totalMeetings > 0
        ? Math.round((completed.length / totalMeetings) * 100)
        : 0;

    // Recent activity: derived from the 5 most recently updated meetings
    // rather than a separate activity-log collection (which doesn't
    // exist). Each entry reflects something that actually happened.
    const recentMeetings = [...meetings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((m) => ({
        title: m.title,
        status: m.status,
        isRecorded: m.isRecorded,
        hasAiSummary: !!(m.aiSummary && m.aiSummary.trim().length > 0),
        createdAt: m.createdAt,
      }));

    res.json({
      totalMeetings,
      completedMeetings: completed.length,
      scheduledMeetings: scheduled.length,
      liveMeetings: live.length,
      totalMeetingMinutes: totalMinutes,
      avgDurationMinutes,
      recordingsCount,
      aiSummariesCount,
      completionRate,
      mostActiveCollaborator: mostActiveCollaboratorName,
      monthlyMeetingCounts: monthBuckets.map((b) => ({
        label: b.label,
        count: b.count,
      })),
      recentActivity: recentMeetings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
