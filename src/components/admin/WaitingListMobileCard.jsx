import { Copy, MessageCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

const INTEREST_BADGES = {
  "Ya": { bg: "bg-green-100", text: "text-green-700" },
  "Mungkin": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "Belum yakin": { bg: "bg-gray-100", text: "text-gray-700" },
};

export default function WaitingListMobileCard({
  item,
  inviting,
  deleting,
  onInvite,
  onDelete,
  onCopy,
  formatWhatsApp,
}) {
  const w = item;
  const interest = INTEREST_BADGES[w.early_access_interest];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-sm">
      {/* Top row: name + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-[#1A1A1A] truncate">{w.name || "-"}</p>
          <p className="text-xs text-[#8FA4C8] truncate">{w.email || "-"}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {interest && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${interest.bg} ${interest.text}`}>
              {w.early_access_interest}
            </span>
          )}
          {w.invited ? (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">Diinvite</span>
          ) : (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">Belum</span>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-2">
        <div>
          <span className="text-[#8FA4C8]">Kota:</span>{" "}
          <span className="text-[#1A1A1A] font-medium">{w.city || "-"}</span>
        </div>
        <div>
          <span className="text-[#8FA4C8]">Tanggal:</span>{" "}
          <span className="text-[#1A1A1A] font-medium">{format(new Date(w.created_date), "dd/MM/yy")}</span>
        </div>
        <div className="col-span-2 truncate">
          <span className="text-[#8FA4C8]">Pekerjaan:</span>{" "}
          <span className="text-[#1A1A1A] font-medium">{w.job || "-"}</span>
        </div>
        {w.current_finance_tracking_method && (
          <div className="col-span-2 truncate">
            <span className="text-[#8FA4C8]">Cara catat:</span>{" "}
            <span className="text-[#1A1A1A] font-medium">{w.current_finance_tracking_method}</span>
          </div>
        )}
        {w.biggest_money_problem && (
          <div className="col-span-2">
            <span className="text-[#8FA4C8]">Masalah:</span>{" "}
            <span className="text-[#1A1A1A]">{w.biggest_money_problem}</span>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-[#F2F4F7]">
        <button
          onClick={() => onCopy(w.email || "")}
          className="flex items-center justify-center p-2 bg-[#F2F4F7] hover:bg-[#E2E8F0] rounded-lg text-[#4A5568] transition-colors"
          title="Copy email"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {w.whatsapp && (
          <a
            href={formatWhatsApp(w.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
            title="Buka WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          onClick={() => onInvite(w.id)}
          disabled={w.invited || inviting}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
            w.invited
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#F97316] text-white hover:bg-[#e05e00]"
          }`}
        >
          {inviting ? "..." : w.invited ? "✓ Diinvite" : "Invite"}
        </button>
        <button
          onClick={() => onDelete(w.id)}
          disabled={deleting}
          className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
          title="Hapus"
        >
          {deleting ? (
            <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}