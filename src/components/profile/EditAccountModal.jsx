import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check, ChevronDown, Search } from "lucide-react";
import AccountLogo from "@/components/ui/AccountLogo";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function parseNum(str) {
  return parseInt(String(str).replace(/[^0-9]/g, ""), 10) || 0;
}

export default function EditAccountModal({ account, onClose, onSave }) {
  useLockBodyScroll();
  const [form, setForm] = useState({
    name: account?.name || "",
    type: account?.type || "bank",
    balance: account?.balance || 0,
    icon: account?.icon || "🏦",
    color: account?.color || "#F97316",
    institution: account?.institution || "",
    logo_url: account?.logo_url || "",
    is_default: account?.is_default || false,
  });
  const [saldoDisplay, setSaldoDisplay] = useState(
    account?.balance ? Number(account.balance).toLocaleString("id-ID") : ""
  );
  const [saving, setSaving] = useState(false);

  // Bank dropdown
  const [presets, setPresets] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const queryType = (form.type === "investment" || form.type === "investasi") ? "investasi" : form.type;
    base44.entities.DefaultAccount.filter({ type: queryType, is_active: true }, "sort_order")
      .then(res => setPresets(res || []))
      .catch(() => setPresets([]));
  }, [form.type]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  function selectPreset(preset) {
    setForm(f => ({
      ...f,
      name: preset.name,
      icon: preset.icon || f.icon,
      color: preset.color || f.color,
      institution: preset.institution || preset.name,
      logo_url: preset.logo_url || "",
    }));
    setShowDropdown(false);
    setSearch("");
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type,
      balance: form.balance,
      icon: form.icon,
      color: form.color,
      institution: form.institution,
      logo_url: form.logo_url || undefined,
      is_default: form.is_default,
    };
    const updated = await base44.entities.Account.update(account.id, payload);
    onSave(updated);
    setSaving(false);
  }

  const filteredPresets = presets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.institution || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[90]" onClick={onClose} />

      {/* Centered floating card */}
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overscroll-contain"
          style={{ maxHeight: "90dvh", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F2F4F7] flex-shrink-0">
            <div>
              <p className="font-bold text-[#1A1A1A] text-base">Edit Rekening</p>
              <p className="text-xs text-[#8FA4C8] mt-0.5">Ubah detail rekeningmu</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-[#F2F4F7] hover:bg-[#E2E8F0]">
              <X className="w-5 h-5 text-[#8FA4C8]" />
            </button>
          </div>

          {/* Form */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
            {/* Bank dropdown */}
            <div ref={dropdownRef}>
              <label className="block text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">
                Pilih Bank / Institusi
              </label>
              <button
                type="button"
                onClick={() => setShowDropdown(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-left hover:border-[#F97316] transition-colors"
              >
                {form.logo_url ? (
                  <AccountLogo
                    logoUrl={form.logo_url}
                    size="w-10 h-10"
                    fallback={
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: form.color + "20" }}>
                        <span className="text-xl">{form.icon}</span>
                      </div>
                    }
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: form.color + "20" }}>
                    <span className="text-xl">{form.icon}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{form.institution || form.name || "Pilih bank"}</p>
                  <p className="text-[10px] text-[#8FA4C8]">Tap untuk ganti</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#8FA4C8] transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div className="mt-2 border border-[#E2E8F0] rounded-xl bg-white shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-[#F2F4F7]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA4C8]" />
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari bank..."
                        className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F97316]/30"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredPresets.length === 0 ? (
                      <p className="text-xs text-[#8FA4C8] text-center py-6">Tidak ditemukan</p>
                    ) : filteredPresets.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPreset(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF7ED] transition-colors text-left"
                      >
                        {p.logo_url ? (
                          <AccountLogo
                            logoUrl={p.logo_url}
                            size="w-8 h-8"
                            fallback={
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (p.color || "#F97316") + "20" }}>
                                <span className="text-base">{p.icon || "🏦"}</span>
                              </div>
                            }
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (p.color || "#F97316") + "20" }}>
                            <span className="text-base">{p.icon || "🏦"}</span>
                          </div>
                        )}
                        <p className="text-sm font-medium text-[#1A1A1A] flex-1 truncate">{p.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nama rekening */}
            <div>
              <label className="block text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">
                Nama Rekening
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nama rekening"
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#F97316]/30"
              />
            </div>

            {/* Saldo */}
            <div>
              <label className="block text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest mb-2">
                Saldo
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8FA4C8]">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={saldoDisplay}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setSaldoDisplay(raw === "" ? "" : Number(raw).toLocaleString("id-ID"));
                    setForm(f => ({ ...f, balance: parseNum(raw) }));
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#F97316]/30"
                />
              </div>
            </div>

            {/* Toggle rekening utama */}
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Rekening Utama</p>
                <p className="text-xs text-[#8FA4C8] mt-0.5">Default saat catat transaksi</p>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
                style={{ width: 40, height: 22 }}
                className={`rounded-full transition-colors relative flex-shrink-0 ${form.is_default ? "bg-[#F97316]" : "bg-[#E2E8F0]"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_default ? "left-5" : "left-1"}`} />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pt-3 pb-5 flex-shrink-0 border-t border-[#F2F4F7]">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="w-full py-4 bg-[#F97316] text-white rounded-2xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}