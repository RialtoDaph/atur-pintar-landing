import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { RefreshCw } from "lucide-react";

/**
 * AdminPageShell — Standard wrapper for all admin pages.
 *
 * Provides consistent:
 * - Sidebar layout (via AdminLayout)
 * - Page header with title + subtitle + optional action
 * - Refresh button (when onRefresh is provided)
 * - Loading skeleton (when loading=true and no children yet)
 * - Consistent padding & max width
 *
 * Usage:
 * <AdminPageShell
 *   currentPage="AdminUsers"
 *   title="User Management"
 *   subtitle="Manage users & approve payments"
 *   onRefresh={loadData}
 *   refreshing={loading}
 *   loading={loading && items.length === 0}
 *   action={<button>...</button>}  // optional extra action next to refresh
 * >
 *   {children}
 * </AdminPageShell>
 */
export default function AdminPageShell({
  currentPage,
  title,
  subtitle,
  action,
  onRefresh,
  refreshing = false,
  loading = false,
  children,
}) {
  const headerAction = (
    <div className="flex items-center gap-2">
      {action}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] shadow-sm disabled:opacity-50 transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-[#F97316] ${refreshing ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );

  return (
    <AdminLayout currentPage={currentPage}>
      <div className="p-4 sm:p-8">
        <AdminPageHeader
          title={title}
          subtitle={subtitle}
          action={(action || onRefresh) ? headerAction : null}
        />
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </AdminLayout>
  );
}