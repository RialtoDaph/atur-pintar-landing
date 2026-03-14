import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function PremiumGate({ feature = "fitur ini" }) {
  return (
    <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center px-5">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6A00]/10 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-[#FF6A00]" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Fitur Premium</h2>
        <p className="text-sm text-[#8FA4C8] mb-6">
          {feature} hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk akses penuh.
        </p>
        <Link
          to="/Subscription"
          className="block w-full py-3 bg-[#FF6A00] text-white rounded-xl font-semibold text-sm hover:bg-[#e05e00] transition-colors"
        >
          Upgrade ke Premium
        </Link>
        <Link
          to="/"
          className="block mt-3 text-sm text-[#8FA4C8] hover:text-[#1A1A1A] transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}