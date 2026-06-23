import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/analytics/stats");
        setData(res.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const cardClass =
    theme === "dark"
      ? "bg-slate-900 text-white"
      : "bg-gray-100 text-black border border-gray-300";

  const activityClass = theme === "dark" ? "bg-slate-800" : "bg-gray-200";

  const progressClass = theme === "dark" ? "bg-slate-700" : "bg-gray-300";

  const wrapperClass = `min-h-screen p-4 md:p-8 ${
    theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-black"
  }`;

  if (loading) {
    return (
      <div className={`${wrapperClass} flex items-center justify-center`}>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${wrapperClass} flex flex-col items-center justify-center gap-4`}
      >
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg"
        >
          {t("dashboard")}
        </button>
      </div>
    );
  }

  // Bar chart heights are scaled relative to the largest monthly count
  // in the real data, instead of fixed pixel heights.
  const maxMonthlyCount = Math.max(
    1,
    ...data.monthlyMeetingCounts.map((m) => m.count),
  );

  const activityIcon = (entry) => {
    if (entry.hasAiSummary) return "🤖";
    if (entry.isRecorded) return "🎥";
    if (entry.status === "Completed") return "✅";
    if (entry.status === "Live") return "🔴";
    return "📅";
  };

  const activityLabel = (entry) => {
    if (entry.hasAiSummary) return `AI summary ready — ${entry.title}`;
    if (entry.isRecorded) return `Recording available — ${entry.title}`;
    if (entry.status === "Completed") return `Completed — ${entry.title}`;
    if (entry.status === "Live") return `Live now — ${entry.title}`;
    return `Scheduled — ${entry.title}`;
  };

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-cyan-400">
            {t("analyticsDashboard")}
          </h1>

          <p className="text-slate-400 mt-2 text-center md:text-left">
            {t("meetingInsights")}
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg transition duration-300"
        >
          {t("dashboard")}
        </button>
      </div>

      {/* Stats Cards — every number below comes from the user's real
          meeting data. Cards with no real backing (satisfaction score,
          languages used, meeting categories) have been removed rather
          than shown with invented numbers. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">📅 {t("totalMeetings")}</p>
          <h2 className="text-4xl font-bold text-cyan-400 mt-2">
            {data.totalMeetings}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">⏱ {t("meetingHours")}</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">
            {Math.round(data.totalMeetingMinutes / 60)}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">🔴 {t("liveMeetings") || "Live Now"}</p>
          <h2 className="text-4xl font-bold text-yellow-400 mt-2">
            {data.liveMeetings}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">🤖 {t("aiSummaries")}</p>
          <h2 className="text-4xl font-bold text-purple-400 mt-2">
            {data.aiSummariesCount}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">
            📌 {t("scheduledMeetings") || "Scheduled"}
          </p>
          <h2 className="text-4xl font-bold text-orange-400 mt-2">
            {data.scheduledMeetings}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">🎥 {t("recordings")}</p>
          <h2 className="text-4xl font-bold text-red-400 mt-2">
            {data.recordingsCount}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">✅ {t("completed")}</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">
            {data.completedMeetings}
          </h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">⏳ {t("avgDuration")}</p>
          <h2 className="text-4xl font-bold text-pink-400 mt-2">
            {data.avgDurationMinutes}m
          </h2>
        </div>
      </div>

      {/* Completion Rate — the only progress bar kept, since it's the
          only one with a real ratio behind it (completed / total). The
          old "AI Usage Rate" bar had no real definition, so it's gone. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <h2 className="text-xl font-bold mb-4">
            {t("meetingCompletionRate")}
          </h2>

          <div className={`w-full ${progressClass} rounded-full h-5`}>
            <div
              className="bg-green-500 h-5 rounded-full transition-all duration-500"
              style={{ width: `${data.completionRate}%` }}
            />
          </div>

          <p className="mt-3 text-green-400">
            {data.completionRate}% {t("completed")}
          </p>
        </div>

        <div
          className={`${cardClass} p-6 rounded-xl flex flex-col justify-center`}
        >
          <h3 className="text-lg font-semibold mb-2">{t("mostActiveUser")}</h3>
          <p className="text-cyan-400 text-2xl">
            {data.mostActiveCollaborator || "—"}
          </p>
          {!data.mostActiveCollaborator && (
            <p className="text-slate-500 text-sm mt-2">
              Not enough multi-participant meetings yet.
            </p>
          )}
        </div>
      </div>

      {/* Monthly Meetings — real per-month counts, last 6 months,
          including zero-count months so gaps are visible rather than
          hidden. */}
      <div className={`${cardClass} p-6 rounded-xl mb-10 overflow-x-auto`}>
        <h2 className="text-2xl font-bold mb-6">{t("monthlyMeetings")}</h2>

        {data.totalMeetings === 0 ? (
          <p className="text-slate-500">No meetings yet to chart.</p>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-4 items-end h-52 min-w-[400px]">
              {data.monthlyMeetingCounts.map((bucket, i) => (
                <div
                  key={i}
                  className="bg-cyan-500 rounded flex items-end justify-center text-xs font-semibold text-slate-950 pb-1"
                  style={{
                    height: `${Math.max(
                      6,
                      (bucket.count / maxMonthlyCount) * 100,
                    )}%`,
                  }}
                  title={`${bucket.count} meeting${bucket.count === 1 ? "" : "s"}`}
                >
                  {bucket.count > 0 && bucket.count}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-6 text-center mt-4 text-slate-400 min-w-[400px]">
              {data.monthlyMeetingCounts.map((bucket, i) => (
                <span key={i}>{bucket.label}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent Activity — derived from real recent meetings, not a
          fabricated activity log. Meeting Categories section removed
          entirely since there's no category field on the schema. */}
      <div className="grid grid-cols-1 gap-8 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <h2 className="text-2xl font-bold mb-6">{t("recentActivity")}</h2>

          {data.recentActivity.length === 0 ? (
            <p className="text-slate-500">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((entry, i) => (
                <div
                  key={i}
                  className={`${activityClass} p-3 rounded flex justify-between items-center`}
                >
                  <span>
                    {activityIcon(entry)} {activityLabel(entry)}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
