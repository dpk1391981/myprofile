import type { Metadata } from "next";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconArrowRight,
} from "@tabler/icons-react";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { listBooks } from "@/components/utils/books-api";
import { listPosts } from "@/components/utils/portfolio-api";

/**
 * 404.
 *
 * A dead end is the one page guaranteed to be reached by someone who wanted
 * something. Next's default says "This page could not be found" and offers
 * nothing, so the only remaining action is the back button — every visitor who
 * lands here is lost for good.
 *
 * So this page answers the question the reader actually has, which is "where is
 * the thing I came for". It lists the newest articles and books from the live
 * data rather than a hardcoded set, because the useful destinations change and
 * a stale list on a 404 is its own dead end.
 *
 * Both fetches degrade to empty — a 404 whose own data source is down must
 * still render, or the error page becomes an error.
 *
 * NOINDEX. A 404 must never rank. Next already sends the 404 status; this makes
 * the intent explicit for crawlers that fetch the body anyway.
 */
export const metadata: Metadata = {
  title: "Page not found — Deepak Kumar",
  description: "That page does not exist. Here is where everything else lives.",
  robots: { index: false, follow: true },
};

// Rebuilt hourly. The lists change rarely and a 404 must be cheap to serve —
// it is the page a crawler hits most when something is misconfigured.
export const revalidate = 3600;

export default async function NotFound() {
  const [books, posts] = await Promise.all([
    listBooks(),
    listPosts({ limit: 4 }).then((r) => r.posts).catch(() => []),
  ]);

  return (
    <main className="bk-shell" style={{ paddingTop: 60, paddingBottom: 90 }}>
      <div className="bs-rail-thick" />

      <header style={{ paddingTop: 34 }}>
        <p className="bs-eyebrow">Error 404</p>
        <h1 className="bk-chapter-title" style={{ marginTop: 12 }}>
          That page does not exist
        </h1>
        <p className="bk-chapter-standfirst">
          It may have moved, or the link may have been mistyped. Nothing is broken on your
          end — here is everything worth reading instead.
        </p>
      </header>

      <div className="bs-rail-thin" style={{ margin: "34px 0 30px" }} />

      {/* ── Primary actions ─────────────────────────────────────────────── */}
      <div className="bs-actions">
        <Link href="/" className="bs-btn bs-btn--solid">
          Back to the home page
        </Link>
        <Link href="/contact" className="bs-btn bs-btn--outline">
          Tell me what you were looking for
        </Link>
      </div>

      {/* ── Books ───────────────────────────────────────────────────────── */}
      {books.length > 0 && (
        <section style={{ marginTop: 48 }} aria-labelledby="nf-books">
          <p className="bs-eyebrow" id="nf-books" style={{ marginBottom: 14 }}>
            Free books
          </p>
          <ol className="bk-toc">
            {books.slice(0, 3).map((b) => (
              <li key={b.id} className="bk-toc-item">
                <span className="bk-toc-num">{b.coverEmoji || "📘"}</span>
                <div style={{ minWidth: 0 }}>
                  <Link href={`/books/${b.slug}`} className="bk-toc-link">
                    {b.title}
                  </Link>
                  <p className="bk-toc-summary">
                    {b.chapters} chapters · {b.pages} pages · free to read, no signup
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Recent writing ──────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <section style={{ marginTop: 40 }} aria-labelledby="nf-posts">
          <p className="bs-eyebrow" id="nf-posts" style={{ marginBottom: 14 }}>
            Latest from the blog
          </p>
          <ol className="bk-toc">
            {posts.slice(0, 4).map((p) => (
              <li key={p.slug} className="bk-toc-item">
                <span className="bk-toc-num">{p.coverEmoji || "·"}</span>
                <div style={{ minWidth: 0 }}>
                  <Link href={`/blog/${p.slug}`} className="bk-toc-link">
                    {p.title}
                  </Link>
                  {p.description && (
                    <p className="bk-toc-summary">
                      {p.description.length > 130
                        ? p.description.slice(0, 127) + "…"
                        : p.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p style={{ marginTop: 14 }}>
            <Link href="/blog" className="bs-link">
              All articles <IconArrowRight size={14} style={{ verticalAlign: -2 }} />
            </Link>
          </p>
        </section>
      )}

      {/* ── The rest of the site ────────────────────────────────────────── */}
      <section style={{ marginTop: 44 }} aria-labelledby="nf-pages">
        <p className="bs-eyebrow" id="nf-pages" style={{ marginBottom: 14 }}>
          Everything else
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "10px 24px",
          }}
        >
          {[
            { href: "/projects", label: "Projects & products" },
            { href: "/experience", label: "Career history" },
            { href: "/skills", label: "Skills & stack" },
            { href: "/about", label: "About" },
            { href: "/books", label: "Free books" },
            { href: "/blog", label: "Engineering blog" },
            { href: "/reviews", label: "Recommendations" },
            { href: "/joinme", label: "Hire me" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="bs-link-plain" style={{ fontSize: 15.5 }}>
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Social ──────────────────────────────────────────────────────── */}
      <footer style={{ marginTop: 48, paddingTop: 26, borderTop: "1px solid var(--hair)" }}>
        <p className="bs-small bs-quiet" style={{ marginBottom: 12 }}>
          Or find me here
        </p>
        <div className="bs-socials">
          <a
            href={PERSONAL_INFO.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <IconBrandGithub size={21} />
          </a>
          <a
            href={PERSONAL_INFO.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <IconBrandLinkedin size={21} />
          </a>
          <a
            href={PERSONAL_INFO.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
          >
            <IconBrandX size={21} />
          </a>
        </div>
      </footer>
    </main>
  );
}
