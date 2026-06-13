import { useState, useEffect } from "react";
import { AlertTriangle, Copy, Check, ExternalLink } from "lucide-react";

// Deteksi in-app browser (Facebook, Instagram, TikTok, LINE) yang BLOKIR Google OAuth.
// Google sejak 2021 menolak login dari embedded webview → user dapat "browser may not be secure".
export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|TikTok|MicroMessenger|Twitter/i.test(ua);
}

export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShow(isInAppBrowser());
  }, []);

  if (!show) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: bikin textarea sementara
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-2.5 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-100/90 leading-relaxed">
          <p className="font-semibold mb-1">Login Google ga jalan di browser ini</p>
          <p className="text-xs text-amber-100/70">
            Kamu lagi buka dari Facebook/Instagram. Untuk daftar pakai Google, salin link ini dan buka di Chrome atau Safari.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Tersalin!" : "Salin link"}
        </button>
        <a
          href={window.location.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Buka di browser
        </a>
      </div>
      <p className="text-[11px] text-amber-100/60 mt-2.5 text-center">
        Atau lanjut daftar pakai email di bawah ↓
      </p>
    </div>
  );
}