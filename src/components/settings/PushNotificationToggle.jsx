import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed,
} from "@/lib/pushNotifications";

export default function PushNotificationToggle() {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const sup = isPushSupported();
      setSupported(sup);
      if (!sup) { setLoading(false); return; }
      setPermission(getNotificationPermission());
      setSubscribed(await isSubscribed());
      setLoading(false);
    })();
  }, []);

  async function handleEnable() {
    setBusy(true);
    const res = await subscribeToPush();
    setBusy(false);
    setPermission(getNotificationPermission());
    if (res.ok) {
      setSubscribed(true);
      toast.success("Notifikasi push berhasil diaktifkan 🔔");
    } else if (res.reason === "denied") {
      toast.error("Kamu menolak izin notifikasi. Aktifkan lewat setelan browser.");
    } else if (res.reason === "unsupported") {
      toast.error("Browser kamu tidak mendukung notifikasi push.");
    } else {
      toast.error("Gagal mengaktifkan notifikasi. Coba lagi.");
    }
  }

  async function handleDisable() {
    setBusy(true);
    const res = await unsubscribeFromPush();
    setBusy(false);
    if (res.ok) {
      setSubscribed(false);
      toast.success("Notifikasi push dimatikan.");
    } else {
      toast.error("Gagal menonaktifkan notifikasi.");
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      await base44.functions.invoke("sendPushNotification", {
        title: "🎉 Test notifikasi berhasil!",
        body: "Kalau kamu melihat ini di lockscreen HP, berarti push notif aktif.",
        url: "/Dashboard",
        tag: "test-notif",
      });
      toast.success("Notif test dikirim. Cek layar HP kamu!");
    } catch {
      toast.error("Gagal kirim notif test.");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[#F97316] animate-spin" />
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest">Notifikasi</p>
        </div>
        <div className="px-5 py-4 border-t border-[#F2F4F7] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-[#8FA4C8]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1A1A1A]">Tidak Didukung</p>
            <p className="text-xs text-[#8FA4C8] mt-0.5">Browser kamu belum support push notification. Coba buka di Chrome/Firefox/Edge/Safari 16+.</p>
          </div>
        </div>
      </div>
    );
  }

  const denied = permission === "denied";
  const active = subscribed && permission === "granted";

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest">Notifikasi Push</p>
      </div>

      <div className="px-5 py-4 border-t border-[#F2F4F7] flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-[#FFF3E0]" : "bg-[#F2F4F7]"}`}>
          {active
            ? <Bell className="w-4 h-4 text-[#F97316]" />
            : <BellOff className="w-4 h-4 text-[#8FA4C8]" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1A1A1A]">
            {active ? "Aktif di device ini" : "Belum aktif"}
          </p>
          <p className="text-xs text-[#8FA4C8] mt-0.5 leading-relaxed">
            {denied
              ? "Izin notifikasi diblokir. Buka setelan browser untuk mengizinkan lagi."
              : active
                ? "Kamu akan dapat pengingat tagihan, budget alert, dan update streak walau app ditutup."
                : "Nyalakan untuk dapat pengingat tagihan, budget alert, dan streak — walau app ditutup."}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {active ? (
              <>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#4A5568] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50"
                >
                  {testing ? "Mengirim..." : "Kirim Test"}
                </button>
                <button
                  onClick={handleDisable}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-lg bg-[#F2F4F7] text-xs font-semibold text-[#4A5568] hover:bg-[#E2E8F0] transition-colors disabled:opacity-50"
                >
                  {busy ? "..." : "Matikan"}
                </button>
              </>
            ) : (
              <button
                onClick={handleEnable}
                disabled={busy || denied}
                title={denied ? "Reset izin di setelan browser dulu" : undefined}
                className="px-3 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-bold hover:bg-[#e05e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "..." : denied ? "Diblokir" : "Aktifkan Notifikasi"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}