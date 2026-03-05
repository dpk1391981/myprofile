import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconArrowLeft, IconClock, IconBrandTwitter, IconBrandLinkedin, IconLink } from "@tabler/icons-react";

// Generate static paths for all blog posts
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

// Dynamic SEO metadata per post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  const url = `${process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in"}/blog/${post.slug}`;

  return {
    title: `${post.title} | ${PERSONAL_INFO.fullName}`,
    description: post.description,
    keywords: [...post.tags, PERSONAL_INFO.fullName, "blog", "tutorial", "software engineering"],
    authors: [{ name: PERSONAL_INFO.fullName }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [PERSONAL_INFO.fullName],
      tags: post.tags,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: "@deepakkutniyal",
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  // Related posts — same tags, different slug
  const related = BLOG_POSTS
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: PERSONAL_INFO.fullName, url: siteUrl },
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    keywords: post.tags.join(", "),
    publisher: { "@type": "Person", name: PERSONAL_INFO.fullName },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };

  return (
    <main className="portfolio-page">
      {/* Article structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="blog-article" itemScope itemType="https://schema.org/TechArticle">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-14">
          {/* Back */}
          <Link href="/blog" className="blog-back-link">
            <IconArrowLeft size={16} /> All Articles
          </Link>

          {/* Header */}
          <header className="mb-8 md:mb-10">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-tag">{tag}</span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4" itemProp="headline">
              {post.title}
            </h1>

            <p className="text-base text-slate-500 leading-relaxed mb-5" itemProp="description">
              {post.description}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Author + Date */}
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="font-semibold text-slate-700" itemProp="author">{PERSONAL_INFO.fullName}</span>
                <span>·</span>
                <time dateTime={post.date} itemProp="datePublished">{formatDate(post.date)}</time>
                <span>·</span>
                <span className="flex items-center gap-1"><IconClock size={14} /> {post.readTime}</span>
              </div>

              {/* Share */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-share-btn"
                  aria-label="Share on Twitter"
                >
                  <IconBrandTwitter size={16} />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-share-btn"
                  aria-label="Share on LinkedIn"
                >
                  <IconBrandLinkedin size={16} />
                </a>
              </div>
            </div>
          </header>

          {/* Divider */}
          <div className="w-full h-px bg-slate-200 mb-8" />

          {/* Content */}
          <div
            className="blog-content"
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author box */}
          <div className="blog-author-box">
            <div>
              <p className="text-sm font-bold text-slate-900">{PERSONAL_INFO.fullName}</p>
              <p className="text-xs text-slate-500">{PERSONAL_INFO.title} at {PERSONAL_INFO.currentWork.company}</p>
              <p className="text-xs text-slate-400 mt-1">
                {PERSONAL_INFO.currentWork.focus.join(" · ")} · {post.tags.slice(0, 2).join(" · ")}
              </p>
            </div>
            <Link href="/joinme" className="blog-author-cta">Hire Me</Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Related Articles</h2>
              <div className="space-y-3">
                {related.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                    <span className="blog-card-emoji blog-card-emoji--sm">{p.coverEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                      <span className="text-[11px] text-slate-400">{formatDate(p.date)} · {p.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}