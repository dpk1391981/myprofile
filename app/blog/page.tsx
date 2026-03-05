import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, getFeaturedPosts, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconClock, IconArrowRight, IconSparkles } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: `Blog | ${PERSONAL_INFO.fullName} — React, AI/ML, Full Stack Engineering`,
  description: `Technical blog by ${PERSONAL_INFO.fullName} — in-depth articles on React.js performance, AI/ML integration with LangChain & OpenAI, MERN stack architecture, and building scalable web applications at India Today Group.`,
  keywords: [
    "React blog", "JavaScript blog", "AI ML blog", "LangChain tutorial",
    "OpenAI tutorial", "MERN stack blog", "Next.js blog", "web development blog",
    "Deepak Kumar blog", "software engineering articles", "India Today engineering",
    "React performance", "RAG tutorial", "Generative AI tutorial",
  ],
  openGraph: {
    title: `Engineering Blog | ${PERSONAL_INFO.fullName}`,
    description: "Deep dives into React, AI/ML, Node.js, and full stack engineering from 9+ years of building production applications.",
    type: "website",
  },
};

export default function BlogPage() {
  const featured = getFeaturedPosts();
  const allPosts = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="portfolio-page">
      <section className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Engineering Blog</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Thoughts on Code, Architecture & AI
            </h1>
            <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
              Deep dives into React.js, AI/ML integration, MERN stack patterns, and lessons
              from building production applications at scale. Written by{" "}
              <strong className="text-slate-700">{PERSONAL_INFO.fullName}</strong>.
            </p>
          </header>

          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-5">
                <IconSparkles size={16} className="text-amber-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Featured</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {featured.slice(0, 2).map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card blog-card--featured">
                    <span className="blog-card-emoji">{post.coverEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{post.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        <span className="flex items-center gap-1"><IconClock size={12} /> {post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Posts */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5">All Articles</h2>
            <div className="space-y-3">
              {allPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                  <span className="blog-card-emoji blog-card-emoji--sm">{post.coverEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-0.5 line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 hidden sm:block">{post.description}</p>
                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <time className="text-[11px] text-slate-400 font-medium" dateTime={post.date}>{formatDate(post.date)}</time>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1"><IconClock size={11} /> {post.readTime}</span>
                  </div>
                  <IconArrowRight size={16} className="text-slate-300 flex-shrink-0 hidden sm:block" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}