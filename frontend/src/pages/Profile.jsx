import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
        setName(res.data.name);

        // Keep localStorage's cached user in sync, since other pages
        // (MeetingRoom, JoinMeeting, etc.) read the display name from
        // localStorage rather than re-fetching it every time.
        const cached = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...cached, ...res.data }),
        );
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await API.put("/auth/me", { name: name.trim() });
      setUser(res.data);

      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...cached, ...res.data }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400">{error || "Could not load profile"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg"
        >
          ← Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-cyan-500 p-8 rounded-2xl shadow-xl w-[450px]">
        <h1 className="text-4xl font-bold text-center text-white mb-6">
          User Profile
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center text-4xl font-bold text-white">
            {(name || user.email || "?").charAt(0).toUpperCase()}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Name — editable */}
        <label className="text-gray-300 font-semibold">Name</label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
        />

        {/* Email — read-only. Changing the account's login identifier
            isn't something to bundle into a casual profile save; it
            needs its own deliberate, verified flow. */}
        <label className="text-gray-300 font-semibold mt-4 block">Email</label>

        <div className="mt-2 bg-slate-800/60 p-3 rounded-lg text-gray-400 border border-slate-700">
          {user.email}
        </div>

        {/* Role — read-only. This is an account property, not a
            self-reported title; letting users set their own role would
            mean anyone could declare themselves "Admin". */}
        <label className="text-gray-300 font-semibold mt-4 block">Role</label>

        <div className="mt-2 bg-slate-800 p-3 rounded-lg text-cyan-400 font-semibold">
          {user.role || "Member"}
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mt-4 bg-green-600 text-white text-center py-2 rounded-lg">
            Profile Updated Successfully ✅
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`py-3 rounded-lg font-semibold text-white ${
              saving
                ? "bg-green-700 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg font-semibold text-white"
          >
            ← Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
