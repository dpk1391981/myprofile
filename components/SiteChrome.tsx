"use client";

import { usePathname } from "next/navigation";

/**
 * Decides whether a page gets the public site chrome.
 *
 * The admin panel lives inside the same App Router tree as the marketing site,
 * so without this gate every /admin screen inherits the broadsheet <Nav> and
 * <Footer> — a public masthead and a site-map footer wrapped around a CMS. It
 * also wrapped admin content in the site's <main>, which carries the reading
 * measure the admin grid does not want.
 *
 * Nav and Footer are passed in as slots rather than imported here so this stays
 * the only client boundary: Footer keeps rendering on the server and is simply
 * dropped from the tree on admin routes.
 */
export default function SiteChrome({
  nav,
  footer,
  children,
}: {
  nav: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <>{children}</>;
  }

  // The whole-book reader is a reading surface, not a page of the site. A
  // masthead above the title page and a sitemap footer under the last chapter
  // are exactly what stop it reading as a book — and the site's <main> carries
  // a measure the reader sets for itself. It provides its own way back in the
  // reader bar, so nothing is stranded.
  if (/^\/books\/[^/]+\/read\/?$/.test(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main" className="bs-skip">Skip to content</a>
      {nav}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
