import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Download, FileText, Table, Loader2, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

function fmt(n) {
  return Math.abs(Math.round(n || 0)).toLocaleString("id-ID");
}

export default function ExportLaporanModal({ onClose, user }) {
  useLockBodyScroll();
  const today = new Date().toLocaleDateString("en-CA");
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-CA");

  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportType, setExportType] = useState("transactions");
  const [exporting, setExporting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.ExportLog.filter({ created_by: user.email }, "-created_date", 10).catch(() => []),
      base44.entities.GlobalCategory.list("sort_order").catch(() => []),
      base44.entities.Account.filter({ created_by: user.email }).catch(() => []),
    ]).then(([logs, cats, accs]) => {
      setHistory(logs || []);
      setGlobalCategories(cats || []);
      setAccounts(accs || []);
      setLoadingHistory(false);
    });
  }, [user?.email]);

  function getCatName(catId) {
    const cat = globalCategories.find(c => c.id === catId);
    return cat ? `${cat.emoji || ""} ${cat.name}` : catId || "Lainnya";
  }

  function getAccName(accId) {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : accId || "-";
  }

  async function handleExport() {
    if (!user?.email) return;
    setExporting(true);
    try {
      // Fetch transactions in range
      const allTxs = await base44.entities.Transaction.filter({ created_by: user.email }, "-date", 500);
      const txs = (allTxs || []).filter(t => {
        if (t.is_deleted) return false;
        return t.date >= dateFrom && t.date <= dateTo;
      });

      let fileContent = "";
      let fileName = "";
      let fileUrl = "";

      if (exportFormat === "csv") {
        // CSV
        const headers = ["Tanggal", "Tipe", "Jumlah", "Kategori", "Catatan", "Rekening"];
        const rows = txs.map(t => [
          t.date || "",
          t.type === "income" ? "Pemasukan" : "Pengeluaran",
          t.amount || 0,
          getCatName(t.category),
          `"${(t.note || "").replace(/"/g, '""')}"`,
          getAccName(t.account_id),
        ].join(","));

        let csv = headers.join(",") + "\n" + rows.join("\n");

        if (exportType === "full_report") {
          const totalIncome = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
          const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          const summary = [
            `\nRingkasan ${dateFrom} s.d. ${dateTo}`,
            `Total Pemasukan,${totalIncome}`,
            `Total Pengeluaran,${totalExpense}`,
            `Selisih,${totalIncome - totalExpense}`,
            `Jumlah Transaksi,${txs.length}`,
            "",
            "Detail Transaksi",
            headers.join(","),
            ...rows,
          ].join("\n");
          csv = summary;
        }

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const file = new File([blob], `laporan_${dateFrom}_${dateTo}.csv`, { type: "text/csv" });
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploaded.file_url;
        fileName = `laporan_${dateFrom}_${dateTo}.csv`;

      } else {
        // PDF via jsPDF
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();

        const totalIncome = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

        // Header
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text("Laporan Keuangan - Atur Pintar", 20, 20);
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(`Periode: ${dateFrom} s.d. ${dateTo}`, 20, 30);
        doc.text(`Dibuat: ${new Date().toLocaleDateString("id-ID")}`, 20, 37);

        // Summary box
        doc.setFillColor(249, 115, 22);
        doc.rect(20, 44, 170, 1, "F");

        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("Ringkasan", 20, 54);
        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        doc.text(`Total Pemasukan : Rp ${fmt(totalIncome)}`, 20, 62);
        doc.text(`Total Pengeluaran: Rp ${fmt(totalExpense)}`, 20, 69);
        doc.text(`Selisih          : Rp ${fmt(totalIncome - totalExpense)}`, 20, 76);
        doc.text(`Jumlah Transaksi : ${txs.length}`, 20, 83);

        doc.setFillColor(249, 115, 22);
        doc.rect(20, 88, 170, 1, "F");

        // Table header
        doc.setFont(undefined, "bold");
        doc.setFontSize(9);
        let y = 96;
        doc.text("Tanggal", 20, y);
        doc.text("Tipe", 52, y);
        doc.text("Jumlah", 75, y);
        doc.text("Kategori", 110, y);
        doc.text("Catatan", 150, y);

        doc.setFont(undefined, "normal");
        y += 5;
        doc.line(20, y, 190, y);
        y += 5;

        for (const t of txs.slice(0, 50)) {
          if (y > 270) { doc.addPage(); y = 20; }
          const catName = getCatName(t.category);
          doc.text(t.date || "", 20, y);
          doc.text(t.type === "income" ? "Masuk" : "Keluar", 52, y);
          doc.text(`Rp ${fmt(t.amount)}`, 75, y);
          doc.text((catName || "").substring(0, 15), 110, y);
          doc.text((t.note || "").substring(0, 20), 150, y);
          y += 7;
        }

        if (txs.length > 50) {
          doc.text(`... dan ${txs.length - 50} transaksi lainnya`, 20, y + 5);
        }

        const pdfBlob = doc.output("blob");
        const pdfFile = new File([pdfBlob], `laporan_${dateFrom}_${dateTo}.pdf`, { type: "application/pdf" });
        const uploaded = await base44.integrations.Core.UploadFile({ file: pdfFile });
        fileUrl = uploaded.file_url;
        fileName = `laporan_${dateFrom}_${dateTo}.pdf`;
      }

      // Create ExportLog
      const log = await base44.entities.ExportLog.create({
        date_from: dateFrom,
        date_to: dateTo,
        format: exportFormat,
        type: exportType,
        status: "completed",
        file_url: fileUrl,
        record_count: txs.length,
      });

      setHistory(prev => [log, ...prev]);

      // Auto download
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      a.target = "_blank";
      a.click();

      toast.success(`${exportFormat.toUpperCase()} berhasil dibuat dan diunduh!`);
    } catch (err) {
      toast.error("Gagal ekspor: " + (err.message || ""));
    }
    setExporting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto overscroll-contain" style={{ maxHeight: "92dvh" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#F97316]" />
            <p className="font-bold text-[#1A1A1A] text-sm">Ekspor Laporan</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F2F4F7] rounded-lg"><X className="w-4 h-4 text-[#8FA4C8]" /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Date range */}
          <div>
            <p className="text-[11px] text-[#8FA4C8] mb-2 font-semibold uppercase tracking-wide">Periode</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-[#8FA4C8] mb-1">Dari</p>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none" />
              </div>
              <div>
                <p className="text-[10px] text-[#8FA4C8] mb-1">Sampai</p>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] bg-[#F8FAFC] focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Format */}
          <div>
            <p className="text-[11px] text-[#8FA4C8] mb-2 font-semibold uppercase tracking-wide">Format</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "csv", label: "CSV", icon: <Table className="w-4 h-4" />, desc: "Spreadsheet" },
                { key: "pdf", label: "PDF", icon: <FileText className="w-4 h-4" />, desc: "Laporan cetak" },
              ].map(f => (
                <button key={f.key} onClick={() => setExportFormat(f.key)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border-[1.5px] transition-all text-left ${
                    exportFormat === f.key
                      ? "border-[#F97316] bg-[#FFF7ED]"
                      : "border-[#E2E8F0] bg-[#F8FAFC]"
                  }`}>
                  <span className={exportFormat === f.key ? "text-[#F97316]" : "text-[#8FA4C8]"}>{f.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${exportFormat === f.key ? "text-[#F97316]" : "text-[#1A1A1A]"}`}>{f.label}</p>
                    <p className="text-[10px] text-[#8FA4C8]">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="text-[11px] text-[#8FA4C8] mb-2 font-semibold uppercase tracking-wide">Isi Laporan</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "transactions", label: "Transaksi", desc: "Daftar transaksi saja" },
                { key: "full_report", label: "Laporan Lengkap", desc: "+ ringkasan statistik" },
              ].map(tp => (
                <button key={tp.key} onClick={() => setExportType(tp.key)}
                  className={`px-3 py-3 rounded-xl border-[1.5px] transition-all text-left ${
                    exportType === tp.key
                      ? "border-[#F97316] bg-[#FFF7ED]"
                      : "border-[#E2E8F0] bg-[#F8FAFC]"
                  }`}>
                  <p className={`text-xs font-bold ${exportType === tp.key ? "text-[#F97316]" : "text-[#1A1A1A]"}`}>{tp.label}</p>
                  <p className="text-[10px] text-[#8FA4C8]">{tp.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-3.5 rounded-xl bg-[#F97316] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Membuat laporan..." : `Ekspor ${exportFormat.toUpperCase()}`}
          </button>

          {/* History */}
          <div>
            <p className="text-[11px] text-[#8FA4C8] mb-2 font-semibold uppercase tracking-wide">Riwayat Ekspor</p>
            {loadingHistory ? (
              <div className="py-4 flex justify-center">
                <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-[#8FA4C8] text-center py-3">Belum ada riwayat ekspor.</p>
            ) : (
              <div className="space-y-2">
                {history.map(log => (
                  <div key={log.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-3 py-2.5 border border-[#E2E8F0]">
                    <div className="flex items-center gap-2.5">
                      {log.status === "completed"
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <Clock className="w-4 h-4 text-[#8FA4C8] flex-shrink-0" />
                      }
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A1A]">{log.format?.toUpperCase()} — {log.date_from} s.d. {log.date_to}</p>
                        <p className="text-[10px] text-[#8FA4C8]">{log.record_count || 0} transaksi · {log.type}</p>
                      </div>
                    </div>
                    {log.file_url && (
                      <a href={log.file_url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#F97316] transition-colors">
                        <Download className="w-3.5 h-3.5 text-[#F97316]" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}