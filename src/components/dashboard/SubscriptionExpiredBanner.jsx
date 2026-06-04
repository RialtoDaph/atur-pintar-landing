import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function SubscriptionExpiredBanner() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700 mb-0.5">Langganan premium berakhir</p>
        <p className="text-xs text-red-600 leading-relaxed">
          Langganan premium kamu sudah berakhir. Perpanjang sekarang untuk tetap menikmati fitur lengkap Atur Pintar.
        </p>
        <Link
          to="/Subscription"
          className="inline-flex items-center mt-2.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Perpanjang Sekarang
        </Link>
      </div>
    </div>
  );
}