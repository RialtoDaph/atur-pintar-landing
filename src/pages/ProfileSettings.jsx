import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const { t } = useAppSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  async function handleLogout() {
    base44.auth.logout();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await base44.auth.deleteAccount();
    } catch (error) {
      console.error("Delete account failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-10">
      <div className="bg-[#0A0A0A] px-5 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#8FA4C8] text-sm font-medium">{t('settings_preferences')}</p>
          <h1 className="text-white text-2xl font-bold mt-0.5">Profil Saya</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-6 space-y-4">
        {/* Profile Card */}
        {user &&
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FF6A00] flex items-center justify-center text-white font-bold text-2xl">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1A1A1A] text-lg">{user.full_name || t('settings_user_label')}</p>
              <p className="text-sm text-[#8FA4C8] mt-1">{user.email}</p>
              {user.role && (
                <p className="text-xs font-semibold text-[#FF6A00] mt-2 uppercase">{user.role}</p>
              )}
            </div>
          </div>
        </div>
        }

        {/* Account Management */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-bold text-[#8FA4C8] uppercase tracking-widest">{t('settings_account')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#FFF5F5] transition-colors border-t border-[#F2F4F7] text-[#FF6B6B]"
            aria-label="Keluar dari akun">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">{t('settings_logout')}</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#FFF5F5] transition-colors border-t border-[#F2F4F7] text-[#FF6B6B]"
            aria-label="Hapus akun">
            <Trash2 className="w-5 h-5" />
            <span className="font-medium text-sm">Hapus Akun Selamanya</span>
          </button>
        </div>

        <p className="text-center text-xs text-[#8FA4C8] pb-4">{t('settings_version')}</p>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Akun Selamanya?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Semua data akun Anda akan dihapus secara permanen dari sistem.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-[#FF6B6B] hover:bg-[#FF5252]">
              {deleting ? "Menghapus..." : "Hapus Akun"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}