import { useTheme } from "../context/ThemeContext";

function FeatureCard({ title, description, icon }) {
  const { theme } = useTheme();

  return (
    <div
      className={`p-6 md:p-8 rounded-3xl ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black border border-gray-300"
      }`}
    >
      <div className="text-4xl mb-4">{icon}</div>

      <h3 className="text-2xl font-bold mb-3">
        {title}
      </h3>

      <p
        className={
          theme === "dark"
            ? "text-gray-400"
            : "text-gray-600"
        }
      >
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;