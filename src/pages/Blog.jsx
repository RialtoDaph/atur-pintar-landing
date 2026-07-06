import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/data/blogPosts";
import Reveal from "@/components/landing/Reveal";
import useSeo from "@/hooks/useSeo";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog Atur Pintar",
    "description": "Tips keuangan, tutorial, dan update produk dari Atur Pintar. Belajar ngatur duit dari cara nabung, budgeting, sampai investasi.",
    "url": "https://aturpintar.my.id/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Atur Pintar",
      "logo": { "@type": "ImageObject", "url": "https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" }
    },
    "blogPost": BLOG_POSTS.map((p) => ({
      "@type": "BlogPosting",
      "headline": p.title,
      "url": `https://aturpintar.my.id/blog/${p.slug}`,
      "datePublished": p.date,
      "description": p.seoDescription || p.excerpt
    }))
  };

  useSeo({
    title: "Blog Atur Pintar | Tips Keuangan & Update Produk",
    description: "Tips keuangan, tutorial, dan update produk dari Atur Pintar. Belajar ngatur duit dari cara nabung, budgeting 50/30/20, investasi pemula, sampai fitur terbaru.",
    keywords: ["tips keuangan", "blog keuangan", "cara nabung", "budgeting", "investasi pemula", "atur uang", "nana ai", "shared wallet"],
    url: "https://aturpintar.my.id/blog",
    type: "website",
    jsonLd
  });

  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 sm:px-12 lg:px-20 py-3 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo Atur Pintar" className="w-7 h-7" />
          <span className="font-black text-white text-sm tracking-tight">Atur Pintar</span>
        </div>
        <Link to="/" className="ml-auto flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-5 sm:px-12 lg:px-20 pt-28 pb-20">
        <Reveal>
          <p className="text-[#F97316] text-xs font-bold uppercase tracking-widest mb-2">Blog Atur Pintar</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">Tips keuangan, tutorial, & update produk.</h1>
          <p className="text-white/50 text-sm sm:text-base max-w-xl leading-relaxed mb-12">Belajar ngatur duit bareng tim Atur Pintar. Dari cara nabung, budgeting, sampai update fitur terbaru.</p>
        </Reveal>

        {/* Featured post */}
        <Reveal delay={80}>
          <Link to={`/blog/${featured.slug}`} className="group block card-d rounded-3xl overflow-hidden mb-10 hover:border-[#F97316]/30 transition-colors">
            <div className="grid sm:grid-cols-2 gap-0">
              <div className="aspect-[16/10] sm:aspect-auto overflow-hidden">
                <img src={featured.coverImage} alt={featured.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#F97316]/10 px-2.5 py-1 rounded-full">{featured.category}</span>
                  <span className="text-white/30 text-xs">{formatDate(featured.date)}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight group-hover:text-[#F97316] transition-colors">{featured.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                  <Clock className="w-3 h-3" /> {featured.readTime}
                </div>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Grid of remaining posts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <Link to={`/blog/${post.slug}`} className="group block card-d rounded-2xl overflow-hidden hover:border-[#F97316]/30 transition-colors h-full">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.coverImage} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-full">{post.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-[#F97316] transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-white/30 text-[11px]">
                    <span>{formatDate(post.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 sm:px-12 lg:px-20 pb-20">
        <div className="max-w-5xl mx-auto card-d rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Siap mulai atur duit bareng Atur Pintar?</h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">Gratis selamanya. Catat transaksi, pakai Nana AI, dan capai goal keuanganmu.</p>
          <button onClick={() => { window.location.href = "https://aturpintar.my.id/login"; }} className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#e05e00] text-white font-bold text-sm px-6 py-3 rounded-full transition-all">
            Mulai Gratis Sekarang →
          </button>
        </div>
      </div>
    </div>
  );
}