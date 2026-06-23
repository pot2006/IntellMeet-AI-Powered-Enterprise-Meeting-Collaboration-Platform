import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
function MeetingHistory() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("All");

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesStatus = status === "All" ? true : meeting.status === status;

    return matchesSearch && matchesStatus;
  });
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/meetings/history");

        console.log(res.data);

        setMeetings(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meeting History</h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 px-5 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="🔍 Search Meeting..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 p-3 rounded-lg w-80"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-800 p-3 rounded-lg"
        >
          {" "}
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Live">Live</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Total Meetings</h3>
          <p className="text-4xl font-bold mt-2">{meetings.length}</p>{" "}
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Completed</h3>
          <p className="text-4xl font-bold mt-2">
            {meetings.filter((m) => m.status === "Completed").length}
          </p>{" "}
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Scheduled</h3>{" "}
          <p className="text-4xl font-bold mt-2">
            {meetings.filter((m) => m.status === "Scheduled").length}
          </p>{" "}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4 text-left">Meeting</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Duration</th>
              <th className="p-4 text-left">Participants</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">AI Summary</th>
              <th className="p-4 text-left">Recording</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredMeetings.map((meeting) => (
              <tr key={meeting._id} className="border-t border-slate-700">
                <td className="p-4">{meeting.title}</td>

                <td className="p-4">
                  {new Date(meeting.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                </td>

                <td className="p-4">{meeting.duration} min</td>

                <td className="p-4">{meeting.participants.length}</td>

                <td className="p-4">
                  {meeting.status === "Completed" ? (
                    <span className="text-green-400">Completed</span>
                  ) : (
                    <span className="text-yellow-400">{meeting.status}</span>
                  )}
                </td>

                <td className="p-4">
                  {meeting.aiSummary ? (
                    <button
                      onClick={() =>
                        navigate("/ai-summary", { state: { meeting } })
                      }
                      className="bg-purple-600 px-3 py-1 rounded-lg"
                    >
                      View
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-600 px-3 py-1 rounded-lg opacity-60 cursor-not-allowed"
                    >
                      Pending
                    </button>
                  )}
                </td>

                <td className="p-4">
                  {meeting.recordingUrl ? (
                    <button
                      onClick={() =>
                        navigate("/recording", { state: { meeting } })
                      }
                      className="bg-red-500 px-3 py-1 rounded-lg"
                    >
                      Watch
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-600 px-3 py-1 rounded-lg opacity-60 cursor-not-allowed"
                    >
                      N/A
                    </button>
                  )}
                </td>

                <td className="p-4">
                  <button
                    onClick={() =>
                      navigate("/meeting-details", { state: { meeting } })
                    }
                    className="bg-cyan-500 px-3 py-1 rounded-lg"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MeetingHistory;
