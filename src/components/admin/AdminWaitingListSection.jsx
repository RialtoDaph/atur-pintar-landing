import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Mail, MessageCircle, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import WaitingListMobileCard from "@/components/admin/WaitingListMobileCard";

const INTEREST_BADGES = {
  "Ya": { bg: "bg-green-100", text: "text-green-700", label: "Ya" },
  "Mungkin": { bg: "bg-yellow-100", text: "text-yellow-700", label: "Mungkin" },
  "Belum yakin": { bg: "bg-gray-100", text: "text-gray-700", label: "Belum yakin" },
};

export default function AdminWaitingListSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterInterest, setFilterInterest] = useState("Semua");
  const [filterInvited, setFilterInvited] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviting, setInviting] = useState({});
  const [deleting, setDeleting] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  useEffect(() => {
    loadWaitingList();
  }, []);

  async function loadWaitingList() {
    setLoading(true);
    try {
      const data = await base44.entities.WaitingList.list().catch(() => []);
      setList(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Filter logic
  let filtered = list;
  if (filterInterest !== "Semua") {
    filtered = filtered.filter(w => w.early_access_interest === filterInterest);
  }
  if (filterInvited === "Sudah") {
    filtered = filtered.filter(w => w.invited === true);
  } else if (filterInvited === "Belum") {
    filtered = filtered.filter(w => w.invited !== true);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(w => 
      (w.name || "").toLowerCase().includes(q) || (w.email || "").toLowerCase().includes(q)
    );
  }

  // Stats
  const totalCount = list.length;
  const yaCount = list.filter(w => w.early_access_interest === "Ya").length;
  const mungkinCount = list.filter(w => w.early_access_interest === "Mungkin").length;
  const belumCount = list.filter(w => w.early_access_interest === "Belum yakin").length;
  const invitedCount = list.filter(w => w.invited === true).length;
  
  // Top cities
  const cityMap = {};
  list.forEach(w => {
    if (w.city) {
      cityMap[w.city] = (cityMap[w.city] || 0) + 1;
    }
  });
  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  async function handleSendInvite(id) {
    if (inviting[id]) return;
    setInviting(prev => ({ ...prev, [id]: true }));
    try {
      await base44.entities.WaitingList.update(id, {
        invited: true,
        invited_at: new Date().toISOString(),
      });
      setList(prev => prev.map(w => w.id === id ? { ...w, invited: true, invited_at: new Date().toISOString() } : w));
    } finally {
      setInviting(prev => ({ ...prev, [id]: false }));
    }
  }

  async function handleDeleteRecord(id) {
    setConfirmDelete(null);
    setDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await base44.entities.WaitingList.delete(id);
      setList(prev => prev.filter(w => w.id !== id));
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  }

  async function handleDeleteTestData() {
    setConfirmDeleteAll(false);
    setLoading(true);
    try {
      const testRecords = list.filter(w => {
        const name = (w.name || "").toLowerCase();
        const email = (w.email || "").toLowerCase();
        return (
          name.includes("test") ||
          name.includes("rialto") ||
          email.includes("test@") ||
          email.includes("altodaphino")
        );
      });

      for (const record of testRecords) {
        await base44.entities.WaitingList.delete(record.id);
      }

      setList(prev => prev.filter(w => !testRecords.some(t => t.id === w.id)));
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function formatWhatsApp(phone) {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
    if (!cleaned.startsWith("62")) cleaned = "62" + cleaned;
    return `https://wa.me/${cleaned}`;
  }

  function exportCSV() {
    const headers = ["Tanggal", "Nama", "Email", "WhatsApp", "Kota", "Pekerjaan", "Cara Mencatat", "Minat Early Access", "Masalah Finansial", "Sudah Diinvite"];
    const rows = list.map(w => [
      format(new Date(w.created_date), "dd/MM/yyyy"),
      w.name || "",
      w.email || "",
      w.whatsapp || "",
      w.city || "",
      w.job || "",
      w.current_finance_tracking_method || "",
      w.early_access_interest || "",
      w.biggest_money_problem || "",
      w.invited ? "Ya" : "Tidak",
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `waiting_list_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    link.click();
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-6 gap-2">
        <h2 className="text-lg font-bold text-[#1A1A1A]">Waiting List</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmDeleteAll(true)}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hapus Test</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-[#F97316] text-white text-sm font-medium rounded-lg hover:bg-[#e05e00] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalCount}</p>
          <p className="text-xs text-blue-700 font-medium mt-1">Total Pendaftar</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-green-600">{yaCount}</p>
          <p className="text-xs text-green-700 font-medium mt-1">Ya</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">{mungkinCount}</p>
          <p className="text-xs text-yellow-700 font-medium mt-1">Mungkin</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-600">{belumCount}</p>
          <p className="text-xs text-gray-700 font-medium mt-1">Belum Yakin</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-purple-600">{invitedCount}</p>
          <p className="text-xs text-purple-700 font-medium mt-1">Sudah Diinvite</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <p className="text-xs font-bold text-orange-600 leading-tight">
            {topCities.map((c, i) => (
              <span key={i}>{c[0]} ({c[1]}){i < topCities.length - 1 ? " • " : ""}</span>
            ))}
          </p>
          <p className="text-xs text-orange-700 font-medium mt-1">Top Kota</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
        />
        <select
          value={filterInterest}
          onChange={(e) => setFilterInterest(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
        >
          <option>Semua</option>
          <option>Ya</option>
          <option>Mungkin</option>
          <option>Belum yakin</option>
        </select>
        <select
          value={filterInvited}
          onChange={(e) => setFilterInvited(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#F97316]"
        >
          <option>Semua</option>
          <option>Sudah</option>
          <option>Belum</option>
        </select>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <p className="text-center py-8 text-[#8FA4C8] text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-[#8FA4C8] text-sm">Tidak ada data</p>
        ) : (
          filtered.map(w => (
            <WaitingListMobileCard
              key={w.id}
              item={w}
              inviting={!!inviting[w.id]}
              deleting={!!deleting[w.id]}
              onInvite={handleSendInvite}
              onDelete={(id) => setConfirmDelete(id)}
              onCopy={copyToClipboard}
              formatWhatsApp={formatWhatsApp}
            />
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Tanggal</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Nama</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Email</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">WhatsApp</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Kota</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Pekerjaan</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Cara</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Early Access</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Masalah</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-[#4A5568]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="text-center py-8 text-[#8FA4C8]">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-8 text-[#8FA4C8]">Tidak ada data</td></tr>
            ) : (
              filtered.map(w => (
                <tr key={w.id} className="border-b border-[#F2F4F7] hover:bg-[#F8FAFC]">
                  <td className="px-3 py-2 text-[#4A5568]">{format(new Date(w.created_date), "dd/MM/yy")}</td>
                  <td className="px-3 py-2 font-medium text-[#1A1A1A]">{w.name || "-"}</td>
                  <td className="px-3 py-2 text-[#4A5568] text-xs truncate max-w-[120px]">{w.email || "-"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => copyToClipboard(w.whatsapp || "")}
                      className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                      title={w.whatsapp}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                  </td>
                  <td className="px-3 py-2 text-[#4A5568] text-xs">{w.city || "-"}</td>
                  <td className="px-3 py-2 text-[#4A5568] text-xs">{w.job || "-"}</td>
                  <td className="px-3 py-2 text-[#4A5568] text-xs">{w.current_finance_tracking_method || "-"}</td>
                  <td className="px-3 py-2">
                    {w.early_access_interest && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${INTEREST_BADGES[w.early_access_interest]?.bg} ${INTEREST_BADGES[w.early_access_interest]?.text}`}>
                        {INTEREST_BADGES[w.early_access_interest]?.label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[#4A5568] text-xs">{w.biggest_money_problem || "-"}</td>
                  <td className="px-3 py-2">
                    {w.invited ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Sudah</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">Belum</span>
                    )}
                  </td>
                  <td className="px-3 py-2 flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(w.email || "")}
                      className="p-1 hover:bg-[#F2F4F7] rounded transition-colors"
                      title="Copy email"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#8FA4C8]" />
                    </button>
                    <a
                      href={formatWhatsApp(w.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                      title="Open WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                    </a>
                    <button
                      onClick={() => handleSendInvite(w.id)}
                      disabled={w.invited || inviting[w.id]}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        w.invited ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#F97316] text-white hover:bg-[#e05e00]"
                      }`}
                    >
                      {inviting[w.id] ? "..." : "Invite"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(w.id)}
                      disabled={deleting[w.id]}
                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete"
                    >
                      {deleting[w.id] ? <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#1A1A1A]">Yakin hapus data ini?</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-[#4A5568]">Data yang dihapus tidak dapat dipulihkan.</p>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-[#F2F4F7] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E2E8F0] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteRecord(confirmDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Test Data Confirmation Dialog */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#1A1A1A]">Yakin hapus semua data test?</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-[#4A5568]">Akan menghapus semua record dengan nama/email mengandung "test", "rialto", atau "altodaphino".</p>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-2">
              <button
                onClick={() => setConfirmDeleteAll(false)}
                className="flex-1 px-4 py-2 bg-[#F2F4F7] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E2E8F0] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTestData}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}