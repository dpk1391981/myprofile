import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { BLOG_POSTS, getFeaturedPosts } from "@/components/utils/portfolio-data";
import { formatISTDate } from "@/components/utils/date";
import SectionHead from "./SectionHead";

export default function TechBlogs() {
  const featuredPosts = getFeaturedPosts();
  const allPosts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lead = featuredPosts[0] ?? allPosts[0];
  const rest = allPosts.filter((p) => p.slug !== lead?.slug).slice(0, 2);

  return (
    <section className="bs-wrap bs-section" id="tech-blogs">
      <SectionHead
        kicker="Tech Blogs"
        title="Writing on React, AI & Architecture"
        lede="Deep dives into production engineering, Generative AI, and the MERN stack — from the front lines at India Today Group."
      />

      <div className="bs-mt-6">
        {lead && (
          <div className="blog-lead bs-mt-5">
            <div>
              <p className="bs-eyebrow">
                {lead.featured ? "Lead article" : "Latest"}
                {lead.tags[0] ? ` · ${lead.tags[0]}` : ""}
              </p>
              <h2 className="blog-lead-title">
                <Link href={`/blog/${lead.slug}`} className="bs-link-plain">
                  {lead.title}
                </Link>
              </h2>
              <p className="bs-eyebrow bs-mt-3">
                <time dateTime={lead.date}>{formatISTDate(lead.date)}</time> · {lead.readTime}
              </p>
            </div>
            <div>
              <p className="blog-lead-desc" style={{ marginTop: 0 }}>{lead.description}</p>
              <div className="bs-tags bs-mt-3" style={{ gap: 6 }}>
                {lead.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="bs-tag bs-tag--outline">{tag}</span>
                ))}
              </div>
              <Link href={`/blog/${lead.slug}`} className="bs-link bs-mt-3">
                Read the article <IconArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <section className="bs-wrap bs-section--tight" style={{ paddingTop: 40 }}>
            <p className="bs-list-head">More articles</p>
            <div className="bs-mt-4">
              {rest.map((post, index) => (
                <article key={post.slug} className="blog-row">
                  <p className="blog-row-index" aria-hidden="true">
                    {String(index + 2).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="blog-row-title">
                      <Link href={`/blog/${post.slug}`} className="bs-link-plain">{post.title}</Link>
                    </h3>
                    <p className="blog-row-desc">{post.description}</p>
                    <div className="bs-tags bs-mt-2" style={{ gap: 6 }}>
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="bs-tag bs-tag--outline">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="blog-row-meta">
                    <time dateTime={post.date}>{formatISTDate(post.date)}</time>
                    <span>{post.readTime}</span>
                    {post.tags[0] ? <span>{post.tags[0]}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="bs-mt-5" style={{ textAlign: "center" }}>
          <Link href="/blog" className="bs-link">
            Read all articles <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}