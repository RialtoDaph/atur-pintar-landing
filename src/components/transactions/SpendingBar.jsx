import { useMemo } from "react";

export default function SpendingBar({ transactions, categories }) {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const total = expenses.reduce((s, t) => s + (t.amount || 0), 0);
    if (total === 0) return null;

    // Helper: resolve any category key/id ke parent category
    const findCat = (key) =>
      categories.find(c => c.id === key || c.name?.toLowerCase() === key?.toLowerCase());

    const resolveParent = (key) => {
      const cat = findCat(key);
      if (!cat) return { key, cat: null };
      // Kalau subcategory, naik ke parent berdasar nama
      if (cat.is_subcategory && cat.parent_category) {
        const parent = categories.find(c => c.name?.toLowerCase() === cat.parent_category.toLowerCase() && !c.is_subcategory);
        if (parent) return { key: parent.id || parent.name, cat: parent };
      }
      return { key: cat.id || cat.name || key, cat };
    };

    // Agregasi total per PARENT category saja
    const byParent = {};
    expenses.forEach(t => {
      const rawKey = t.category || "other";
      const { key, cat } = resolveParent(rawKey);
      if (!byParent[key]) {
        byParent[key] = { amount: 0, cat, label: cat?.name || rawKey };
      }
      byParent[key].amount += t.amount || 0;
    });

    const items = Object.entries(byParent)
      .map(([key, v]) => ({
        key,
        amount: v.amount,
        pct: Math.round((v.amount / total) * 100),
        color: v.cat?.color || "#95A5A6",
        label: v.label,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    return { items, total };
  }, [transactions, categories]);

  if (!data) return null;

  return (
    <div className="px-4 pt-3 pb-2">
      {/* Bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
        {data.items.map(item => (
          <div
            key={item.key}
            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
            className="first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      {/* Legend — 2 columns grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2.5">
        {data.items.map(item => (
          <div key={item.key} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-[#8FA4C8] truncate">{item.label}</span>
            <span className="text-[11px] font-semibold text-white ml-auto flex-shrink-0">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}