import { ExternalLink, BookOpen } from "lucide-react";

const RESOURCES = [
  {
    title: "Panduan Pemula Investasi Saham",
    category: "Saham",
    url: "https://www.idx.co.id/en/",
    description: "Pelajari dasar-dasar investasi saham dari Bursa Efek Indonesia",
  },
  {
    title: "Apa itu Reksa Dana?",
    category: "Reksa Dana",
    url: "https://www.ojk.go.id",
    description: "Memahami jenis-jenis reksa dana dan cara kerjanya",
  },
  {
    title: "Investasi Crypto untuk Pemula",
    category: "Crypto",
    url: "https://www.investopedia.com/crypto",
    description: "Pengenalan lengkap tentang cryptocurrency dan blockchain",
  },
  {
    title: "Strategi Diversifikasi Portofolio",
    category: "Strategi",
    url: "https://www.investopedia.com/portfolio",
    description: "Cara membuat portofolio yang seimbang dan menguntungkan",
  },
  {
    title: "Perhitungan Pajak Investasi",
    category: "Pajak",
    url: "https://www.pajak.go.id",
    description: "Memahami kewajiban pajak atas keuntungan investasi",
  },
];

export default function EducationResources() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-[#FF6A00]" />
        <h3 className="font-bold text-[#1A1A1A] text-sm">Resources & Edukasi</h3>
      </div>

      <div className="space-y-2">
        {RESOURCES.map((resource, i) => (
          <a
            key={i}
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