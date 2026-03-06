import { useState, useEffect } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const PALETTE = ["#FF6A00","#4F7CFF","#00C9A7","#FF6B6B","#9B59B6","#E91E8C","#F5A623","#1ABC9C","#27AE60","#3498DB","#E67E22","#2C3E50"];
const EMOJIS = ["📦","🏠","🍔","🚗","❤️","🎬","🛍️","📱","💼","💻","✈️","🎓","🐾","🧴","🎁","⚡","🍕","☕","🏋️","🎮"];

export default function ManageCategoriesModal({ onClose, onUpdated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", emoji: "📦", color: "#FF6A00", type: "expense" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const cats = await base44.entities.CustomCategory.list("order");
    setCategories(cats);
    setLoading(false);
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    await base44.entities.CustomCategory.create(form);
    setForm({ name: "", emoji: "📦", color: "#FF6A00", type: "expense" });
    await load();
    onUpdated();
    setSaving(false);
  }

  async function handleDelete(id) {
    await base44.entities.CustomCategory.delete(id);
    await load();
    onUpdated();
  }

  async function handleDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const newCategories = Array.from(categories);
    const [moved] = newCategories.splice(source.index, 1);
    newCategories.splice(destination.index, 0, moved);

    // Update order for all categories
    setSaving(true);
    for (let i = 0; i < newCategories.length; i++) {
      await base44.entities.CustomCategory.update(newCategories[i].id, { order: i });
    }
    await load();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Manage Categories</h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add new */}
        <div className="bg-[#F7F6F3] rounded-2xl p-4 mb-5">
          <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-widest mb-3">New Category</p>

          {/* Emoji picker */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${form.emoji === e ? "bg-[#0A0A0A] scale-110" : "bg-white hover:bg-[#EFEFED]"}`}>
                {e}
              </button>
            ))}
          </div>

          {/* Color picker */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PALETTE.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-6 h-6 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-1 ring-[#0A0A0A] scale-110" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              placeholder="Category name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-white"
            />
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none bg-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>

          <button onClick={handleAdd} disabled={saving || !form.name.trim()}
            className="w-full py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-[#333] transition-colors">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Existing custom categories */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-[#F7F6F3] rounded-xl animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-[#9B9B9B] py-4">No custom categories yet</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-2 ${snapshot.isDraggingOver ? "bg-[#F0F0F0] rounded-xl p-2" : ""}`}
                >
                  {categories.map((cat, idx) => (
                    <Draggable key={cat.id} draggableId={cat.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between bg-[#F7F6F3] rounded-xl px-4 py-3 transition-all ${snapshot.isDragging ? "bg-[#FF6A00] shadow-lg" : ""}`}
                        >
                          <div className="flex items-center gap-2.5 flex-1">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-[#9B9B9B]">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: (cat.color || "#888") + "22" }}>
                              {cat.emoji}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${snapshot.isDragging ? "text-white" : "text-[#1A1A1A]"}`}>{cat.name}</p>
                              <p className={`text-[10px] capitalize ${snapshot.isDragging ? "text-white/70" : "text-[#9B9B9B]"}`}>{cat.type}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(cat.id)} disabled={saving} className={`transition-colors ${snapshot.isDragging ? "text-white hover:text-white/70" : "text-[#9B9B9B] hover:text-red-500"}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}