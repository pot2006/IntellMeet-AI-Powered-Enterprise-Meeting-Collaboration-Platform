import { useNavigate } from "react-router-dom";

function Recording() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          🎥 Meeting Recording
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* Recording Details */}
      <div className="bg-slate-900 rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Recording Details
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p className="text-slate-400">Meeting Name</p>
            <p className="font-semibold">Project Review Meeting</p>
          </div>

          <div>
            <p className="text-slate-400">Date</p>
            <p>10 June 2026</p>
          </div>

          <div>
            <p className="text-slate-400">Duration</p>
            <p>45 Minutes</p>
          </div>

          <div>
            <p className="text-slate-400">Participants</p>
            <p>5 Members</p>
          </div>

          <div>
            <p className="text-slate-400">File Size</p>
            <p>125 MB</p>
          </div>

          <div>
            <p className="text-slate-400">Status</p>
            <p className="text-green-400 font-semibold">
              Available
            </p>
          </div>

        </div>
      </div>

      {/* Video Preview */}
      <div className="bg-slate-900 rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Video Preview
        </h2>

        <div className="bg-black rounded-xl h-96 flex items-center justify-center border border-slate-700">
          <div className="text-center">
            <div className="text-7xl mb-4">🎬</div>
            <p className="text-slate-400">
              Recording Preview
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6">

          <button className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold">
            ▶ Play Recording
          </button>

          <button className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold">
            ⏸ Pause
          </button>

          <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">
            ⬇ Download Video
          </button>

        </div>
      </div>

      {/* Transcript & Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">

        {/* Transcript */}
        <div className="bg-slate-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            AI Transcript
          </h2>

          <div className="space-y-4 text-slate-300">

            <p>
              <span className="text-cyan-400 font-bold">
                Speaker 1:
              </span>{" "}
              Welcome everyone to today's project review meeting.
            </p>

            <p>
              <span className="text-cyan-400 font-bold">
                Speaker 2:
              </span>{" "}
              Frontend development has been completed successfully.
            </p>

            <p>
              <span className="text-cyan-400 font-bold">
                Speaker 3:
              </span>{" "}
              Backend API integration will begin next week.
            </p>

            <p>
              <span className="text-cyan-400 font-bold">
                Speaker 4:
              </span>{" "}
              Database schema has been finalized.
            </p>

          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            AI Meeting Summary
          </h2>

          <ul className="space-y-3">

            <li>✅ Frontend Development Completed</li>

            <li>✅ Analytics Dashboard Added</li>

            <li>✅ Recording Module Added</li>

            <li>⏳ Backend API Integration Pending</li>

            <li>⏳ MongoDB Database Pending</li>

            <li>📅 Next Review Meeting Scheduled</li>

          </ul>
        </div>

      </div>

      {/* Downloads */}
      <div className="bg-slate-900 rounded-xl p-6 shadow-lg mb-8">

        <h2 className="text-2xl font-bold mb-6 text-cyan-400">
          Downloads
        </h2>

        <div className="flex flex-wrap gap-4">

          <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">
            📥 Download Video
          </button>

          <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold">
            📄 Download Transcript
          </button>

          <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold">
            🤖 Download Summary PDF
          </button>

        </div>

      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">Views</p>
          <h2 className="text-3xl font-bold text-cyan-400">152</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">Downloads</p>
          <h2 className="text-3xl font-bold text-green-400">89</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">Transcript Accuracy</p>
          <h2 className="text-3xl font-bold text-yellow-400">96%</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">AI Summary Score</p>
          <h2 className="text-3xl font-bold text-purple-400">98%</h2>
        </div>

      </div>

    </div>
  );
}

export default Recording;