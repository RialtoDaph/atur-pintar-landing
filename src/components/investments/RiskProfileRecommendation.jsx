import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAppSettings } from "@/components/utils/AppSettingsContext";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const RISK_GUIDELINES = {
  conservative: {
    safeTypes: ["deposito", "obligasi"],
    caution: ["reksa_dana", "saham"],
    avoid: ["crypto"],
    msg_id: "Portofolio Anda cenderung konservatif. Fokuskan pada Deposito dan Obligasi.",
    msg_en: "Your portfolio is conservative. Focus on Deposits and Bonds.",
    label_id: "Konservatif",
    label_en: "Conservative",
  },
  moderate: {
    safeTypes: ["reksa_dana", "saham", "deposito"],
    caution: ["obligasi"],
    avoid: [],
    msg_id: "Portofolio Anda seimbang. Diversifikasi ke berbagai jenis investasi.",
    msg_en: "Your portfolio is balanced. Diversify across investment types.",
    label_id: "Sedang",
    label_en: "Moderate",
  },
  aggressive: {
    safeTypes: ["saham", "crypto", "reksa_dana"],
    caution: ["deposito", "obligasi"],
    avoid: [],
    msg_id: "Portofolio Anda agresif. Saham dan Crypto sesuai dengan profil risiko.",
    msg_en: "Your portfolio is aggressive. Stocks and Crypto match your risk profile.",
    label_id: "Agresif",
    label_en: "Aggressive",
  },
};

export default function RiskProfileRecommendation({ investments }) {
  const { t, settings } = useAppSettings();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const profiles = await base44.entities.UserRiskProfile.filter({ created_by: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (e) {
      console.error("Failed to load risk profile:", e);
    } finally {
      setLoaded(true);
    }
  }

  if (!loaded) return null;

  if (!profile) return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <ShieldCheck className="w-5 h-5 text-[#8FA4C8] mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-[#1A1A1A] text-sm">
            {settings.language === 'en' ? 'Risk Profile Recommendation' : 'Rekomendasi Profil Risiko'}
          </h3>
          <p className="text-xs text-[#8FA4C8] mt-0.5">
            {settings.language === 'en' ? 'Complete your risk assessment to get personalized advice.' : 'Lengkapi penilaian risiko untuk mendapat saran personal.'}
          </p>
        </div>
      </div>
      <Link
        to={createPageUrl("Settings")}
        className="block w-full text-center text-xs font-semibold text-white bg-[#FF6A00] hover:bg-[#e05e00] py-2 rounded-xl transition-colors"
      >
        {settings.language === 'en' ? 'Set Up Risk Profile →' : 'Atur Profil Risiko →'}
      </Link>
    </div>
  );

  const guidelines = RISK_GUIDELINES[profile.risk_tolerance] || RISK_GUIDELINES.moderate;
  const lang = settings.language === 'en' ? 'en' : 'id';
  const investmentTypes = investments.map((i) => i.type);
  const riskMatch = investmentTypes.filter((type) => guidelines.safeTypes.includes(type));
  const cautionTypes = investmentTypes.filter((type) => guidelines.caution.includes(type));
  const avoidTypes = investmentTypes.filter((type) => guidelines.avoid.includes(type));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="w-5 h-5 text-[#FF6A00] mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-[#1A1A1A] text-sm">
            {lang === 'en' ? 'Risk Profile Recommendation' : 'Rekomendasi Berdasarkan Profil Risiko'}
          </h3>
          <p className="text-[10px] text-[#8FA4C8] mt-0.5">
            {lang === 'en' ? 'Risk Tolerance: ' : 'Toleransi Risiko: '}
            <span className="font-semibold">{guidelines[`label_${lang}`]}</span>
          </p>
        </div>
      </div>

      <p className="text-sm text-[#4A5568] mb-4">{guidelines[`msg_${lang}`]}</p>

      <div className="space-y-2">
        {riskMatch.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-[#00C9A7]/10 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-[#00C9A7] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-[#00C9A7]">
                {lang === 'en' ? 'Aligned with your risk profile' : 'Sesuai dengan profil risiko'}
              </p>
              <p className="text-[#4A5568]">
                {riskMatch.length} {lang === 'en' ? 'of' : 'dari'} {investmentTypes.length} {lang === 'en' ? 'investments' : 'investasi'}
              </p>
            </div>
          </div>
        )}

        {cautionTypes.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-[#F5A623]/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#F5A623] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-[#F5A623]">
                {lang === 'en' ? 'Needs attention' : 'Butuh perhatian'}
              </p>
              <p className="text-[#4A5568]">
                {lang === 'en' ? `Diversify more into ${guidelines.safeTypes.join(", ")}` : `Diversifikasi lebih ke ${guidelines.safeTypes.join(", ")}`}
              </p>
            </div>
          </div>
        )}

        {avoidTypes.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-[#FF6B6B]/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#FF6B6B] mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-[#FF6B6B]">
                {lang === 'en' ? 'Reduce exposure' : 'Kurangi eksposur'}
              </p>
              <p className="text-[#4A5568]">
                {lang === 'en' ? `Avoid ${avoidTypes.join(", ")} per your profile` : `Hindari ${avoidTypes.join(", ")} sesuai profil Anda`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}