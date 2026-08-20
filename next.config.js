/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Only meaningful over HTTPS; harmless in local dev, enforced by Vercel in prod.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/**
 * blogs.officialdeepak.in
 * =======================
 * The subdomain is an ALIAS of this same Vercel project, so without these
 * rules it serves a second, complete copy of the site on a second hostname —
 * duplicate content on every URL. The only reason that has been harmless so
 * far is that every canonical is built from NEXT_PUBLIC_WEB_SITE and already
 * points at the apex.
 *
 * It is a front door to the blog, not a separate site. The blog stays at
 * officialdeepak.in/blog so it keeps consolidating authority with the pages it
 * links to — /joinme, /about, and the keyword landing pages — rather than
 * splitting into a second property Google scores on its own. Everything below
 * is a 301 into the apex.
 *
 * These live here rather than in vercel.json because JSON cannot carry the
 * reasoning above, and Vercel rejects unknown keys inside a redirect entry.
 */
const BLOG_HOST = [{ type: "host", value: "blogs.officialdeepak.in" }];

// Apex pages that are NOT under /blog. Without them the catch-all at the end
// would send /about to /blog/about — a 404 where a real page exists. The
// subdomain has been answering 200 on all of these, so anything already
// crawled lands on its true home instead of dying.
const APEX_ROOT_PATHS = [
  "about", "contact", "projects", "skills", "experience", "education",
  "reviews", "joinme", "success", "moved",
  "robots.txt", "sitemap.xml", "llms.txt", "ads.txt",
  "react-developer-in-india", "software-developer-in-india",
  "javascript-developer-in-india", "full-stack-developer-in-india",
  "ai-engineer-in-india",
].join("|");

// Prefixes whose whole subtree belongs to the apex.
const APEX_PREFIXES = ["admin", "api", "assets", "_next", "favicon", "pdf"].join("|");

const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    // ORDER MATTERS: first match wins, so every specific rule sits above the
    // catch-all at the bottom.
    return [
      { source: "/", has: BLOG_HOST, destination: "https://officialdeepak.in/blog", permanent: true },

      // Already carries the prefix — must not become /blog/blog/…
      { source: "/blog", has: BLOG_HOST, destination: "https://officialdeepak.in/blog", permanent: true },
      { source: "/blog/:path*", has: BLOG_HOST, destination: "https://officialdeepak.in/blog/:path*", permanent: true },

      { source: `/:path(${APEX_ROOT_PATHS})`, has: BLOG_HOST,
        destination: "https://officialdeepak.in/:path", permanent: true },
      { source: `/:prefix(${APEX_PREFIXES})/:path*`, has: BLOG_HOST,
        destination: "https://officialdeepak.in/:prefix/:path*", permanent: true },

      // Anything else on this hostname reads as an article slug, so
      // blogs.officialdeepak.in/react-performance-optimization resolves to the
      // post rather than a 404.
      { source: "/:path*", has: BLOG_HOST,
        destination: "https://officialdeepak.in/blog/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The admin panel is stricter still: never framed, never indexed,
        // never cached by an intermediary.
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
