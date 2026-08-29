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
import { MIN_PUBLIC_VIEWS } from "@/components/utils/engagement-config";
import { formatISTDate } from "@/components/utils/date";
import SectionHead from "./SectionHead";

/** One lead article plus two rows under it. */
const HOME_POSTS = 3;
const HOME_ROWS = HOME_POSTS - 1;

/**
 * How deep to look for the rows under the lead.
 *
 * The lead only ever needs the newest featured post, but the rows are a
 * ranking, and a ranking over three candidates is not one. Twelve is roughly
 * the whole featured shelf today (14 of 56 posts) without pulling the entire
 * table onto the home page's render.
 */
const TOP_POOL = 12;

/* Matches the home page's own revalidate (app/page.tsx). It used to be longer
   than the API client's 300s default, on the belief that the lowest fetch
   revalidate in a route drags the whole route down to it — it does not, and
   the cost of that belief was a blog strip that could not update between daily
   regenerations. The page number is the one that matters now; this just avoids
   holding a data-cache entry that outlives the HTML built from it. */
const FEED_REVALIDATE = 900;

type HomePost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  /** Unique visitors. 0 for the hand-written fallback posts, which are not
   *  measured — see the ranking note in `topRows`. */
  views: number;
};

const fromDb = (p: PortfolioPost): HomePost => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  date: (p.date || p.publishedAt || "").slice(0, 10),
  readTime: p.readTime,
  tags: p.tags ?? [],
  featured: Boolean(p.featured),
  views: p.views ?? 0,
});

/** A post the article page will answer `noindex` for has no business taking one
 *  of three slots on the most-linked page of the site. */
const indexable = (p: PortfolioPost) =>
  !p.noIndex && !p.robots?.toLowerCase().includes("noindex");

const byDateDesc = (a: HomePost, b: HomePost) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

const byViewsDesc = (a: HomePost, b: HomePost) => b.views - a.views || byDateDesc(a, b);

/**
 * The rows under the lead: the best of the shelf, not the next two off the
 * press.
 *
 * ═══ WHY THIS IS NOT SIMPLY "ORDER BY VIEWS" ═══
 * That is the obvious implementation and today it would be a random number
 * generator. Across 56 published posts the most-read has 19 unique visitors,
 * one other post is in double digits, and 39 are on zero. Sorting that is
 * sorting noise: the ordering would be decided by which posts happened to
 * catch a crawler, it would pin an August hackathon write-up to the home page
 * indefinitely, and every genuinely good post sits at zero next to it.
 *
 * MIN_PUBLIC_VIEWS is the site's existing answer to exactly this question —
 * it is the count below which no number is shown anywhere, because a number
 * that small argues against the thing it sits on. The same threshold decides
 * whether a number is worth RANKING by, and reusing it means there is one
 * place to change the site's mind about when traffic starts to mean something.
 *
 * So: rank by views among the posts that clear the floor, and fall back to the
 * editorial signal — the featured flag, newest first — for the slots that
 * leaves. Today that is both rows, and the strip reads as curated picks.
 * Nothing has to be changed for it to become a real popularity ranking; it
 * turns into one on its own, one row at a time, as posts cross the floor.
 */
function topRows(pool: HomePost[], lead: HomePost): HomePost[] {
  const rest = pool.filter((p) => p.slug !== lead.slug);

  const proven = rest.filter((p) => p.views >= MIN_PUBLIC_VIEWS).sort(byViewsDesc);
  const unproven = rest
    .filter((p) => p.views < MIN_PUBLIC_VIEWS)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || byDateDesc(a, b));

  return [...proven, ...unproven].slice(0, HOME_ROWS);
}

async function getHomePosts(): Promise<{ lead: HomePost; rows: HomePost[] } | null> {
  const [featured, latest] = await Promise.all([
    listPosts({ featured: true, limit: TOP_POOL, revalidate: FEED_REVALIDATE }),
    listPosts({ limit: HOME_POSTS, revalidate: FEED_REVALIDATE }),
  ]);

  const fromApi = (posts: PortfolioPost[]) =>
    posts.filter(indexable).map(fromDb).sort(byDateDesc);

  const flagged = fromApi(featured.posts);
  const recent = fromApi(latest.posts);

  // The lead is the newest FEATURED post, not the newest post. Three articles
  // a day come off the pipeline and the flag is the one gate between them and
  // the site's most-linked page; leading with whatever published last would
  // hand that slot to an unvetted draft. Newest-overall is the fallback for a
  // shelf with nothing flagged on it yet.
  const pool = [...flagged];
  const seen = new Set(pool.map((p) => p.slug));
  [...recent, ...BLOG_POSTS.map((p) => ({ ...p, views: 0 }))].forEach((p) => {
    if (p.slug && !seen.has(p.slug)) {
      seen.add(p.slug);
      pool.push(p);
    }
  });

  const lead = flagged[0] ?? pool[0];
  if (!lead) return null;

  return { lead, rows: topRows(pool, lead) };
}

export default async function TechBlogs() {
  const picked = await getHomePosts();
  if (!picked) return null;

  const { lead, rows: rest } = picked;

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
            {/* The heading has to agree with the sort. Calling a curated pair
                "Most read" while nothing has been read is the kind of claim a
                reader can check in one click, and the label flips on its own
                the moment the ranking becomes a real one. */}
            <p className="bs-list-head">
              {rest.some((p) => p.views >= MIN_PUBLIC_VIEWS) ? "Most read" : "Also worth reading"}
            </p>
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
