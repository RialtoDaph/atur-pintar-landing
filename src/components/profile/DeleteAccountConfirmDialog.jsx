import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Type-to-confirm modal for irreversible account deletion.
 * User must type "HAPUS" exactly before the confirm button enables.
 *
 * Style matches the existing ProfileSettings "Delete Account" alert dialog
 * (white rounded-2xl card, red accents, mobile-first padding).
 */
export default function DeleteAccountConfirmDialog({ open, onCancel, onConfirm, loading }) {
  const [typed, setTyped] = useState("");

  // Reset the input whenever the dialog reopens
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  if (!open) return null;

  const isMatch = typed.trim().toUpperCase() === "HAPUS";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="font-bold text-[#1A1A1A]">Hapus Akun Selamanya?</p>
        </div>

        <p className="text-sm text-[#4A5568] mb-3">
          Tindakan ini <span className="font-semibold text-red-600">tidak dapat dibatalkan</span>.
          Semua data akan dihapus permanen:
        </p>
        <ul className="text-xs text-[#4A5568] mb-4 space-y-1 list-disc list-inside">
          <li>Transaksi, rekening, & saldo</li>
          <li>Goal tabungan & utang</li>
          <li>Riwayat Nana AI & pengaturan</li>
          <li>Langganan premium (tidak ada refund)</li>
        </ul>

        <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
          Ketik <span className="font-bold text-red-600">HAPUS</span> untuk konfirmasi
        </label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="HAPUS"
          autoComplete="off"
          autoCapitalize="characters"
          className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-mono tracking-wider text-[#1A1A1A] focus:outline-none focus:border-red-500 mb-5"
        />

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4A5568] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={!isMatch || loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Menghapus..." : "Hapus Akun"}
          </button>
        </div>
      </div>
    </div>
  );
}