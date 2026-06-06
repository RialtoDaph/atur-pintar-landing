/**
 * AdminCompactStyles — CSS overrides applied when <html class="admin-compact"> is active.
 * Reduces padding, font sizes, and spacing across the entire admin panel.
 * Mounted once via AdminLayout.
 */
export default function AdminCompactStyles() {
  return (
    <style>{`
      html.admin-compact .admin-area h1 { font-size: 1.05rem; line-height: 1.3; }
      html.admin-compact .admin-area h2 { font-size: 0.95rem; line-height: 1.3; }
      html.admin-compact .admin-area h3 { font-size: 0.875rem; }

      /* Card padding squeeze */
      html.admin-compact .admin-area .p-4 { padding: 0.625rem; }
      html.admin-compact .admin-area .p-5 { padding: 0.75rem; }
      html.admin-compact .admin-area .p-6 { padding: 0.875rem; }
      html.admin-compact .admin-area .py-3 { padding-top: 0.4rem; padding-bottom: 0.4rem; }
      html.admin-compact .admin-area .py-4 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      html.admin-compact .admin-area .px-4 { padding-left: 0.625rem; padding-right: 0.625rem; }
      html.admin-compact .admin-area .px-5 { padding-left: 0.75rem; padding-right: 0.75rem; }

      /* Vertical spacing between sections */
      html.admin-compact .admin-area .mb-6 { margin-bottom: 0.75rem; }
      html.admin-compact .admin-area .mb-5 { margin-bottom: 0.625rem; }
      html.admin-compact .admin-area .mb-4 { margin-bottom: 0.5rem; }
      html.admin-compact .admin-area .mt-6 { margin-top: 0.75rem; }
      html.admin-compact .admin-area .space-y-6 > * + * { margin-top: 0.75rem; }
      html.admin-compact .admin-area .space-y-5 > * + * { margin-top: 0.625rem; }
      html.admin-compact .admin-area .space-y-4 > * + * { margin-top: 0.5rem; }
      html.admin-compact .admin-area .space-y-3 > * + * { margin-top: 0.4rem; }
      html.admin-compact .admin-area .space-y-2 > * + * { margin-top: 0.3rem; }
      html.admin-compact .admin-area .gap-4 { gap: 0.5rem; }
      html.admin-compact .admin-area .gap-3 { gap: 0.4rem; }

      /* Stat numbers smaller */
      html.admin-compact .admin-area .text-3xl { font-size: 1.25rem; line-height: 1.5rem; }
      html.admin-compact .admin-area .text-2xl { font-size: 1.05rem; line-height: 1.4rem; }
      html.admin-compact .admin-area .text-xl { font-size: 0.95rem; }

      /* Rounded corners less puffy */
      html.admin-compact .admin-area .rounded-2xl { border-radius: 0.75rem; }
      html.admin-compact .admin-area .rounded-xl { border-radius: 0.5rem; }
    `}</style>
  );
}