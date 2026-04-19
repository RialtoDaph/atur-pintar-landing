import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";
import { useNavigate } from "react-router-dom";

function compactRupiah(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} rb`;
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

export default function BalanceCardCarousel({ income, expense, savings, accounts, loading }) {
  const { t } = useAppSettings();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const now = new Date();
  const monthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const selisih = income - expense;

  const slides = [
    {
      title: `Bulan Ini (${monthName})`,
      content: (
        <div className="space-y-3">
          <p className="text-[#8FA4C8] text-xs font-medium uppercase">Ringkasan Bulanan</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex flex-col items-center bg-white/5 rounded-xl py-3 px-2">
              <div className="bg-green-500/20 rounded-full w-9 h-9 flex items-center justify-center mb-2 ring-1 ring-green-500/30">
                <TrendingUp className="w-4 h-4 text-[#99ff80]" />
              </div>
              <p className="text-[#8FA4C8] text-[9px] mb-1 font-medium uppercase tracking-wider">Pemasukan</p>
              <p className="text-white text-xs font-bold">{compactRupiah(income)}</p>
            </div>
            <div className="flex flex-col items-center bg-white/5 rounded-xl py-3 px-2">
              <div className="bg-red-500/20 rounded-full w-9 h-9 flex items-center justify-center mb-2 ring-1 ring-red-500/30">
                <TrendingDown className="w-4 h-4 text-[#ff6666]" />
              </div>
              <p className="text-[#8FA4C8] text-[9px] mb-1 font-medium uppercase tracking-wider">Pengeluaran</p>
              <p className="text-white text-xs font-bold">{compactRupiah(expense)}</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl py-3 px-3 flex items-center justify-between">
            <div>
              <p className="text-[#8FA4C8] text-[9px] font-medium uppercase tracking-wider">Saldo Bulan Ini</p>
              <p className={`text-white text-sm font-bold ${selisih >= 0 ? "text-[#99ff80]" : "text-[#ff6666]"}`}>{compactRupiah(selisih)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <PiggyBank className={`w-6 h-6 ${selisih >= 0 ? "text-[#99ff80]" : "text-[#ff6666]"}`} />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Total Keseluruhan",
      content: (
        <div className="space-y-4 flex flex-col items-center justify-center">
          <p className="text-[#8FA4C8] text-xs font-medium uppercase">Total Saldo Semua Rekening</p>
          <p className={`font-black text-4xl tracking-tight ${totalBalance >= 0 ? "text-white" : "text-red-400"}`}>
            {compactRupiah(totalBalance)}
          </p>
          <p className="text-[#8FA4C8] text-xs">{accounts.length} rekening terhubung</p>
          <button
            onClick={() => navigate("/Accounts")}
            className="px-4 py-2 bg-[#FF6A00] text-white rounded-lg text-xs font-semibold hover:bg-[#E55A00] transition-colors"
          >
            Lihat Rekening
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="bg-gradient-to-br from-[#161616] to-[#1a1a1a] rounded-2xl p-5 animate-pulse h-48" />;
  }

  return (
    <div data-tour="balance-card" className="space-y-3">
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#161616] to-[#111] rounded-2xl p-5 border border-[#2a2a2a] shadow-2xl" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,106,0,0.08)'}}>
        <p className="text-[#8FA4C8] text-[10px] font-bold uppercase tracking-[0.15em] mb-4 text-center">{slides[currentSlide].title}</p>
        {slides[currentSlide].content}
      </div>
      
      {/* Dot Indicator */}
      <div className="flex items-center justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? "w-6 bg-[#FF6A00]" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}