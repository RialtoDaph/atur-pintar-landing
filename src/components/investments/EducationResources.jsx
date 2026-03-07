import { ExternalLink, BookOpen } from "lucide-react";
import { useAppSettings } from "@/components/utils/AppSettingsContext";

const RESOURCES = {
  id: [
    { id: "stocks-idx", title: "Panduan Pemula Investasi Saham", category: "Saham", url: "https://www.idx.co.id/en/", description: "Pelajari dasar-dasar investasi saham dari Bursa Efek Indonesia" },
    { id: "reksa-dana-ojk", title: "Apa itu Reksa Dana?", category: "Reksa Dana", url: "https://www.ojk.go.id", description: "Memahami jenis-jenis reksa dana dan cara kerjanya" },
    { id: "crypto-investopedia", title: "Investasi Crypto untuk Pemula", category: "Crypto", url: "https://www.investopedia.com/crypto", description: "Pengenalan lengkap tentang cryptocurrency dan blockchain" },
    { id: "diversification-id", title: "Strategi Diversifikasi Portofolio", category: "Strategi", url: "https://www.investopedia.com/portfolio", description: "Cara membuat portofolio yang seimbang dan menguntungkan" },
    { id: "tax-pajak", title: "Perhitungan Pajak Investasi", category: "Pajak", url: "https://www.pajak.go.id", description: "Memahami kewajiban pajak atas keuntungan investasi" },
  ],
  en: [
    { id: "stocks-idx", title: "Beginner's Guide to Stock Investing", category: "Stocks", url: "https://www.idx.co.id/en/", description: "Learn the basics of stock investing from the Indonesia Stock Exchange" },
    { id: "mutual-fund", title: "What is a Mutual Fund?", category: "Mutual Fund", url: "https://www.ojk.go.id", description: "Understanding the types of mutual funds and how they work" },
    { id: "crypto-investopedia", title: "Crypto Investing for Beginners", category: "Crypto", url: "https://www.investopedia.com/crypto", description: "Complete introduction to cryptocurrency and blockchain" },
    { id: "diversification-en", title: "Portfolio Diversification Strategy", category: "Strategy", url: "https://www.investopedia.com/portfolio", description: "How to build a balanced and profitable portfolio" },
    { id: "tax-en", title: "Investment Tax Calculation", category: "Tax", url: "https://www.pajak.go.id", description: "Understanding tax obligations on investment gains" },
  ],
};

export default function EducationResources() {
  const { settings } = useAppSettings();
  const lang = settings.language === 'en' ? 'en' : 'id';
  const resources = RESOURCES[lang];
  const title = lang === 'en' ? 'Resources & Education' : 'Resources & Edukasi';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-[#FF6A00]" />
        <h3 className="font-bold text-[#1A1A1A] text-sm">{title}</h3>
      </div>

      <div className="space-y-2">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg hover:bg-[#F2F4F7] transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#8FA4C8] uppercase tracking-widest">{resource.category}</p>
              <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#FF6A00] transition-colors">{resource.title}</p>
              <p className="text-xs text-[#8FA4C8] mt-0.5">{resource.description}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8FA4C8] group-hover:text-[#FF6A00] flex-shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}