import { useNavigate } from "react-router-dom";

function AISummary() {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(`
Project Review Meeting

Frontend development is 80% complete.
Meeting Room completed.
Notifications completed.
Profile page upgraded.
Backend integration starts next week.
    `);

    alert("Summary copied!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          🤖 AI Meeting Summary
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg"
        >
          ← Dashboard
        </button>
      </div>

      {/* Meeting Info */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          📋 Meeting Information
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Meeting</p>
            <h3 className="font-bold">
              Project Review
            </h3>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Duration</p>
            <h3 className="font-bold">
              45 Minutes
            </h3>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Participants</p>
            <h3 className="font-bold">
              6 Members
            </h3>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Date</p>
            <h3 className="font-bold">
              11 June 2026
            </h3>
          </div>

        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          🧠 AI Generated Summary
        </h2>

        <p className="text-gray-300 leading-8">
          Frontend development has reached approximately 80% completion.
          The Join Meeting, Create Meeting, Notifications,
          Profile and Meeting Room modules have been completed.
          The team discussed backend integration using Node.js,
          Express.js and MongoDB. Schedule Meeting and Meeting History
          modules will be completed next.
        </p>
      </div>

      {/* Key Points */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          ✅ Key Points Discussed
        </h2>

        <ul className="space-y-3">
          <li>✔ Join Meeting completed</li>
          <li>✔ Create Meeting completed</li>
          <li>✔ Notification system completed</li>
          <li>✔ Profile page upgraded</li>
          <li>✔ Meeting Room completed</li>
          <li>✔ Backend integration planned</li>
        </ul>
      </div>

      {/* Action Items */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          🎯 Action Items
        </h2>

        <div className="space-y-3">
          <p>👨‍💻 Vimal → Complete Schedule Meeting</p>
          <p>👨‍💻 Sahil → Backend API Development</p>
          <p>👩‍💻 Shruti → Testing & Validation</p>
          <p>👨‍💻 Yogesh → Database Design</p>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          🔑 Keywords
        </h2>

        <div className="flex flex-wrap gap-3">
          <span className="bg-cyan-500 px-4 py-2 rounded-full">
            React
          </span>

          <span className="bg-cyan-500 px-4 py-2 rounded-full">
            Node.js
          </span>

          <span className="bg-cyan-500 px-4 py-2 rounded-full">
            MongoDB
          </span>

          <span className="bg-cyan-500 px-4 py-2 rounded-full">
            WebRTC
          </span>

          <span className="bg-cyan-500 px-4 py-2 rounded-full">
            Socket.io
          </span>

          <span className="bg-cyan-500 px-4 py-2 rounded-full">
            AI Summary
          </span>
        </div>
      </div>

      {/* Language */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
        <h2 className="text-2xl font-bold mb-4">
          🌐 Summary Language
        </h2>

        <select className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <option>English</option>
          <option>Hindi</option>
          <option>Hinglish</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4">

        <button
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg"
        >
          📄 Download PDF
        </button>

        <button
          onClick={handleCopy}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg"
        >
          📋 Copy Summary
        </button>

      </div>

    </div>
  );
}

export default AISummary;