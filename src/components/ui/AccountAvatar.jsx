/**
 * AccountAvatar - Display account logo or initials
 * 32x32px with fallback to 2-letter initials
 */
export default function AccountAvatar({ logoUrl, name, color = "#FF6A00", size = "h-8 w-8" }) {
  const getInitials = (text) => {
    if (!text) return "?";
    return text
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${size} rounded-full object-contain bg-white flex-shrink-0`}
        onError={(e) => {
          e.style.display = "none";
          if (e.nextElementSibling) {
            e.nextElementSibling.style.display = "flex";
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
}