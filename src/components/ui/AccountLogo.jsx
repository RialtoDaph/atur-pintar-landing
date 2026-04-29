import { useState } from "react";

/**
 * AccountLogo - Optimized logo display with error handling
 * - Lazy loading untuk performa
 * - Error handling jika logo gagal load
 * - Fallback otomatis saat error
 */
export default function AccountLogo({ logoUrl, size = "w-8 h-8", fallback = null, onError = null }) {
  const [hasError, setHasError] = useState(false);

  if (!logoUrl || hasError) {
    return fallback || null;
  }

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      src={logoUrl}
      alt="Logo"
      className={`${size} object-contain`}
      loading="lazy"
      onError={handleError}
      decoding="async"
    />
  );
}