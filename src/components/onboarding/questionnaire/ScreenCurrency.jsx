import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ScreenWrapper, NanaAvatar, CTAButton } from "./shared";

// Currency picker — one-time selection during onboarding. Not editable later.
const CURRENCIES = [
  {
    code: "IDR",
    label: "Rupiah",
    symbol: "Rp",
    flag: "🇮🇩",
    example: "Rp 1.000.000",
    decimal_separator: ",",
    thousand_separator: ".",
  },
  {
    code: "USD",
    label: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    example: "$ 1,000.00",
    decimal_separator: ".",
    thousand_separator: ",",
  },
  {
    code: "EUR",
    label: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    example: "€ 1.000,00",
    decimal_separator: ",",
    thousand_separator: ".",
  },
];

export default function ScreenCurrency({ onNext, initialValue = "IDR" }) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col px-6 py-10 overflow-y-auto">
        <NanaAvatar />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Pilih Mata Uang 💰</h1>
          <p className="text-[#4A5568] text-sm leading-relaxed max-w-xs mx-auto">
            Semua transaksi kamu akan dicatat dalam mata uang ini. Pilihan ini <strong>permanen</strong> dan tidak bisa diganti lagi.
          </p>
        </motion.div>

        <div className="mt-8 space-y-3">
          {CURRENCIES.map((c) => {
            const active = selected === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all text-left active:scale-95 ${
                  active
                    ? "border-[#FF6B35] bg-[#FFF5F0]"
                    : "border-[#E2E8F0] bg-[#FAFAFA] hover:border-[#FF6B35]/50"
                }`}
              >
                <span className="text-2xl">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{c.label} · {c.code}</p>
                  <p className="text-xs text-[#8FA4C8] mt-0.5">Contoh: {c.example}</p>
                </div>
                {active && (
                  <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-[#8FA4C8] text-center mt-4 px-4">
          ⚠️ Pilih dengan hati-hati — mata uang tidak bisa diubah setelah ini.
        </p>
      </div>

      <div className="px-6 pb-8">
        <CTAButton
          onClick={() => {
            const cur = CURRENCIES.find((c) => c.code === selected);
            onNext(cur);
          }}
          disabled={!selected}
        >
          Lanjut →
        </CTAButton>
      </div>
    </ScreenWrapper>
  );
}