import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getPostBySlug, getRelatedPosts } from "@/data/blogPosts";
import Reveal from "@/components/landing/Reveal";
import useSeo from "@/hooks/useSeo";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const canonicalUrl = `https://aturpintar.my.id/blog/${slug}`;

  const jsonLd = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.seoDescription || post.excerpt,
    "image": post.coverImage,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": { "@type": "Organization", "name": post.author },
    "publisher": {
      "@type": "Organization",
      "name": "Atur Pintar",
      "logo": { "@type": "ImageObject", "url": "https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "keywords": (post.seoKeywords || []).join(", ")
  } : null;

  useSeo({
    title: post ? `${post.title} | Blog Atur Pintar` : "Blog Atur Pintar",
    description: post?.seoDescription || post?.excerpt,
    keywords: post?.seoKeywords,
    image: post?.coverImage,
    url: canonicalUrl,
    type: "article",
    jsonLd
  });

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(slug);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 sm:px-12 lg:px-20 py-3 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo Atur Pintar" className="w-7 h-7" />
          <span className="font-black text-white text-sm tracking-tight">Atur Pintar</span>
        </div>
        <Link to="/blog" className="ml-auto flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Blog
        </Link>
      </nav>

      {/* Hero */}
      <div className="pt-28 pb-10 px-5 sm:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#F97316]/10 px-2.5 py-1 rounded-full">{post.category}</span>
              <span className="flex items-center gap-1 text-white/30 text-xs"><Clock className="w-3 h-3" /> {post.readTime}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">{post.title}</h1>
            <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-5">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-white/40 text-xs">
              <span>Oleh {post.author}</span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.date)}</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Cover image */}
      <div className="px-5 sm:px-12 lg:px-20 mb-10">
        <div className="max-w-3xl mx-auto">
          <Reveal delay={60}>
            <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 sm:px-12 lg:px-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <Reveal delay={80}>
            <article className="prose prose-invert prose-sm sm:prose-base max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 className="text-white font-bold text-lg sm:text-xl mt-8 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-white font-bold text-base sm:text-lg mt-6 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="text-white/60 text-sm sm:text-base leading-relaxed mb-4 list-disc list-inside space-y-1.5">{children}</ul>,
                  ol: ({ children }) => <ol className="text-white/60 text-sm sm:text-base leading-relaxed mb-4 list-decimal list-inside space-y-1.5">{children}</ol>,
                  li: ({ children }) => <li className="text-white/60">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                  hr: () => <hr className="border-white/10 my-8" />,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-[#F97316] pl-4 my-4 text-white/50 italic text-sm sm:text-base">{children}</blockquote>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>
          </Reveal>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 sm:px-12 lg:px-20 pb-16">
        <div className="max-w-3xl mx-auto card-d rounded-3xl p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Coba Atur Pintar Gratis</h2>
          <p className="text-white/50 text-sm mb-5 max-w-sm mx-auto">Catat transaksi, pakai Nana AI, dan capai goal keuanganmu — gratis selamanya.</p>
          <button onClick={() => { window.location.href = "https://aturpintar.my.id/login"; }} className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#e05e00] text-white font-bold text-sm px-6 py-3 rounded-full transition-all">
            Mulai Gratis →
          </button>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="px-5 sm:px-12 lg:px-20 pb-20">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-white font-bold text-lg mb-5">Baca juga</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map((rp) => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group block card-d rounded-2xl overflow-hidden hover:border-[#F97316]/30 transition-colors">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={rp.coverImage} alt={rp.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] mb-1.5 inline-block">{rp.category}</span>
                    <h4 className="text-sm font-bold text-white leading-snug group-hover:text-[#F97316] transition-colors line-clamp-2">{rp.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}