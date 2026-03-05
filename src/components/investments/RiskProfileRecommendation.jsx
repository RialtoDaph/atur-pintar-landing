import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const RISK_GUIDELINES = {
  conservative: {
    safeTypes: ["deposito", "obligasi"],
    caution: ["reksa_dana", "saham"],
    avoid: ["crypto"],
    message: "Portofolio Anda cenderung konservatif. Fokuskan pada Deposito dan Obligasi.",
  },
  moderate: {
    safeTypes: ["reksa_dana", "saham", "deposito"],
    caution: ["obligasi"],
    avoid: [],
    message: "Portofolio Anda seimbang. Diversifikasi ke berbagai jenis investasi.",
  },
  aggressive: {
    safeTypes: ["saham", "crypto", "reksa_dana"],
    caution: ["deposito", "obligasi"],
    avoid: [],
    message: "Portofolio Anda agresif. Saham dan Crypto sesuai dengan profil risiko.",
  },
};

export default function RiskProfileRecommendation({ investments }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    try {
      const profiles = await base44.entities.UserRiskProfile.filter(
        { created_by: user.email }
      );
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  }

  if (!profile) return null;

  const guidelines = RISK_GUIDELINES[profile.risk_tolerance] || RISK_GUIDELINES.moderate;
  const investmentTypes = investments.map((i) => i.type);
  const riskMatch = investmentTypes.filter((t) => guidelines.safeTypes.includes(t));
  const cautionTypes = investmentTypes.filter((t) => guidelines.caution.includes(t));
  const avoidTypes = investmentTypes.filter((t) => guidelines.avoid.includes(t));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="w-5 h-5 text-[#FF6A00] mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-[#1A1A1A] text-sm">Rekomendasi Berdasarkan Profil Risiko</h3>
          <p className="text-[10px] text-[#8FA4C8] mt-0.5 capitalize">
            Toleransi Risiko: {profile.risk_tolerance === "conservative" ? "Konservatif" : profile.risk_tolerance === "moderate" ? "Sedang" : "Agresif"}
          </p>
        </div>
      </div>

      <p className="text-sm text-[#4A5568] mb-4">{guidelines.message}</p>

      <div className="space-y-2">
        {riskMatch.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-[#00C9A7]/10 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-[#00C9A7] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-[#00C9A7]">Sesuai dengan profil risiko</p>
              <p className="text-[#4A5568]">{riskMatch.length} investasi dari {investmentTypes.length}</p>
            </div>
          </div>
        )}

        {cautionTypes.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-[#F5A623]/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#F5A623] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-[#F5A623]">Butuh perhatian</p>
              <p className="text-[#4A5568]">Diversifikasi lebih ke {guidelines.safeTypes.join(", ")}</p>
            </div>
          </div>
        )}

        {avoidTypes.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-[#FF6B6B]/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#FF6B6B] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-[#FF6B6B]">Kurangi eksposur</p>
              <p className="text-[#4A5568]">Hindari {avoidTypes.join(", ")} sesuai profil Anda</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}