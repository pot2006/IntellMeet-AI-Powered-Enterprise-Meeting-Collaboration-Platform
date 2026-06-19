import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import hero from "../assets/hero.png";
import FeatureCard from "../components/FeatureCard";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const pricingCardClass =
    theme === "dark"
      ? "bg-slate-900 border-slate-700 text-white"
      : "bg-gray-100 border-gray-300 text-black";

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-slate-950 text-white"
          : "bg-white text-black"
      }`}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 md:pt-32">
        <h1 className="text-2xl sm:text-3xl md:text-6xl font-bold leading-tight">
          {t("title")}
        </h1>

        <p className="mt-4 text-base md:text-xl text-gray-400 max-w-2xl px-4">
          {t("subtitle")}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() =>
              navigate("/create-meeting", {
                state: { from: "/" },
              })
            }
            className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2.5 rounded-xl font-semibold transition duration-300"
          >
            {t("createMeeting")}
          </button>

          <button
            onClick={() =>
              navigate("/join-meeting", {
                state: { from: "/" },
              })
            }
            className="border border-white px-5 py-2.5 rounded-xl hover:bg-white hover:text-black transition duration-300"
          >
            {t("joinMeeting")}
          </button>
        </div>

        <img
          src={hero}
          alt="AI Meeting"
          className="w-full max-w-[220px] md:max-w-[450px] mt-8 md:mt-10 rounded-2xl shadow-2xl"
        />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-14 md:py-20 px-6 md:px-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-12">
          {t("features")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon="🎥"
            title={t("hdVideoMeetings")}
            description={t("hdVideoMeetingsDesc")}
          />

          <FeatureCard
            icon="🤖"
            title={t("aiSummariesTitle")}
            description={t("aiSummariesDesc")}
          />

          <FeatureCard
            icon="📹"
            title={t("meetingRecordingsTitle")}
            description={t("meetingRecordingsDesc")}
          />

          <FeatureCard
            icon="👥"
            title={t("teamCollaborationTitle")}
            description={t("teamCollaborationDesc")}
          />

          <FeatureCard
            icon="🔒"
            title={t("secureMeetingsTitle")}
            description={t("secureMeetingsDesc")}
          />

          <FeatureCard
            icon="📅"
            title={t("scheduleMeetingsTitle")}
            description={t("scheduleMeetingsDesc")}
          />
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="pt-14 pb-8 md:py-24 px-6 md:px-8 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold">
          {t("aboutTitle")}
        </h2>

        <p className="mt-6 text-gray-400 max-w-3xl mx-auto">
          {t("aboutText")}
        </p>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-14 md:py-24 px-6 md:px-8 text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-10 md:mb-16">
          {t("pricingPlans")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-6xl mx-auto">

          {/* Basic Plan */}
          <div className={`${pricingCardClass} p-5 md:p-8 rounded-3xl border`}>
            <h3 className="text-2xl md:text-3xl font-bold">
              {t("basic")}
            </h3>

            <p className="text-4xl md:text-6xl font-bold mt-4">
              {t("free")}
            </p>

            <ul
              className={`mt-6 space-y-3 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>✓ {t("fiveMeetings")}</li>
              <li>✓ {t("hdVideoCalls")}</li>
              <li>✓ {t("chatSupport")}</li>
            </ul>

            <button
              onClick={() => navigate("/register")}
              className="mt-6 bg-cyan-400 text-black px-6 py-3 rounded-xl w-full font-semibold transition duration-300"
            >
              {t("getStarted")}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-cyan-500 p-5 md:p-8 rounded-3xl scale-100 md:scale-105 shadow-2xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
              {t("mostPopular")}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold">
              {t("pro")}
            </h3>

            <p className="text-4xl md:text-6xl font-bold mt-4">
              ₹299
              <span className="text-base md:text-lg ml-1">
                {t("month")}
              </span>
            </p>

            <ul className="mt-6 space-y-3">
              <li>✓ {t("unlimitedMeetings")}</li>
              <li>✓ {t("aiSummaries")}</li>
              <li>✓ {t("recordings")}</li>
              <li>✓ {t("teamCollaboration")}</li>
            </ul>

            <button
              onClick={() => navigate("/register")}
              className="mt-6 bg-white text-black px-6 py-3 rounded-xl w-full font-semibold transition duration-300"
            >
              {t("choosePlan")}
            </button>
          </div>

          {/* Enterprise */}
          <div className={`${pricingCardClass} p-5 md:p-8 rounded-3xl border`}>
            <h3 className="text-2xl md:text-3xl font-bold">
              {t("enterprise")}
            </h3>

            <p className="text-4xl md:text-6xl font-bold mt-4">
              ₹999
              <span className="text-base md:text-lg ml-1">
                {t("month")}
              </span>
            </p>

            <ul
              className={`mt-6 space-y-3 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>✓ {t("unlimitedUsers")}</li>
              <li>✓ {t("aiAnalytics")}</li>
              <li>✓ {t("prioritySupport")}</li>
              <li>✓ {t("advancedSecurity")}</li>
            </ul>

            <button
              onClick={() => navigate("/contact")}
              className="mt-6 bg-cyan-400 text-black px-6 py-3 rounded-xl w-full font-semibold transition duration-300"
            >
              {t("contactSales")}
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;