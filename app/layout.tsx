import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import "../styles/portfolio.css";
import { Footer, Nav, ContactModal } from "@/components";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { NEXT_SEO_DEFAULT, STRUCT_DATA } from "@/app/seo_config";

// ---- Fonts — pin specific weights, force normal style ----
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: "normal",
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: "normal",
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

// ---- SEO Metadata ----
export const metadata: Metadata = NEXT_SEO_DEFAULT;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          key="profile-struct-1"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCT_DATA) }}
        />
      </head>

      {/* Google Analytics */}
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

      <body className={`${dmSans.className} antialiased text-default bg-page tracking-tight portfolio-page`}>
        <ContactModal />
        <Nav />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}