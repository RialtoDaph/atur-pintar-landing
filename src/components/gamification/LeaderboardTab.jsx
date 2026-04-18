import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardTab({ currentUser }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Fetch all contributions and aggregate by created_by
      const [contribs, profiles] = await Promise.all([
        base44.entities.BossBattleContribution.list().catch(() => []),
        base44.entities.GamificationProfile.list().catch(() => []),
      ]);

      // Aggregate total_damage_all_time per user
      const map = {};
      for (const c of contribs || []) {
        if (!c.created_by) continue;
        if (!map[c.created_by]) map[c.created_by] = { email: c.created_by, totalDamage: 0 };
        map[c.created_by].totalDamage += c.total_damage_all_time || c.damage_dealt || 0;
      }

      // Add XP from GamificationProfile
      const profileMap = {};
      for (const p of profiles || []) {
        if (p.created_by) profileMap[p.created_by] = p;
      }

      const sorted = Object.values(map)
        .filter(e => e.totalDamage > 0)
        .map(e => ({
          ...e,
          xp: profileMap[e.email]?.total_points || 0,
          streak: profileMap[e.email]?.daily_streak || 0,
        }))
        .sort((a, b) => b.totalDamage - a.totalDamage)
        .slice(0, 20);

      setEntries(sorted);
      setLoading(false);
    }
    load();
  }, []);

  const formatEmail = (email) => {
    if (!email) return "Pengguna";
    const local = email.split("@")[0];
    // Mask middle: show first 3 chars + *** + last char
    if (local.length <= 4) return local + "@...";
    return local.slice(0, 3) + "***" + local.slice(-1) + "@...";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-2xl h-16 animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <p className="text-sm font-bold text-[#1A1A1A]">Belum ada kontributor</p>
        <p className="text-xs text-[#8FA4C8] mt-1">Serang boss untuk muncul di leaderboard!</p>
      </div>
    );
  }

  const myRank = entries.findIndex(e => e.email === currentUser?.email);

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFD700]/10 border border-[#FF6B35]/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#FF6B35] mb-0.5">🏆 Boss Battle Leaderboard</p>
        <p className="text-xs text-[#8FA4C8]">Peringkat berdasarkan total damage yang diberikan ke boss.</p>
      </div>

      {/* My rank callout */}
      {myRank >= 0 && (
        <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-lg font-black text-[#FF6B35]">#{myRank + 1}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#1A1A1A]">Peringkatmu saat ini</p>
            <p className="text-xs text-[#8FA4C8]">{entries[myRank].totalDamage.toLocaleString("id-ID")} total damage</p>
          </div>
          <span className="text-lg">👤</span>
        </div>
      )}

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pt-2 pb-4">
          {/* 2nd place */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl mb-1">🥈</span>
            <div className="bg-white rounded-t-xl rounded-b-lg shadow-sm p-3 w-full text-center border-2 border-[#C0C0C0]/30" style={{ height: 80 }}>
              <p className="text-[10px] text-[#8FA4C8] font-bold">#2</p>
              <p className="text-xs font-bold text-[#1A1A1A] truncate">{formatEmail(entries[1].email)}</p>
              <p className="text-[10px] font-black text-[#8FA4C8] mt-0.5">{entries[1].totalDamage.toLocaleString("id-ID")}</p>
            </div>
          </div>
          {/* 1st place */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl mb-1">🥇</span>
            <div className="bg-gradient-to-b from-[#FFD700]/10 to-white rounded-t-xl rounded-b-lg shadow-md p-3 w-full text-center border-2 border-[#FFD700]/40" style={{ height: 96 }}>
              <p className="text-[10px] text-[#FF6B35] font-bold">#1</p>
              <p className="text-xs font-bold text-[#1A1A1A] truncate">{formatEmail(entries[0].email)}</p>
              <p className="text-[10px] font-black text-[#FF6B35] mt-0.5">{entries[0].totalDamage.toLocaleString("id-ID")}</p>
            </div>
          </div>
          {/* 3rd place */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl mb-1">🥉</span>
            <div className="bg-white rounded-t-xl rounded-b-lg shadow-sm p-3 w-full text-center border-2 border-[#CD7F32]/20" style={{ height: 64 }}>
              <p className="text-[10px] text-[#8FA4C8] font-bold">#3</p>
              <p className="text-xs font-bold text-[#1A1A1A] truncate">{formatEmail(entries[2].email)}</p>
              <p className="text-[10px] font-black text-[#8FA4C8] mt-0.5">{entries[2].totalDamage.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {entries.map((e, i) => {
          const isMe = e.email === currentUser?.email;
          return (
            <motion.div
              key={e.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 ${isMe ? "border-2 border-[#FF6B35]/40" : ""}`}
            >
              <div className="w-8 text-center">
                {i < 3 ? (
                  <span className="text-xl">{MEDAL[i]}</span>
                ) : (
                  <span className="text-sm font-black text-[#8FA4C8]">#{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isMe ? "text-[#FF6B35]" : "text-[#1A1A1A]"}`}>
                  {isMe ? "Kamu 👤" : formatEmail(e.email)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#8FA4C8]">⚡ {e.xp.toLocaleString("id-ID")} XP</span>
                  <span className="text-[10px] text-[#8FA4C8]">🔥 {e.streak} hari</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#FF6B35]">{e.totalDamage.toLocaleString("id-ID")}</p>
                <p className="text-[10px] text-[#8FA4C8]">damage</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}