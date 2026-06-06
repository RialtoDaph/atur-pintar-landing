import { useState, useEffect } from "react";
import { Rows3, Rows2 } from "lucide-react";

/**
 * AdminDensityToggle — toggles `admin-compact` class on <html>.
 * Saved to localStorage so the choice persists across sessions.
 * In compact mode, AdminCompactStyles reduces paddings, font sizes, and spacing.
 */
export default function AdminDensityToggle() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_density") === "compact";
    setCompact(saved);
    document.documentElement.classList.toggle("admin-compact", saved);
  }, []);

  const toggle = () => {
    const next = !compact;
    setCompact(next);
    localStorage.setItem("admin_density", next ? "compact" : "comfortable");
    document.documentElement.classList.toggle("admin-compact", next);
  };

  return (
    <button
      onClick={toggle}
      title={compact ? "Mode normal" : "Mode compact"}
      aria-label={compact ? "Aktifkan mode normal" : "Aktifkan mode compact"}
      className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
    >
      {compact ? <Rows2 className="w-4 h-4" /> : <Rows3 className="w-4 h-4" />}
    </button>
  );
}