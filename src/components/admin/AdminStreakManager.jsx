import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminStreakManager({ onActionComplete }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminGetGamificationProfiles', {});
      const gamificationProfiles = res.data.users.flatMap(u => u.profiles);
      const userMap = {};
      
      gamificationProfiles.forEach(profile => {
        if (!userMap[profile.created_by]) {
          userMap[profile.created_by] = {
            email: profile.created_by,
            profiles: [],
            daily_streak: 0,
            longest_streak: 0,
            level: 0,
            total_points: 0,
            last_activity_date: null
          };
        }
        userMap[profile.created_by].profiles.push(profile);
        userMap[profile.created_by].daily_streak = profile.daily_streak || 0;
        userMap[profile.created_by].longest_streak = profile.longest_streak || 0;
        userMap[profile.created_by].level = profile.level || 0;
        userMap[profile.created_by].total_points = profile.total_points || 0;
        userMap[profile.created_by].last_activity_date = profile.last_activity_date;
      });

      setUsers(Object.values(userMap));
      setErrorMsg("");
    } catch (error) {
      setErrorMsg("Gagal memuat data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetStreakForUser(email) {
    if (!window.confirm(`Reset streak untuk ${email}?`)) return;

    try {
      const res = await base44.functions.invoke('adminManageStreaks', { action: 'resetUser', email });

      setSuccessMsg(`Streak reset untuk ${email}`);
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadUsers();
      onActionComplete?.();
    } catch (error) {
      setErrorMsg("Error reset streak: " + error.message);
    }
  }

  async function resetStreakByEmail() {
    if (!resetEmail.trim()) {
      setErrorMsg("Masukkan email");
      return;
    }

    await resetStreakForUser(resetEmail);
    setResetEmail("");
  }

  async function resetAllStreaks() {
    if (!window.confirm("Reset SEMUA streak user? Tindakan ini tidak bisa dibatalkan!")) return;

    try {
      const res = await base44.functions.invoke('adminManageStreaks', { action: 'resetAll' });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadUsers();
      onActionComplete?.();
    } catch (error) {
      setErrorMsg("Error reset all: " + error.message);
    }
  }

  async function deleteDuplicates(email) {
    const userProfiles = users.find(u => u.email === email)?.profiles || [];
    if (userProfiles.length <= 1) return;

    if (!window.confirm(`Hapus ${userProfiles.length - 1} duplikat untuk ${email}?`)) return;

    try {
      const res = await base44.functions.invoke('adminManageStreaks', { action: 'deleteDuplicates', email });
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadUsers();
      onActionComplete?.();
    } catch (error) {
      setErrorMsg("Error hapus duplikat: " + error.message);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1">Manajemen Streak User</h2>
        <p className="text-xs sm:text-sm text-[#8FA4C8]">Kelola dan reset daily/longest streak pengguna</p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Reset by Email Section */}
      <div className="mb-6 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
        <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Reset by Email</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="Masukkan email user"
            className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#8FA4C8]"
            onKeyPress={e => e.key === "Enter" && resetStreakByEmail()}
          />
          <button
            onClick={resetStreakByEmail}
            className="px-4 py-2 bg-[#F97316] text-white text-sm font-medium rounded-lg hover:bg-[#E55A00] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Reset All Button */}
      <div className="mb-6">
        <button
          onClick={resetAllStreaks}
          className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Reset Semua Streaks
        </button>
      </div>

      {/* Users — Mobile cards */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-[#8FA4C8] text-sm">
          Tidak ada user dengan GamificationProfile
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-2">
            {users.map(user => (
              <div key={user.email} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{user.email}</p>
                    {user.profiles.length > 1 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                        {user.profiles.length} duplikat
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => resetStreakForUser(user.email)}
                      className="p-1.5 bg-orange-50 rounded-lg text-[#F97316]"
                      title="Reset Streak"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {user.profiles.length > 1 && (
                      <button
                        onClick={() => deleteDuplicates(user.email)}
                        className="p-1.5 bg-red-50 rounded-lg text-red-600"
                        title="Hapus Duplikat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-[#8FA4C8]">Daily</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{user.daily_streak}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8FA4C8]">Best</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{user.longest_streak}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8FA4C8]">Lvl</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{user.level}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8FA4C8]">XP</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{user.total_points}</p>
                  </div>
                </div>
                {user.last_activity_date && (
                  <p className="text-[10px] text-[#8FA4C8] mt-2">Aktif terakhir: {new Date(user.last_activity_date).toLocaleDateString("id-ID")}</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left py-3 px-2 font-semibold text-[#1A1A1A]">Email</th>
                <th className="text-center py-3 px-2 font-semibold text-[#1A1A1A]">Daily Streak</th>
                <th className="text-center py-3 px-2 font-semibold text-[#1A1A1A]">Longest Streak</th>
                <th className="text-center py-3 px-2 font-semibold text-[#1A1A1A]">Level</th>
                <th className="text-center py-3 px-2 font-semibold text-[#1A1A1A]">Points</th>
                <th className="text-center py-3 px-2 font-semibold text-[#1A1A1A]">Last Activity</th>
                <th className="text-center py-3 px-2 font-semibold text-[#1A1A1A]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.email} className="border-b border-[#F2F4F7] hover:bg-[#F8FAFC]">
                  <td className="py-3 px-2 text-[#1A1A1A] font-medium">
                    <div className="flex items-center gap-2">
                      {user.email}
                      {user.profiles.length > 1 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          {user.profiles.length} duplikat
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-[#1A1A1A]">{user.daily_streak}</td>
                  <td className="py-3 px-2 text-center text-[#1A1A1A]">{user.longest_streak}</td>
                  <td className="py-3 px-2 text-center text-[#1A1A1A]">{user.level}</td>
                  <td className="py-3 px-2 text-center text-[#1A1A1A]">{user.total_points}</td>
                  <td className="py-3 px-2 text-center text-[#8FA4C8] text-xs">
                    {user.last_activity_date ? new Date(user.last_activity_date).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => resetStreakForUser(user.email)}
                        className="p-2 hover:bg-orange-50 rounded-lg text-[#F97316] transition-colors"
                        title="Reset Streak"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      {user.profiles.length > 1 && (
                        <button
                          onClick={() => deleteDuplicates(user.email)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Hapus Duplikat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      <p className="text-xs text-[#8FA4C8] mt-4">
        Total: {users.length} user dengan GamificationProfile
      </p>
    </div>
  );
}