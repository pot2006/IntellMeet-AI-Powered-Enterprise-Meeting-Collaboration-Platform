import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const cardClass =
    theme === "dark"
      ? "bg-slate-900 text-white"
      : "bg-gray-100 text-black border border-gray-300";

  const activityClass = theme === "dark" ? "bg-slate-800" : "bg-gray-200";

  const progressClass = theme === "dark" ? "bg-slate-700" : "bg-gray-300";

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        theme === "dark"
          ? "bg-slate-950 text-white"
          : "bg-white text-black"
      }`}
    >
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">📅 {t("totalMeetings")}</p>
          <h2 className="text-4xl font-bold text-cyan-400 mt-2">52</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">⏱ {t("meetingHours")}</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">124</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">👥 {t("activeUsers")}</p>
          <h2 className="text-4xl font-bold text-yellow-400 mt-2">18</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">🤖 {t("aiSummaries")}</p>
          <h2 className="text-4xl font-bold text-purple-400 mt-2">47</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">📌 {t("upcomingMeetings")}</p>
          <h2 className="text-4xl font-bold text-orange-400 mt-2">12</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">🎥 {t("recordings")}</p>
          <h2 className="text-4xl font-bold text-red-400 mt-2">35</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">🌐 {t("languagesUsed")}</p>
          <h2 className="text-4xl font-bold text-pink-400 mt-2">4</h2>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <p className="text-slate-400">⭐ {t("satisfaction")}</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">98%</h2>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <h2 className="text-xl font-bold mb-4">
            {t("meetingCompletionRate")}
          </h2>

          <div className={`w-full ${progressClass} rounded-full h-5`}>
            <div
              className="bg-green-500 h-5 rounded-full"
              style={{ width: "85%" }}
            />
          </div>

          <p className="mt-3 text-green-400">
            85% {t("completed")}
          </p>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <h2 className="text-xl font-bold mb-4">
            {t("aiUsageRate")}
          </h2>

          <div className={`w-full ${progressClass} rounded-full h-5`}>
            <div
              className="bg-cyan-500 h-5 rounded-full"
              style={{ width: "92%" }}
            />
          </div>

          <p className="mt-3 text-cyan-400">
            92% {t("usage")}
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <h3 className="text-lg font-semibold mb-2">
            {t("mostActiveUser")}
          </h3>

          <p className="text-cyan-400 text-2xl">
            Vimal Kumar
          </p>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <h3 className="text-lg font-semibold mb-2">
            {t("avgDuration")}
          </h3>

          <p className="text-green-400 text-2xl">
            42 {t("minutes")}
          </p>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <h3 className="text-lg font-semibold mb-2">
            {t("successRate")}
          </h3>

          <p className="text-yellow-400 text-2xl">
            98%
          </p>
        </div>
      </div>

      {/* Monthly Meetings */}
      <div className={`${cardClass} p-6 rounded-xl mb-10 overflow-x-auto`}>
        <h2 className="text-2xl font-bold mb-6">
          {t("monthlyMeetings")}
        </h2>

        <div className="grid grid-cols-6 gap-4 items-end h-52 min-w-[400px]">
          <div className="bg-cyan-500 h-20 rounded"></div>
          <div className="bg-cyan-500 h-28 rounded"></div>
          <div className="bg-cyan-500 h-40 rounded"></div>
          <div className="bg-cyan-500 h-24 rounded"></div>
          <div className="bg-cyan-500 h-48 rounded"></div>
          <div className="bg-cyan-500 h-36 rounded"></div>
        </div>

        <div className="grid grid-cols-6 text-center mt-4 text-slate-400 min-w-[400px]">
          <span>{t("jan")}</span>
          <span>{t("feb")}</span>
          <span>{t("mar")}</span>
          <span>{t("apr")}</span>
          <span>{t("may")}</span>
          <span>{t("jun")}</span>
        </div>
      </div>

      {/* Categories + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className={`${cardClass} p-6 rounded-xl`}>
          <h2 className="text-2xl font-bold mb-6">
            {t("meetingCategories")}
          </h2>

          <div className="space-y-4">
            <p>{t("projectReview")} - 40%</p>
            <p>{t("teamSync")} - 30%</p>
            <p>{t("clientCalls")} - 20%</p>
            <p>{t("training")} - 10%</p>
          </div>
        </div>

        <div className={`${cardClass} p-6 rounded-xl`}>
          <h2 className="text-2xl font-bold mb-6">
            {t("recentActivity")}
          </h2>

          <div className="space-y-3">
            <div className={`${activityClass} p-3 rounded`}>
              ✅ {t("meetingCreated")}
            </div>

            <div className={`${activityClass} p-3 rounded`}>
              🤖 {t("aiSummaryGenerated")}
            </div>

            <div className={`${activityClass} p-3 rounded`}>
              🎥 {t("recordingDownloaded")}
            </div>

            <div className={`${activityClass} p-3 rounded`}>
              👥 {t("newUserJoined")}
            </div>

            <div className={`${activityClass} p-3 rounded`}>
              🌐 {t("languageChanged")}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg transition duration-300">
          📥 {t("exportReport")}
        </button>

        <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg transition duration-300">
          📊 {t("downloadAnalytics")}
        </button>

        <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg transition duration-300">
          📈 {t("generateAIReport")}
        </button>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;