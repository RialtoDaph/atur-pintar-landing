import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import ConsentModal from "@/components/auth/ConsentModal";
import InAppBrowserBanner from "@/components/auth/InAppBrowserBanner";

// Safely resolve the post-login redirect target.
// Only allow same-origin internal paths (must start with "/" and not "//")
// to prevent open-redirect attacks via ?next=https://evil.com
const getSafeNext = () => {
  try {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  } catch {}
  return "/";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentProvider, setConsentProvider] = useState(null); // "google" | "apple" | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = getSafeNext();
    } catch (err) {
      // Generic message — never leak whether email exists vs wrong password (prevents email enumeration)
      setError("Email atau kata sandi tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialConfirm = () => {
    const provider = consentProvider;
    setConsentProvider(null);
    if (provider) base44.auth.loginWithProvider(provider, getSafeNext());
  };

  return (
    <AuthLayout
      title="Hallo Pintarians!"
      subtitle="Masuk ke akun kamu"
    >
      <InAppBrowserBanner />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/70">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="username"
              autoFocus
              placeholder="kamu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-0"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/70">Kata Sandi</Label>
            <Link to="/forgot-password" className="text-xs text-[#F97316] hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-0"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-bold bg-[#F97316] hover:bg-[#e05e00] text-white disabled:opacity-50" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>

        <p className="text-center text-sm text-white/60">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#F97316] font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1B1B1B] px-3 text-white/40">atau</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-semibold mb-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        onClick={() => setConsentProvider("google")}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Lanjut dengan Google
      </Button>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-semibold bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        onClick={() => setConsentProvider("apple")}
      >
        <AppleIcon className="w-5 h-5 mr-2" />
        Lanjut dengan Apple
      </Button>

      <p className="text-center text-xs text-white/40 mt-5 leading-relaxed">
        Dengan masuk, kamu menyetujui{" "}
        <Link to="/PrivacyPolicy" target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline">
          Kebijakan Privasi
        </Link>{" "}
        &{" "}
        <Link to="/TermsOfService" target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline">
          Ketentuan Layanan
        </Link>
      </p>

      <ConsentModal
        open={!!consentProvider}
        provider={consentProvider}
        onClose={() => setConsentProvider(null)}
        onConfirm={handleSocialConfirm}
      />
    </AuthLayout>
  );
}