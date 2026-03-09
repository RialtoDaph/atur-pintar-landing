import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ShieldAlert, Pencil, Trash2, Check, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ENTITY_LABELS = {
  Transaction: { label: "Transaksi", emoji: "💸" },
  SavingsGoal: { label: "Tabungan", emoji: "🎯" },
  Budget: { label: "Budget", emoji: "📊" },
  Debt: { label: "Utang", emoji: "💳" },
  Reminder: { label: "Pengingat", emoji: "🔔" },
};

const ENTITY_DISPLAY_FIELDS = {
  Transaction: ["date", "amount", "type", "category", "note"],
  SavingsGoal: ["name", "target_amount", "current_amount", "status", "deadline"],
  Budget: ["category", "amount", "month"],
  Debt: ["name", "total_amount", "remaining_amount", "type", "status"],
  Reminder: ["title", "type", "amount", "due_day", "is_active"],
};

function EditableRow({ record, fields, entity, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...record });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleSave() {
    setSaving(true);
    await base44.functions.invoke('adminMutateEntity', {
      operation: 'update', entity, id: record.id,
      data: Object.fromEntries(fields.map(f => [f, form[f]])),
    });
    setSaving(false);
    setEditing(false);
    onSave();
  }

  async function handleDelete() {
    if (!confirm("Yakin hapus data ini?")) return;
    await base44.functions.invoke('adminMutateEntity', { operation: 'delete', entity, id: record.id });
    onDelete();
  }

  const displayVal = (f) => {
    const v = record[f];
    if (v === null || v === undefined) return <span className="text-[#CBD5E0]">—</span>;
    if (typeof v === 'boolean') return v ? '✅' : '❌';
    if (typeof v === 'number') return v.toLocaleString('id-ID');
    return String(v);
  };

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC]">
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-2 text-left">
          {expanded ? <ChevronUp className="w-4 h-4 text-[#8FA4C8]" /> : <ChevronDown className="w-4 h-4 text-[#8FA4C8]" />}
          <span className="text-sm font-semibold text-[#1A1A1A] truncate">
            {record.name || record.title || record.note || record.category || record.id?.slice(0, 8)}
          </span>
          {record.date && <span className="text-xs text-[#8FA4C8] ml-auto">{record.date}</span>}
          {record.amount != null && <span className="text-xs text-[#FF6A00] font-semibold ml-1">{Number(record.amount).toLocaleString('id-ID')}</span>}
        </button>
        <button onClick={() => { setEditing(true); setExpanded(true); }} className="p-1.5 rounded-lg hover:bg-[#E2E8F0] text-[#8FA4C8]">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div className="border-t border-[#E2E8F0] px-4 py-3 space-y-2 bg-white">
          {fields.map(f => (
            <div key={f} className="flex items-center gap-3">
              <p className="text-xs text-[#8FA4C8] w-28 flex-shrink-0 font-medium">{f}</p>
              {editing ? (
                <input
                  className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
                  value={form[f] ?? ""}
                  onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                />
              ) : (
                <p className="text-xs text-[#1A1A1A] flex-1">{displayVal(f)}</p>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00C9A7] text-white text-xs font-bold hover:bg-[#00b396] transition-colors disabled:opacity-50">
                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
                Simpan
              </button>
              <button onClick={() => { setEditing(false); setForm({ ...record }); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F2F4F7] text-[#4A5568] text-xs font-bold hover:bg-[#E2E8F0] transition-colors">
                <X className="w-3 h-3" /> Batal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminUserSupport() {
  const [currentUser, setCurrentUser] = useState(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Transaction");
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (u?.role === 'admin') loadUsers();
    }).catch(() => {});
  }, []);

  // Read email from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (email) {
      setTargetEmail(email);
      setSearchInput(email);
      loadUserData(email);
    }
  }, []);

  async function loadUsers() {
    const res = await base44.functions.invoke('adminGetUsers', {});
    setUsersList(res.data?.users || []);
  }

  async function loadUserData(email) {
    if (!email) return;
    setLoading(true);
    setData(null);
    const res = await base44.functions.invoke('adminGetUserData', { user_email: email });
    setData(res.data);
    setLoading(false);
  }

  async function handleSearch(e) {
    e.preventDefault();
    setTargetEmail(searchInput);
    loadUserData(searchInput);
  }

  const activeRecords = data?.[activeTab === 'Transaction' ? 'transactions'
    : activeTab === 'SavingsGoal' ? 'goals'
    : activeTab === 'Budget' ? 'budgets'
    : activeTab === 'Debt' ? 'debts'
    : 'reminders'] || [];

  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="w-10 h-10 text-red-500" />
        <p className="text-[#1A1A1A] font-bold">Akses Ditolak</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-10">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-5 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <Link to={createPageUrl("AdminPanel")} className="flex items-center gap-2 text-[#8FA4C8] text-sm mb-3 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Panel
          </Link>
          <p className="text-[#8FA4C8] text-sm font-medium">Support Mode</p>
          <h1 className="text-white text-2xl font-bold mt-0.5">Data Pengguna</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 mt-6 space-y-4">
        {/* Search User */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest mb-3">Cari Pengguna</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              placeholder="Masukkan email pengguna..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              list="users-list"
              className="flex-1 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] bg-[#F8FAFC]"
            />
            <datalist id="users-list">
              {usersList.map(u => <option key={u.id} value={u.email}>{u.full_name}</option>)}
            </datalist>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white text-sm font-bold hover:bg-[#e05e00] transition-colors">
              Buka
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {data && targetEmail && (
          <>
            {/* User info banner */}
            <div className="bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-2xl px-5 py-4">
              <p className="text-xs text-[#FF6A00] font-bold uppercase tracking-widest mb-1">Sedang melihat data</p>
              <p className="font-bold text-[#1A1A1A]">{targetEmail}</p>
              <p className="text-xs text-[#8FA4C8] mt-0.5">Semua perubahan bersifat permanen</p>
            </div>

            {/* Entity tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Object.entries(ENTITY_LABELS).map(([key, { label, emoji }]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === key ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[#4A5568] hover:bg-[#F2F4F7]'
                  }`}
                >
                  <span>{emoji}</span>
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20 text-white' : 'bg-[#F2F4F7] text-[#8FA4C8]'}`}>
                    {(data?.[activeTab === key ? (
                      key === 'Transaction' ? 'transactions' :
                      key === 'SavingsGoal' ? 'goals' :
                      key === 'Budget' ? 'budgets' :
                      key === 'Debt' ? 'debts' : 'reminders'
                    ) : (
                      key === 'Transaction' ? 'transactions' :
                      key === 'SavingsGoal' ? 'goals' :
                      key === 'Budget' ? 'budgets' :
                      key === 'Debt' ? 'debts' : 'reminders'
                    )])?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Records */}
            <div className="space-y-2">
              {activeRecords.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#8FA4C8]">
                  Tidak ada data {ENTITY_LABELS[activeTab]?.label}
                </div>
              ) : (
                activeRecords.map(record => (
                  <EditableRow
                    key={record.id}
                    record={record}
                    fields={ENTITY_DISPLAY_FIELDS[activeTab]}
                    entity={activeTab}
                    onSave={() => loadUserData(targetEmail)}
                    onDelete={() => loadUserData(targetEmail)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}