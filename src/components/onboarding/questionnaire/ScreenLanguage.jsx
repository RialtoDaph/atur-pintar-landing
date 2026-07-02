import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ScreenWrapper, NanaAvatar, CTAButton } from "./shared";

// Language picker — one-time selection during onboarding. Not editable later.
const LANGUAGES = [
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩", hint: "Untuk pengguna di Indonesia" },
  { code: "en", label: "English", flag: "🇺🇸", hint: "For international users" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", hint: "Für Nutzer in Deutschland" },
];

export default function ScreenLanguage({ onNext, initialValue = "id" }) {
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
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Pilih Bahasa 🌏</h1>
          <p className="text-[#4A5568] text-sm leading-relaxed max-w-xs mx-auto">
            Pilihan ini hanya sekali di awal dan tidak bisa diganti lagi setelahnya, jadi pastikan pilih yang tepat ya.
          </p>
        </motion.div>

        <div className="mt-8 space-y-3">
          {LANGUAGES.map((l) => {
            const active = selected === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelected(l.code)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all text-left active:scale-95 ${
                  active
                    ? "border-[#FF6B35] bg-[#FFF5F0]"
                    : "border-[#E2E8F0] bg-[#FAFAFA] hover:border-[#FF6B35]/50"
                }`}
              >
                <span className="text-2xl">{l.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{l.label}</p>
                  <p className="text-xs text-[#8FA4C8] mt-0.5">{l.hint}</p>
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
      </div>

      <div className="px-6 pb-8">
        <CTAButton onClick={() => onNext(selected)} disabled={!selected}>
          Lanjut →
        </CTAButton>
      </div>
    </ScreenWrapper>
  );
}