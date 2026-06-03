import { Link } from "react-router-dom";

/**
 * Reusable empty-state with emoji illustration, title, subtitle, and optional CTA.
 * Matches design system: white card, [#1A1A1A] text, [#8FA4C8] subtitle, [#F97316] CTA.
 */
export default function EmptyState({
  emoji = "📊",
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  onCtaClick,
  compact = false,
}) {
  const pad = compact ? "py-5" : "py-7";

  const cta =
    ctaLabel && (ctaTo || onCtaClick) ? (
      ctaTo ? (
        <Link
          to={ctaTo}
          className="inline-flex items-center justify-center px-4 py-2 mt-3 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C] active:scale-95 transition-all tap-highlight-fix"
        >
          {ctaLabel}
        </Link>
      ) : (
        <button
          onClick={onCtaClick}
          className="inline-flex items-center justify-center px-4 py-2 mt-3 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C] active:scale-95 transition-all tap-highlight-fix"
        >
          {ctaLabel}
        </button>
      )
    ) : null;

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${pad}`}>
      <div className="w-12 h-12 rounded-full bg-[#F2F4F7] flex items-center justify-center text-2xl mb-2">
        {emoji}
      </div>
      {title && <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{title}</p>}
      {subtitle && (
        <p className="text-xs text-[#8FA4C8] mt-1 max-w-[240px] leading-snug">{subtitle}</p>
      )}
      {cta}
    </div>
  );
}