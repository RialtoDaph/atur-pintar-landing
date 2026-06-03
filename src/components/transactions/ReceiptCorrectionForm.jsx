import { useState } from "react";
import { Pencil, Check, X, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

export default function ReceiptCorrectionForm({ receiptData, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...receiptData });

  function handleSave() {
    onChange(form);
    setEditing(false);
  }

  function handleCancel() {
    setForm({ ...receiptData });
    setEditing(false);
  }

  function updateItem(i, field, value) {
    const newItems = [...form.items];
    newItems[i] = { ...newItems[i], [field]: field === "name" ? value : Number(value) || 0 };
    setForm(f => ({ ...f, items: newItems }));
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...(f.items || []), { name: "", price: 0, quantity: 1, allocated_to: [] }] }));
  }

  function removeItem(i) {
    const newItems = form.items.filter((_, idx) => idx !== i);
    setForm(f => ({ ...f, items: newItems }));
  }

  function recalcTotal() {
    const total = (form.items || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setForm(f => ({ ...f, total_amount: total }));
  }

  return (
    <div className="mt-3">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs text-[#8FA4C8] hover:text-[#F97316] transition-colors font-medium"
        >
          <Pencil className="w-3 h-3" />
          Koreksi data struk
        </button>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mt-2 space-y-3">
          <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">Koreksi Data Struk</p>

          {/* Store name */}
          <div>
            <label className="text-[10px] text-[#8FA4C8] font-semibold uppercase tracking-widest mb-1 block">Nama Toko</label>
            <input
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC]"
              value={form.store_name}
              onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))}
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] text-[#8FA4C8] font-semibold uppercase tracking-widest mb-1 block">Tanggal</label>
            <input
              type="date"
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC]"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Total amount */}
          <div>
            <label className="text-[10px] text-[#8FA4C8] font-semibold uppercase tracking-widest mb-1 block">Total Tagihan (Rp)</label>
            <input
              type="number"
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC]"
              value={form.total_amount}
              onChange={e => setForm(f => ({ ...f, total_amount: Number(e.target.value) || 0 }))}
            />
          </div>

          {/* Tax */}
          <div>
            <label className="text-[10px] text-[#8FA4C8] font-semibold uppercase tracking-widest mb-1 block">Pajak/PPN (Rp)</label>
            <input
              type="number"
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-[#F8FAFC]"
              value={form.tax_amount}
              onChange={e => setForm(f => ({ ...f, tax_amount: Number(e.target.value) || 0 }))}
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-[#8FA4C8] font-semibold uppercase tracking-widest">Item ({(form.items || []).length})</label>
              <button onClick={() => setExpanded(e => !e)} className="text-[#8FA4C8] hover:text-[#1A1A1A]">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {expanded && (
              <div className="space-y-2 mt-2">
                {(form.items || []).map((item, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input
                      className="flex-1 border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#F97316] bg-[#F8FAFC]"
                      placeholder="Nama item"
                      value={item.name}
                      onChange={e => updateItem(i, "name", e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-20 border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#F97316] bg-[#F8FAFC]"
                      placeholder="Harga"
                      value={item.price}
                      onChange={e => updateItem(i, "price", e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-12 border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#F97316] bg-[#F8FAFC]"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                    />
                    <button onClick={() => removeItem(i)} className="text-[#FF6B6B] hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-[#8FA4C8] hover:text-[#1A1A1A] font-medium">
                    <Plus className="w-3 h-3" /> Tambah item
                  </button>
                  <button onClick={recalcTotal} className="flex items-center gap-1 text-xs text-[#F97316] hover:text-orange-600 font-medium ml-auto">
                    Hitung ulang total
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#333] transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan Koreksi
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#4A5568] hover:bg-[#F8FAFC] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}