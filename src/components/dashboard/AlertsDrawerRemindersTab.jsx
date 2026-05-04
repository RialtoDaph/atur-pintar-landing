import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, Check, ToggleLeft, Bell } from "lucide-react";
import AddReminderModal from "@/components/reminders/AddReminderModal";
import { useAppSettings } from "@/components/utils/useAppSettings";

const TYPE_CONFIG = {
  tagihan: { label: "Tagihan", emoji: "🧾", color: "#FF6B6B" },
  lainnya: { label: "Lainnya", emoji: "📌", color: "#F5A623" },
};

function getDaysUntilDue(dueDay) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const clampedDay = Math.min(dueDay, maxDay);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), clampedDay);
  if (thisMonth <= today) {
    const nextMaxDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    const nextDay = Math.min(dueDay, nextMaxDay);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, nextDay);
    return Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((thisMonth - today) / (1000 * 60 * 60 * 24));
}

async function findLinkedRecurringTx(title, userEmail) {
  const all = await base44.entities.Transaction.filter({
    is_recurring: true,
    created_by: userEmail,
  });
  return all.find(t => !t.is_recurring_child && t.note === title && t.type === "expense");
}

export default function AlertsDrawerRemindersTab({ user, reminders, onReload }) {
  const { t, formatCurrency } = useAppSettings();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const activeReminders = reminders.filter(r => r.is_active && r.last_dismissed_month !== currentMonth);
  const dismissedThisMonth = reminders.filter(r => r.last_dismissed_month === currentMonth);
  const inactive = reminders.filter(r => !r.is_active);
  const upcomingReminders = [...activeReminders].sort((a, b) => getDaysUntilDue(a.due_day) - getDaysUntilDue(b.due_day));
  const totalDue = activeReminders.reduce((s, r) => s + (r.amount || 0), 0);

  async function toggleActive(r) {
    await base44.entities.Reminder.update(r.id, { is_active: !r.is_active });
    onReload();
  }

  async function dismissThisMonth(r) {
    await base44.entities.Reminder.update(r.id, { last_dismissed_month: currentMonth });
    onReload();
  }

  async function deleteReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder && user?.email) {
      const linkedTx = await findLinkedRecurringTx(reminder.title, user.email);
      if (linkedTx) await base44.entities.Transaction.delete(linkedTx.id);
    }
    await base44.entities.Reminder.delete(id);
    setDeleteConfirm(null);
    onReload();
  }

  return (
    <div className="space-y-3">
      {/* Add button */}
      <button
        onClick={() => { setEditing(null); setShowAdd(true); }}
        className="w-full bg-[#FF6A00] text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{ boxShadow: '0 4px 16px rgba(255,106,0,0.3)' }}
      >
        <Plus className="w-4 h-4" /> Tambah Pengingat
      </button>

      {/* Summary */}
      {activeReminders.length > 0 && (
        <div className="bg-[#FF6A00] rounded-2xl p-3 text-white">
          <p className="text-[10px] opacity-80 font-medium uppercase tracking-wide">Total Aktif</p>
          <p className="text-lg font-bold mt-0.5">{formatCurrency(totalDue)}</p>
          <p className="text-[10px] opacity-70 mt-0.5">{activeReminders.length} pengingat aktif</p>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <Bell className="w-8 h-8 text-[#E2E8F0] mx-auto mb-2" />
          <p className="text-[#1A1A1A] font-semibold text-sm">Belum ada pengingat</p>
          <p className="text-[#8FA4C8] text-xs mt-1">Tambahkan tagihan atau cicilan</p>
        </div>
      )}

      {/* Upcoming */}
      {upcomingReminders.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 px-1">Akan Datang</p>
          <div className="space-y-2">
            {upcomingReminders.map(r => {
              const daysLeft = getDaysUntilDue(r.due_day);
              const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.lainnya;
              const urgent = daysLeft <= 3;
              return (
                <div key={r.id} className={`bg-white rounded-2xl p-3 shadow-sm border-l-4 ${urgent ? "border-[#FF6B6B]" : "border-transparent"}`}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: cfg.color + "20" }}>
                      {r.icon || cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[#0A0A0A] text-sm truncate">{r.title}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${urgent ? "bg-[#FF6B6B]/10 text-[#FF6B6B]" : "bg-[#F2F4F7] text-[#8FA4C8]"}`}>
                          {daysLeft === 0 ? "Hari ini" : daysLeft === 1 ? "Besok" : `${daysLeft}h`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8FA4C8] mt-0.5">
                        Tgl {r.due_day} {r.amount ? `· ${formatCurrency(r.amount)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button onClick={() => dismissThisMonth(r)} className="flex items-center gap-1 text-[10px] text-[#00C9A7] font-semibold bg-[#00C9A7]/10 px-2 py-1 rounded-lg hover:bg-[#00C9A7]/20 transition-colors">
                      <Check className="w-3 h-3" /> Lunas
                    </button>
                    <button onClick={() => { setEditing(r); setShowAdd(true); }} className="flex items-center gap-1 text-[10px] text-[#8FA4C8] font-medium px-2 py-1 rounded-lg hover:bg-[#F2F4F7] transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(r.id)} className="flex items-center gap-1 text-[10px] text-[#FF6B6B] font-medium px-2 py-1 rounded-lg hover:bg-[#FF6B6B]/10 transition-colors ml-auto">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dismissed this month */}
      {dismissedThisMonth.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 px-1">Lunas Bulan Ini</p>
          <div className="space-y-2">
            {dismissedThisMonth.map(r => {
              const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.lainnya;
              return (
                <div key={r.id} className="bg-white rounded-2xl p-3 shadow-sm opacity-60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: cfg.color + "15" }}>
                      {r.icon || cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0A0A0A] text-xs line-through truncate">{r.title}</p>
                      <p className="text-[10px] text-[#8FA4C8]">{r.amount ? formatCurrency(r.amount) : cfg.label}</p>
                    </div>
                    <Check className="w-4 h-4 text-[#00C9A7]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#8FA4C8] uppercase tracking-widest mb-2 px-1">Tidak Aktif</p>
          <div className="space-y-2">
            {inactive.map(r => {
              const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.lainnya;
              return (
                <div key={r.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2.5 opacity-50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: cfg.color + "15" }}>
                    {r.icon || cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0A0A0A] text-xs truncate">{r.title}</p>
                    <p className="text-[10px] text-[#8FA4C8]">Tgl {r.due_day}</p>
                  </div>
                  <button onClick={() => toggleActive(r)} className="text-[#8FA4C8] hover:text-[#FF6A00] transition-colors">
                    <ToggleLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(r.id)} className="text-[#FF6B6B]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm w-full">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-4">Hapus pengingat ini?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#8FA4C8] hover:bg-[#F2F4F7] transition-colors">Batal</button>
              <button onClick={() => deleteReminder(deleteConfirm)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#FF6B6B] hover:bg-[#FF5252] transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showAdd && (
        <AddReminderModal
          reminder={editing}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSave={async (data) => {
            const { create_recurring_tx, ...reminderData } = data;
            if (editing) {
              await base44.entities.Reminder.update(editing.id, reminderData);
              if (reminderData.amount && user?.email) {
                const linkedTx = await findLinkedRecurringTx(editing.title, user.email);
                if (linkedTx) {
                  await base44.entities.Transaction.update(linkedTx.id, {
                    amount: reminderData.amount,
                    note: reminderData.title,
                  });
                }
              }
            } else {
              await base44.entities.Reminder.create(reminderData);
              if (create_recurring_tx && reminderData.amount) {
                const now = new Date();
                const dueDate = new Date(now.getFullYear(), now.getMonth(), reminderData.due_day);
                if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);
                await base44.entities.Transaction.create({
                  amount: reminderData.amount,
                  type: "expense",
                  category: "bills",
                  note: reminderData.title,
                  date: dueDate.toISOString().split("T")[0],
                  is_recurring: true,
                  recurring_interval: "monthly",
                });
              }
            }
            setShowAdd(false);
            setEditing(null);
            onReload();
          }}
        />
      )}
    </div>
  );
}