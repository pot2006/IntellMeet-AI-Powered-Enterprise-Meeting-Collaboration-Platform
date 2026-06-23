import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function MeetingDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // The meeting can arrive two ways: passed directly via route state
  // (from MeetingHistory's "Details" button), or only an id if someone
  // lands here a different way (e.g. a future deep link). Handle both
  // instead of assuming state is always present.
  const passedMeeting = location.state?.meeting;
  const [meeting, setMeeting] = useState(passedMeeting || null);
  const [loading, setLoading] = useState(!passedMeeting);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (passedMeeting) return;

    const meetingId = location.state?.meetingId;
    if (!meetingId) {
      setError("No meeting selected.");
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      try {
        const res = await API.get(`/meetings/${meetingId}`);
        setMeeting(res.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load meeting");
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [passedMeeting, location.state]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "—";
    return `${minutes} Minute${minutes === 1 ? "" : "s"}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-lg text-red-400">{error || "Meeting not found"}</p>
        <button
          onClick={() => navigate("/meeting-history")}
          className="bg-cyan-500 px-5 py-2 rounded-lg"
        >
          ← Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meeting Details</h1>

        <button
          onClick={() => navigate("/meeting-history")}
          className="bg-cyan-500 px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{meeting.title}</h2>
          <span className="text-slate-400 text-sm">
            Code: {meeting.meetingCode}
          </span>
        </div>

        {meeting.description && (
          <p className="text-slate-400 mb-6">{meeting.description}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400">Date</p>
            <p>{formatDate(meeting.createdAt)}</p>
          </div>

          <div>
            <p className="text-gray-400">Duration</p>
            <p>{formatDuration(meeting.duration)}</p>
          </div>

          <div>
            <p className="text-gray-400">Participants</p>
            <p>{meeting.participants?.length || 0} Members</p>
          </div>

          <div>
            <p className="text-gray-400">Status</p>
            <p
              className={
                meeting.status === "Completed"
                  ? "text-green-400"
                  : meeting.status === "Live"
                    ? "text-red-400"
                    : "text-yellow-400"
              }
            >
              {meeting.status}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Participants List</h3>

          {meeting.participants?.length > 0 ? (
            <ul className="space-y-2">
              {meeting.participants.map((participant) => (
                <li key={participant._id}>
                  👤 {participant.name || participant.email || "Unknown"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No participants recorded.</p>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() =>
              meeting.aiSummary &&
              navigate("/ai-summary", { state: { meeting } })
            }
            disabled={!meeting.aiSummary}
            className={`px-5 py-3 rounded-lg ${
              meeting.aiSummary
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 opacity-60 cursor-not-allowed"
            }`}
          >
            AI Summary {!meeting.aiSummary && "(Pending)"}
          </button>

          <button
            onClick={() =>
              meeting.recordingUrl &&
              navigate("/recording", { state: { meeting } })
            }
            disabled={!meeting.recordingUrl}
            className={`px-5 py-3 rounded-lg ${
              meeting.recordingUrl
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-600 opacity-60 cursor-not-allowed"
            }`}
          >
            Recording {!meeting.recordingUrl && "(N/A)"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingDetails;
