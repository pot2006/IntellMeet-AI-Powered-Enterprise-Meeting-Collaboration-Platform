import { useNavigate } from "react-router-dom";

function AnalyticsDashboard() {
const navigate = useNavigate();

return ( <div className="min-h-screen bg-slate-950 text-white p-8">

  {/* Header */}
  <div className="flex justify-between items-center mb-10">
    <div>
      <h1 className="text-4xl font-bold text-cyan-400">
        Analytics Dashboard
      </h1>

      <p className="text-slate-400 mt-2">
        Meeting insights and performance overview
      </p>
    </div>

    <button
      onClick={() => navigate("/dashboard")}
      className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg"
    >
      Dashboard
    </button>
  </div>

  {/* Stats Cards */}
  <div className="grid md:grid-cols-4 gap-6 mb-10">

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">📅 Total Meetings</p>
      <h2 className="text-4xl font-bold text-cyan-400 mt-2">52</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">⏱ Meeting Hours</p>
      <h2 className="text-4xl font-bold text-green-400 mt-2">124</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">👥 Active Users</p>
      <h2 className="text-4xl font-bold text-yellow-400 mt-2">18</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">🤖 AI Summaries</p>
      <h2 className="text-4xl font-bold text-purple-400 mt-2">47</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">📌 Upcoming Meetings</p>
      <h2 className="text-4xl font-bold text-orange-400 mt-2">12</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">🎥 Recordings</p>
      <h2 className="text-4xl font-bold text-red-400 mt-2">35</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">🌐 Languages Used</p>
      <h2 className="text-4xl font-bold text-pink-400 mt-2">4</h2>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <p className="text-slate-400">⭐ Satisfaction</p>
      <h2 className="text-4xl font-bold text-green-400 mt-2">98%</h2>
    </div>

  </div>

  {/* Progress Section */}
  <div className="grid md:grid-cols-2 gap-8 mb-10">

    <div className="bg-slate-900 p-6 rounded-xl">
      <h2 className="text-xl font-bold mb-4">
        Meeting Completion Rate
      </h2>

      <div className="w-full bg-slate-700 rounded-full h-5">
        <div
          className="bg-green-500 h-5 rounded-full"
          style={{ width: "85%" }}
        />
      </div>

      <p className="mt-3 text-green-400">
        85% Completed
      </p>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <h2 className="text-xl font-bold mb-4">
        AI Usage Rate
      </h2>

      <div className="w-full bg-slate-700 rounded-full h-5">
        <div
          className="bg-cyan-500 h-5 rounded-full"
          style={{ width: "92%" }}
        />
      </div>

      <p className="mt-3 text-cyan-400">
        92% Usage
      </p>
    </div>

  </div>

  {/* Analytics Cards */}
  <div className="grid md:grid-cols-3 gap-6 mb-10">

    <div className="bg-slate-900 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-2">
        Most Active User
      </h3>

      <p className="text-cyan-400 text-2xl">
        Vimal Kumar
      </p>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-2">
        Avg Duration
      </h3>

      <p className="text-green-400 text-2xl">
        42 min
      </p>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-2">
        Success Rate
      </h3>

      <p className="text-yellow-400 text-2xl">
        98%
      </p>
    </div>

  </div>

  {/* Monthly Meetings */}
  <div className="bg-slate-900 p-6 rounded-xl mb-10">

    <h2 className="text-2xl font-bold mb-6">
      Monthly Meetings
    </h2>

    <div className="grid grid-cols-6 gap-4 items-end h-52">
      <div className="bg-cyan-500 h-20 rounded"></div>
      <div className="bg-cyan-500 h-28 rounded"></div>
      <div className="bg-cyan-500 h-40 rounded"></div>
      <div className="bg-cyan-500 h-24 rounded"></div>
      <div className="bg-cyan-500 h-48 rounded"></div>
      <div className="bg-cyan-500 h-36 rounded"></div>
    </div>

    <div className="grid grid-cols-6 text-center mt-4 text-slate-400">
      <span>Jan</span>
      <span>Feb</span>
      <span>Mar</span>
      <span>Apr</span>
      <span>May</span>
      <span>Jun</span>
    </div>

  </div>

  {/* Categories + Activity */}
  <div className="grid md:grid-cols-2 gap-8 mb-10">

    <div className="bg-slate-900 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6">
        Meeting Categories
      </h2>

      <div className="space-y-4">
        <p>Project Review - 40%</p>
        <p>Team Sync - 30%</p>
        <p>Client Calls - 20%</p>
        <p>Training - 10%</p>
      </div>
    </div>

    <div className="bg-slate-900 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-3">
        <div className="bg-slate-800 p-3 rounded">✅ Meeting Created</div>
        <div className="bg-slate-800 p-3 rounded">🤖 AI Summary Generated</div>
        <div className="bg-slate-800 p-3 rounded">🎥 Recording Downloaded</div>
        <div className="bg-slate-800 p-3 rounded">👥 New User Joined</div>
        <div className="bg-slate-800 p-3 rounded">🌐 Language Changed</div>
      </div>
    </div>

  </div>

  {/* Buttons */}
  <div className="flex gap-4 flex-wrap">

    <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg">
      📥 Export Report
    </button>

    <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg">
      📊 Download Analytics
    </button>

    <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg">
      📈 Generate AI Report
    </button>

  </div>

</div>

);
}

export default AnalyticsDashboard;
