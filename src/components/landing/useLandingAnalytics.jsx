import { useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Hook untuk tracking landing page visitor behavior.
// - Track page_view sekali per session (per tab) saat mount
// - Sediakan trackCta(location) untuk dipanggil dari tombol CTA
function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem("lp_session_id");
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem("lp_session_id", sid);
    }
    return sid;
  } catch {
    return `${Date.now()}`;
  }
}

export default function useLandingAnalytics() {
  const startTime = useRef(Date.now());
  const sessionId = useRef(getOrCreateSessionId());
  const ctaTracked = useRef(false);

  useEffect(() => {
    // Track page view sekali per session
    try {
      if (sessionStorage.getItem("lp_pv_tracked") === "1") return;
      sessionStorage.setItem("lp_pv_tracked", "1");
      base44.entities.LandingAnalytics.create({
        event_type: "page_view",
        session_id: sessionId.current,
        referrer: document.referrer || "direct",
        user_agent: navigator.userAgent?.slice(0, 200) || "",
      }).catch(() => {});
    } catch {}
  }, []);

  const trackCta = useCallback((location) => {
    if (ctaTracked.current) return; // Hanya track CTA pertama yg diklik per session
    ctaTracked.current = true;
    const time_on_page_ms = Date.now() - startTime.current;
    base44.entities.LandingAnalytics.create({
      event_type: "cta_click",
      session_id: sessionId.current,
      location,
      time_on_page_ms,
    }).catch(() => {});
  }, []);

  return { trackCta };
}