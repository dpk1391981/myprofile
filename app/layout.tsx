import type { Metadata, Viewport } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "../styles/broadsheet.css";
import { Footer, Nav } from "@/components";
import SiteChrome from "@/components/SiteChrome";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/Analytics";
import ViewPreviewFlag from "@/components/shared/ViewPreviewFlag";
import Script from "next/script";
import { NEXT_SEO_DEFAULT, STRUCT_DATA } from "@/app/seo_config";
import ThemeScript from "@/components/bs/ThemeScript";

/**
 * Source Serif 4 — the whole system is set in it, roman and italic.
 *
 * WHY next/font AND NOT A <link> TO fonts.googleapis.com. The stylesheet link
 * this replaces was the site's main source of layout shift. It loads with
 * `display=swap`, so the first paint used Georgia and every glyph moved when
 * the real font arrived — worst on the front-page h1, which is set at up to
 * 4.1rem and constrained to `22ch`. `ch` is the width of the "0" glyph in the
 * *current* font, so the swap changed the headline's max-width, which changed
 * its line breaks, which changed its height, which pushed the entire page down.
 *
 * next/font fixes both halves of that:
 *   - the font is self-hosted and preloaded at build time, so there is no
 *     render-blocking round trip to a third-party origin;
 *   - `adjustFontFallback` (on by default) synthesises a Georgia-based fallback
 *     with `size-adjust`, `ascent-override` and `descent-override` tuned to
 *     Source Serif 4's metrics, so the text that paints before the swap already
 *     occupies the space the real font will take.
 *
 * No `weight` is given on purpose: Source Serif 4 is a variable font, so one
 * file covers 400/600/700 and the opsz axis the design uses.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
  fallback: ["Georgia", "Times New Roman", "Times", "serif"],
});

export const metadata: Metadata = NEXT_SEO_DEFAULT;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#171615" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sourceSerif.variable}>
      <head>
        {/* Source Serif 4 is loaded by next/font above — self-hosted, preloaded,
            and metric-matched to its fallback. Nothing to fetch here. */}
        <ThemeScript />
        <script
          key="profile-struct-1"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCT_DATA) }}
        />
      </head>

      {/* Loaded only when ads are switched on — see components/blog/AdSlot.tsx
          for the master switch. With ads off there is no reason to pull a
          third-party script onto every page in the site. */}
      {process.env.NEXT_PUBLIC_ADS_ENABLED === "true" && process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      <body className="bs-body">
        {/* Admin routes opt out of the public masthead/footer — see SiteChrome. */}
        <SiteChrome nav={<Nav />} footer={<Footer />}>
          {children}
        </SiteChrome>
        <Analytics />
        {/* Reads ?view_show=true and stamps the root element, revealing view
            counts that sit below the public floor. Ships no markup; see
            components/utils/engagement-config.ts for why this is a CSS gate
            rather than a server-side check. */}
        <ViewPreviewFlag />
        {/* GA4, public routes only — the admin panel is the site owner's own
            sessions, not traffic. See components/Analytics.tsx. */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
