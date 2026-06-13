import { useState, useEffect } from "react";
import { Info } from "lucide-react";

// Deteksi in-app browser (Facebook, Instagram, TikTok, LINE) yang BLOKIR Google OAuth.
// Google sejak 2021 menolak login dari embedded webview → user dapat "browser may not be secure".
export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|TikTok|MicroMessenger|Twitter/i.test(ua);
}

export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isInAppBrowser());
  }, []);

  if (!show) return null;

  return (
    <div className="mb-5 p-3.5 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30">
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-white/85 leading-relaxed">
          <p className="font-semibold mb-0.5">Daftar pakai email aja ya 👇</p>
          <p className="text-xs text-white/60">
            Login Google ga jalan di browser Facebook/Instagram. Tinggal isi email & password di bawah — 30 detik selesai.
          </p>
        </div>
      </div>
    </div>
  );
}