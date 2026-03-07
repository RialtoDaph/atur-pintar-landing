import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppSettings } from "@/components/utils/AppSettingsContext";

const TX_TYPE_LABELS = {
  id: { buy: "Beli", sell: "Jual", dividend: "Dividen", adjustment: "Penyesuaian" },
  en: { buy: "Buy", sell: "Sell", dividend: "Dividend", adjustment: "Adjustment" },
};

export default function InvestmentHistory({ investmentId, formatCurrency }) {
  const { settings } = useAppSettings();
  const lang = settings.language === 'en' ? 'en' : 'id';
  const typeLabels = TX_TYPE_LABELS[lang];

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && transactions.length === 0) {
      loadTransactions();
    }
  }, [expanded]);

  async function loadTransactions() {
    setLoading(true);
    const data = await base44.entities.InvestmentTransaction.filter(
      { investment_id: investmentId },
      "-transaction_date"
    );
    setTransactions(data);
    setLoading(false);
  }

  const dateLocale = lang === 'en' ? 'en-US' : 'id-ID';

  return (
    <div className="border-t border-[#E2E8F0] pt-3 mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A] hover:text-[#FF6A00] transition-colors"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {lang === 'en' ? 'Transaction History' : 'Riwayat Transaksi'}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-14 bg-[#F8FAFC] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-[#8FA4C8]">
              {lang === 'en' ? 'No transactions yet' : 'Belum ada transaksi'}
            </p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="text-xs p-2 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[#1A1A1A]">{typeLabels[tx.type] || tx.type}</span>
                  <span className="text-[#8FA4C8]">{new Date(tx.transaction_date).toLocaleDateString(dateLocale)}</span>
                </div>
                {tx.quantity && (
                  <p className="text-[#8FA4C8]">
                    {tx.quantity} {lang === 'en' ? 'units' : 'unit'} @ {formatCurrency(tx.price_per_unit)}
                  </p>
                )}
                <p className="text-[#1A1A1A] font-medium">{formatCurrency(tx.total_amount)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}