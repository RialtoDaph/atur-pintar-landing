import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function TaxCalculator({ investmentId, formatCurrency }) {
  const [taxLogs, setTaxLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    tax_type: "capital_gain",
    gross_amount: "",
    tax_rate: 15,
  });

  useEffect(() => {
    loadTaxLogs();
  }, [investmentId]);

  async function loadTaxLogs() {
    try {
      const data = await base44.entities.InvestmentTaxLog.filter(
        { investment_id: investmentId },
        "-transaction_date"
      );
      setTaxLogs(data);
    } catch (e) {
      console.error("Failed to load tax logs:", e);
    }
  }

  async function handleSaveTax() {
    if (!form.gross_amount) return;
    const gross = parseFloat(form.gross_amount);
    const rate = parseFloat(form.tax_rate);
    const taxAmount = gross * (rate / 100);
    const netAmount = gross - taxAmount;

    await base44.entities.InvestmentTaxLog.create({
      investment_id: investmentId,
      tax_type: form.tax_type,
      gross_amount: gross,
      tax_rate: rate,
      tax_amount: taxAmount,
      net_amount: netAmount,
      transaction_date: new Date().toISOString().split("T")[0],
      year: year,
    });

    setForm({ tax_type: "capital_gain", gross_amount: "", tax_rate: 15 });
    setShowForm(false);
    loadTaxLogs();
  }

  const yearTaxes = taxLogs.filter((t) => t.year === year);
  const totalTax = yearTaxes.reduce((s, t) => s + (t.tax_amount || 0), 0);

  const typeLabels = {
    capital_gain: "Capital Gain",
    dividend: "Dividen",
    interest: "Bunga",
  };

  return (
    <div className="bg-[#F8FAFC] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Perhitungan Pajak - {year}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-[#FF6A00] font-medium hover:underline"
        >
          {showForm ? "Batal" : "+ Tambah"}
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 mb-3 p-3 bg-white rounded-lg border border-[#E2E8F0]">
          <div>
            <label className="text-xs font-medium text-[#8FA4C8] block mb-1">Jenis Pajak</label>
            <select
              value={form.tax_type}
              onChange={(e) => setForm({ ...form, tax_type: e.target.value })}
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option value="capital_gain">Capital Gain</option>
              <option value="dividend">Dividen</option>
              <option value="interest">Bunga</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8FA4C8] block mb-1">Jumlah Bruto</label>
            <input
              type="number"
              placeholder="0"
              value={form.gross_amount}
              onChange={(e) => setForm({ ...form, gross_amount: e.target.value })}
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8FA4C8] block mb-1">Tarif Pajak (%)</label>
            <input
              type="number"
              placeholder="15"
              value={form.tax_rate}
              onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
              className="w-full text-xs border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>
          <button
            onClick={handleSaveTax}
            className="w-full text-xs font-medium bg-[#FF6A00] text-white py-1.5 rounded-lg hover:bg-[#e05e00]"
          >
            Simpan
          </button>
        </div>
      )}

      {yearTaxes.length > 0 && (
        <div className="space-y-1">
          {yearTaxes.map((tax) => (
            <div key={tax.id} className="text-xs p-2 bg-white rounded border border-[#E2E8F0]">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#1A1A1A]">{typeLabels[tax.tax_type]}</span>
                <span className="text-[#FF6B6B] font-medium">Pajak: {formatCurrency(tax.tax_amount)}</span>
              </div>
              <p className="text-[#8FA4C8]">Bersih: {formatCurrency(tax.net_amount)}</p>
            </div>
          ))}
          <div className="mt-2 p-2 bg-[#00C9A7]/10 rounded border border-[#00C9A7]/20">
            <p className="text-xs text-[#8FA4C8] mb-1">Total Pajak Tahun Ini</p>
            <p className="text-sm font-bold text-[#00C9A7]">{formatCurrency(totalTax)}</p>
          </div>
        </div>
      )}

      {yearTaxes.length === 0 && !showForm && (
        <p className="text-xs text-[#8FA4C8]">Belum ada catatan pajak untuk tahun {year}</p>
      )}
    </div>
  );
}