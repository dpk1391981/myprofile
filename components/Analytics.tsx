"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Google Analytics 4, for the public site only.
 *
 * The admin panel lives inside the same App Router tree as the marketing site,
 * so the gtag snippet in the root layout was loading on every CMS screen too.
 * That is the owner's own sessions being counted as traffic: an editor who
 * spends an hour a day in /admin/blog shows up as engaged users, inflates
 * sessions and average engagement time, and pollutes the page reports with
 * paths no visitor can reach.
 *
 * Two gates, because there are two ways to arrive at an admin screen:
 *
 *   1. A direct load or refresh of /admin/* never mounts the scripts at all,
 *      so gtag is not on the page.
 *
 *   2. A client-side navigation from a public page into /admin has already
 *      loaded gtag, and GA4's enhanced measurement fires a page_view on
 *      History API changes by default — unmounting the <Script> tags does not
 *      take back the library that is already running. `ga-disable-<ID>` is
 *      GA's own opt-out flag, read at send time rather than at load time, so
 *      setting it suppresses those hits and clearing it restores tracking when
 *      the editor navigates back out to the public site.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-YXZRZVFV9F";

export default function Analytics() {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    // Declared on window, not in gtag config: GA checks this property on every
    // send, which is what makes it work for a library that is already loaded.
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = isAdmin;
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
