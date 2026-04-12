import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";

const FALLBACK_CATEGORIES = [
  { key: "food", name: "Makanan & Minuman", emoji: "🍚", color: "#FF6A00", type: "expense" },
  { key: "transport", name: "Transportasi", emoji: "🚗", color: "#3B82F6", type: "expense" },
  { key: "housing", name: "Rumah & Utilitas", emoji: "🏠", color: "#8B5CF6", type: "expense" },
  { key: "shopping", name: "Belanja", emoji: "🛒", color: "#EC4899", type: "expense" },
  { key: "health", name: "Kesehatan", emoji: "💊", color: "#10B981", type: "expense" },
  { key: "entertainment", name: "Hiburan", emoji: "🎮", color: "#F59E0B", type: "expense" },
  { key: "education", name: "Pendidikan", emoji: "📚", color: "#06B6D4", type: "expense" },
  { key: "salary", name: "Gaji", emoji: "💼", color: "#27AE60", type: "income" },
  { key: "other_income", name: "Pendapatan Lain", emoji: "💰", color: "#2ECC71", type: "income" },
  { key: "savings", name: "Tabungan", emoji: "🐷", color: "#95A5A6", type: "savings" },
  { key: "other", name: "Lainnya", emoji: "📦", color: "#95A5A6", type: "both" },
];

const INITIAL_SHOW = 8;

export default function TransactionCategories({ tab, form, setForm }) {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    base44.entities.GlobalCategory.list("sort_order").then(res => {
      const active = res.filter(c => c.is_active !== false);
      setCategories(active.length > 0 ? active : FALLBACK_CATEGORIES);
    }).catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  const filtered = categories.filter(c => c.type === tab || c.type === "both");
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hasMore = filtered.length > INITIAL_SHOW;

  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">Kategori</p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map(cat => {
          const key = cat.id ? `global_${cat.id}` : cat.key;
          const isSelected = form.category === key || form.category === cat.key;
          const color = cat.color || "#95A5A6";
          return (
            <button
              key={key}
              onClick={() => setForm(f => ({ ...f, category: key }))}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all tap-highlight-fix flex-shrink-0"
              style={isSelected
                ? { backgroundColor: color, color: "#fff" }
                : { backgroundColor: "#F2F4F7", color: "#4A5568" }
              }
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
        {hasMore && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#F2F4F7] text-[#8FA4C8] hover:bg-[#E2E8F0] transition-all tap-highlight-fix flex-shrink-0"
          >
            {showAll ? <><ChevronUp className="w-3 h-3" /> Lebih sedikit</> : <><ChevronDown className="w-3 h-3" /> Lainnya ({filtered.length - INITIAL_SHOW})</>}
          </button>
        )}
      </div>
    </div>
  );
}

// Export fallback categories so other components can use them
export { FALLBACK_CATEGORIES };