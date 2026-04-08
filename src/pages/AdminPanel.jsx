import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [cleaning, setCleaning] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState("");

  const runDataCleanup = async () => {
    if (!window.confirm("Hapus semua data simulasi tersisa? Data Investment BBCA, Reksa Dana, Emas dan Alert yang terkait akan dihapus.")) return;
    setCleaning(true);
    try {
      // Delete Investment records by ID
      const investmentIds = ["69d6ac16b817fa58e538e224", "69d6ac16b817fa58e538e225", "69d6ac16b817fa58e538e226"];
      for (const id of investmentIds) {
        try {
          await base44.asServiceRole.entities.Investment.delete(id);
        } catch (e) {
          console.log("Investment", id, "not found");
        }
      }
      
      // Delete Alert records by ID
      const alertIds = ["69d6ac61427fef70824fe32a", "69d6ac61427fef70824fe32b", "69d6ac61427fef70824fe32c"];
      for (const id of alertIds) {
        try {
          await base44.asServiceRole.entities.Alert.delete(id);
        } catch (e) {
          console.log("Alert", id, "not found");
        }
      }
      
      // Delete any InvestmentTransaction records
      const investTx = await base44.asServiceRole.entities.InvestmentTransaction.list();
      for (const tx of investTx) {
        if (investmentIds.includes(tx.investment_id)) {
          await base44.asServiceRole.entities.InvestmentTransaction.delete(tx.id);
        }
      }
      
      // Delete any InvestmentWatchlist records
      const watchlist = await base44.asServiceRole.entities.InvestmentWatchlist.list();
      for (const w of watchlist) {
        await base44.asServiceRole.entities.InvestmentWatchlist.delete(w.id);
      }
      
      // Log action
      const user = await base44.auth.me();
      await base44.asServiceRole.entities.SystemLog.create({
        log_type: "activity",
        user_email: user?.email,
        action: "simulation_data_cleanup",
        severity: "warning",
        details: "Deleted Investment and Alert simulation records"
      });
      
      setCleanupMsg("✓ Cleanup selesai! Data simulasi tersisa dihapus.");
      setTimeout(() => setCleanupMsg(""), 5000);
    } catch (error) {
      setCleanupMsg("Error: " + error.message);
    }
    setCleaning(false);
  };

  useEffect(() => {
    navigate(createPageUrl("AdminUsers"));
  }, [navigate]);

  // Allow admin to access this page
  // (removed auto-redirect to AdminUsers)

  return (
    <AdminLayout currentPage="AdminPanel">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Admin Control Panel</h1>
      {cleanupMsg && (
        <div className={`mb-4 p-3 border rounded-lg text-sm ${
          cleanupMsg.includes("Error") 
            ? "bg-red-50 border-red-200 text-red-700" 
            : "bg-green-50 border-green-200 text-green-700"
        }`}>
          {cleanupMsg}
        </div>
      )}
      <button
        onClick={runDataCleanup}
        disabled={cleaning}
        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-60 text-lg"
      >
        {cleaning ? "Sedang membersihkan..." : "🧹 Hapus Data Simulasi Tersisa"}
        </button>
      </div>
    </AdminLayout>
  );
}