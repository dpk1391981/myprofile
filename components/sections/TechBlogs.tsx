/**
 * The home page's blog strip.
 *
 * Source of truth is the agent service (`/portfolio/blogs`), same as /blog:
 * whatever is flagged **featured** in the admin is what the home page leads
 * with. The hand-written BLOG_POSTS fill in behind it and, on a slug collision,
 * the database wins — the same merge rule the sitemap, the feed and llms.txt
 * use, so the home page cannot advertise a stale copy of a post that has since
 * been edited.
 *
 * The read degrades: if the API is unreachable, `listPosts` returns [] and the
 * static posts carry the section on their own rather than blanking it.
 */
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { BLOG_POSTS } from "@/components/utils/portfolio-data";
import { listPosts, type PortfolioPost } from "@/components/utils/portfolio-api";
import { formatISTDate } from "@/components/utils/date";
import SectionHead from "./SectionHead";

/** One lead article plus two rows under it. */
const HOME_POSTS = 3;

/* Longer than the API client's 300s default on purpose. The lowest `revalidate`
   of any fetch in a route sets that route's own revalidation, and the home page
   is otherwise a daily regeneration (see app/page.tsx) — a 5-minute blog
   listing would quietly turn the whole page into a 5-minute one. Fifteen
   minutes is well inside "a post published today shows up today". */
const FEED_REVALIDATE = 900;

type HomePost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
};

const fromDb = (p: PortfolioPost): HomePost => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  date: (p.date || p.publishedAt || "").slice(0, 10),
  readTime: p.readTime,
  tags: p.tags ?? [],
  featured: Boolean(p.featured),
});

/** A post the article page will answer `noindex` for has no business taking one
 *  of three slots on the most-linked page of the site. */
const indexable = (p: PortfolioPost) =>
  !p.noIndex && !p.robots?.toLowerCase().includes("noindex");

const byDateDesc = (a: HomePost, b: HomePost) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

async function getHomePosts(): Promise<HomePost[]> {
  const [featured, latest] = await Promise.all([
    listPosts({ featured: true, limit: HOME_POSTS, revalidate: FEED_REVALIDATE }),
    listPosts({ limit: HOME_POSTS, revalidate: FEED_REVALIDATE }),
  ]);

  const seen = new Set<string>();
  const out: HomePost[] = [];
  const push = (p: HomePost) => {
    if (!p.slug || seen.has(p.slug)) return;
    seen.add(p.slug);
    out.push(p);
  };

  const fromApi = (posts: PortfolioPost[]) =>
    posts.filter(indexable).map(fromDb).sort(byDateDesc);

  // Featured first, newest of them leading; the latest posts then top the
  // section up when fewer than three articles are flagged.
  fromApi(featured.posts).forEach(push);
  fromApi(latest.posts).forEach(push);

  // Static fallback, featured first for the same reason.
  [...BLOG_POSTS]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || byDateDesc(a, b))
    .forEach(push);

  return out.slice(0, HOME_POSTS);
}

export default async function TechBlogs() {
  const posts = await getHomePosts();
  const [lead, ...rest] = posts;

  if (!lead) return null;

  return (
    <section className="bs-wrap bs-section" id="tech-blogs">
      <SectionHead
        kicker="Tech Blogs"
        title="Writing on React, AI & Architecture"
        lede="Deep dives into production engineering, Generative AI, and the MERN stack — from the front lines at India Today Group."
      />

      <div className="bs-mt-6">
        <div className="blog-lead bs-mt-5">
          <div>
            <p className="bs-eyebrow">
              {lead.featured ? "Featured article" : "Latest"}
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
                    {post.featured ? <span>Featured</span> : post.tags[0] ? <span>{post.tags[0]}</span> : null}
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
