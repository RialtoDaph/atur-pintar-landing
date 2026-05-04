import { useEffect } from "react";

/**
 * Locks the body scroll while a modal/sheet is open.
 * - Prevents background page from scrolling on mobile when user scrolls inside the modal.
 * - Preserves the scroll position so the page doesn't jump when the modal closes.
 * - Safe with multiple stacked modals (uses a counter on document.body).
 *
 * Usage: just call useLockBodyScroll() at the top of your modal component.
 */
export default function useLockBodyScroll() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Increment open-modal counter
    const prevCount = parseInt(body.dataset.lockCount || "0", 10);
    body.dataset.lockCount = String(prevCount + 1);

    // Only apply lock styles on the first modal
    if (prevCount === 0) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      body.dataset.lockScrollY = String(scrollY);

      // Save current inline styles so we can restore them
      body.dataset.prevPosition = body.style.position || "";
      body.dataset.prevTop = body.style.top || "";
      body.dataset.prevWidth = body.style.width || "";
      body.dataset.prevOverflow = body.style.overflow || "";
      body.dataset.prevHtmlOverflow = html.style.overflow || "";

      // Apply scroll lock — `position: fixed` is the only reliable way on iOS Safari
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }

    return () => {
      const currentCount = parseInt(body.dataset.lockCount || "1", 10);
      const newCount = Math.max(0, currentCount - 1);
      body.dataset.lockCount = String(newCount);

      // Only release the lock when the LAST modal closes
      if (newCount === 0) {
        const scrollY = parseInt(body.dataset.lockScrollY || "0", 10);

        body.style.position = body.dataset.prevPosition || "";
        body.style.top = body.dataset.prevTop || "";
        body.style.width = body.dataset.prevWidth || "";
        body.style.overflow = body.dataset.prevOverflow || "";
        html.style.overflow = body.dataset.prevHtmlOverflow || "";

        delete body.dataset.lockScrollY;
        delete body.dataset.prevPosition;
        delete body.dataset.prevTop;
        delete body.dataset.prevWidth;
        delete body.dataset.prevOverflow;
        delete body.dataset.prevHtmlOverflow;
        delete body.dataset.lockCount;

        // Restore scroll position instantly (no animation jump)
        window.scrollTo(0, scrollY);
      }
    };
  }, []);
}