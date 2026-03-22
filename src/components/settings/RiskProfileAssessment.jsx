import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RiskProfileAssessment() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    setLoading(true);
    try {
      const profiles = await base44.entities.UserRiskProfile.list();
      if (profiles && profiles.length > 0) {
        // Cleanup duplicates: keep first, delete the rest
        if (profiles.length > 1) {
          await Promise.all(profiles.slice(1).map(p => base44.entities.UserRiskProfile.delete(p.id)));
        }
        setProfile(profiles[0]);
      } else {
        setProfile({
          risk_tolerance: "moderate",
          investment_experience: "beginner",
          financial_goal: "wealth_building",
          investment_horizon: "medium_term",
          monthly_income: 0,
          emergency_fund_months: 0,
          debt_to_income_ratio: 0,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      if (profile.id) {
        // Upsert: update existing record
        await base44.entities.UserRiskProfile.update(profile.id, {
          ...profile,
          last_assessment_date: today,
        });
      } else {
        // No existing record: create one
        const created = await base44.entities.UserRiskProfile.create({
          ...profile,
          last_assessment_date: today,
        });
        setProfile(created);
      }
      await loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#FF6A00]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Risiko Investasi</CardTitle>
        <CardDescription>Informasi ini membantu Nana AI memberikan rekomendasi investasi yang sesuai</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Tolerance */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Toleransi Risiko</Label>
          <p className="text-xs text-[#8FA4C8] mb-2">Seberapa besar risiko yang bisa kamu terima?</p>
          <RadioGroup value={profile.risk_tolerance} onValueChange={(value) => setProfile({ ...profile, risk_tolerance: value })}>
            <div className="flex items-center gap-2 p-3 border border-[#E2E8F0] rounded-lg">
              <RadioGroupItem value="conservative" id="conservative" />
              <Label htmlFor="conservative" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Conservative (Konservatif)</p>
                  <p className="text-xs text-[#8FA4C8]">Prioritas keamanan modal, return stabil & rendah</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center gap-2 p-3 border border-[#E2E8F0] rounded-lg">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Moderate (Seimbang)</p>
                  <p className="text-xs text-[#8FA4C8]">Bauran antara keamanan & pertumbuhan modal</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center gap-2 p-3 border border-[#E2E8F0] rounded-lg">
              <RadioGroupItem value="aggressive" id="aggressive" />
              <Label htmlFor="aggressive" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Aggressive (Agresif)</p>
                  <p className="text-xs text-[#8FA4C8]">Target pertumbuhan tinggi, terima risiko besar</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Investment Experience */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Pengalaman Investasi</Label>
          <Select value={profile.investment_experience} onValueChange={(value) => setProfile({ ...profile, investment_experience: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Pemula - Baru memulai atau sedikit pengalaman</SelectItem>
              <SelectItem value="intermediate">Menengah - Sudah investasi 1-5 tahun</SelectItem>
              <SelectItem value="advanced">Lanjutan - Pengalaman 5+ tahun, pahami instrumen kompleks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Financial Goal */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tujuan Keuangan Utama</Label>
          <Select value={profile.financial_goal} onValueChange={(value) => setProfile({ ...profile, financial_goal: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wealth_building">Membangun Kekayaan - Investasi jangka panjang untuk pertumbuhan</SelectItem>
              <SelectItem value="income_generation">Generasi Pendapatan - Cari passive income rutin</SelectItem>
              <SelectItem value="capital_preservation">Preservasi Modal - Jaga dan grow uang dengan aman</SelectItem>
              <SelectItem value="retirement">Perencanaan Pensiun - Kesiapan finansial pensiun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Investment Horizon */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Horizon Investasi</Label>
          <Select value={profile.investment_horizon} onValueChange={(value) => setProfile({ ...profile, investment_horizon: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">Jangka Pendek (1-3 tahun)</SelectItem>
              <SelectItem value="medium_term">Jangka Menengah (3-10 tahun)</SelectItem>
              <SelectItem value="long_term">Jangka Panjang (10+ tahun)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#8FA4C8]">Pendapatan Bulanan (Rp)</Label>
            <input
              type="number"
              value={profile.monthly_income || ""}
              onChange={(e) => setProfile({ ...profile, monthly_income: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#8FA4C8]">Dana Darurat (Bulan)</Label>
            <input
              type="number"
              value={profile.emergency_fund_months || ""}
              onChange={(e) => setProfile({ ...profile, emergency_fund_months: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#8FA4C8]">Rasio Utang/Pendapatan (0-1)</Label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={profile.debt_to_income_ratio || ""}
            onChange={(e) => setProfile({ ...profile, debt_to_income_ratio: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            placeholder="0"
          />
          <p className="text-[10px] text-[#8FA4C8]">Contoh: 0.3 = total utang 30% dari pendapatan bulanan</p>
        </div>

        <Button
          onClick={saveProfile}
          disabled={saving}
          className="w-full bg-[#FF6A00] hover:bg-[#e05e00] text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Profil Risiko"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}