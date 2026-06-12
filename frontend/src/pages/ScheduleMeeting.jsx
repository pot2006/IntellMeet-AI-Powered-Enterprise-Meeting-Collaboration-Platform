import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ScheduleMeeting() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromPage = location.state?.from || "/";

  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    participants: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setMeetingData({
      ...meetingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSchedule = () => {
    const { title, description, date, time } = meetingData;

    if (!title || !description || !date || !time) {
      setError("Please fill all required fields.");
      return;
    }

    setError("");
    setSuccess(true);

    console.log("Meeting Scheduled:", meetingData);

    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-cyan-500 p-8 rounded-2xl shadow-xl w-full max-w-lg">

        {!success ? (
          <>
            <h1 className="text-4xl font-bold text-center text-white mb-6">
              Schedule Meeting
            </h1>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <input
              type="text"
              name="title"
              placeholder="Meeting Title"
              value={meetingData.title}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4"
            />

            <textarea
              name="description"
              placeholder="Meeting Description"
              value={meetingData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4"
            />

            <input
              type="date"
              name="date"
              value={meetingData.date}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4"
            />

            <input
              type="time"
              name="time"
              value={meetingData.time}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4"
            />

            <input
              type="email"
              name="participants"
              placeholder="Participants Email"
              value={meetingData.participants}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-6"
            />

            <button
              onClick={handleSchedule}
              className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold text-white transition"
            >
              Schedule Meeting
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full mt-3 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold text-white transition"
            >
              Back
            </button>
          </>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              ✅ Meeting Scheduled
            </h2>

            <div className="bg-slate-800 p-5 rounded-xl text-left">
              <p className="mb-2">
                <strong>Meeting ID:</strong> INT-2026-001
              </p>

              <p className="mb-2">
                <strong>Title:</strong> {meetingData.title}
              </p>

              <p className="mb-2">
                <strong>Date:</strong> {meetingData.date}
              </p>

              <p>
                <strong>Time:</strong> {meetingData.time}
              </p>
            </div>

            <p className="text-gray-400 mt-4">
              Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleMeeting;