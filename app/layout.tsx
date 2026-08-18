import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/broadsheet.css";
import { Footer, Nav } from "@/components";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { NEXT_SEO_DEFAULT, STRUCT_DATA } from "@/app/seo_config";
import ThemeScript from "@/components/bs/ThemeScript";

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
    <html lang="en">
      <head>
        {/* Source Serif 4 — the whole system is set in it, roman and italic */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
        <script
          key="profile-struct-1"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCT_DATA) }}
        />
      </head>

      {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-YXZRZVFV9F"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YXZRZVFV9F');
        `}
      </Script>

      <body className="bs-body">
        <a href="#main" className="bs-skip">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
