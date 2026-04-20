import { useState } from "react";

/**
 * AccountLogo - Display account/institution logo
 * Shows logo_url (Brandfetch) with fallback to emoji + color
 */
export default function AccountLogo({ logoUrl, icon, bgColor = "#FF6A00", name = "" }) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className="w-8 h-8 rounded-full object-contain bg-white"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: emoji + color background
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {icon || "🏦"}
    </div>
  );
}