import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../services/api";

function CreateMeeting() {
  const navigate = useNavigate();
  const location = useLocation();

  // FIX: Home.jsx (and any other page) passes `from` so MeetingRoom
  // knows where "Leave call" should return to. CreateMeeting was never
  // reading this value, so it never made it into the navigate() call
  // below — MeetingRoom's `location.state?.from || "/dashboard"`
  // fallback always won, regardless of where the user actually started.
  const fromPage = location.state?.from || "/dashboard";

  const [meetingTitle, setMeetingTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [meetingType, setMeetingType] = useState("Private");

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      alert("Please enter Meeting Title");
      return;
    }

    try {
      const res = await API.post("/meetings", {
        title: meetingTitle,
        description,
        date: meetingDate,
        type: meetingType
      });

      navigate("/meetingroom", {
        state: {
          meetingId: res.data._id,
          meetingTitle: res.data.title,
          description: res.data.description,
          // FIX: forward the original origin page through to MeetingRoom.
          from: fromPage,
        },
      });
    } catch (error) {
      console.log(error);
      alert("Failed to create meeting");
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Create Meeting
        </h1>

        {/* Meeting Title */}
        <input
          type="text"
          placeholder="Meeting Title"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4 focus:outline-none focus:border-cyan-500"
        />

        {/* Description */}
        <textarea
          placeholder="Meeting Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-24 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4 focus:outline-none focus:border-cyan-500"
        />

        {/* Date & Time */}
        <DatePicker
          selected={meetingDate}
          onChange={(date) => setMeetingDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={1}
          dateFormat="dd-MM-yyyy HH:mm"
          shouldCloseOnSelect
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4"
        />

        {/* Meeting Type */}
        <select
          value={meetingType}
          onChange={(e) => setMeetingType(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-4 focus:outline-none focus:border-cyan-500"
        >
          <option>Private</option>
          <option>Public</option>
        </select>

        {/* Meeting ID */}

        {/* Create Button */}
        <button
          onClick={handleCreateMeeting}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg font-bold text-white transition"
        >
          Create Meeting
        </button>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold text-white transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default CreateMeeting;
