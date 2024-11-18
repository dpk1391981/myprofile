import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer, Nav, ContactModal } from "@/components";
import { Analytics } from "@vercel/analytics/react";
// import Provider from "@/components/Provider";
import Head from "next/head";
import Script from "next/script";
import { NEXT_SEO_DEFAULT, STRUCT_DATA } from "@/app/seo_config";

/**
 * Meta keywords for SEO
 */
export const metadata: Metadata = NEXT_SEO_DEFAULT;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <Head>
        <link rel='shortcut icon' href='favicon.ico' />
        <script
          key='profile-struct-1'
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCT_DATA) }}
        />
      </Head>
      <Script async src='https://www.googletagmanager.com/gtag/js?id=G-YXZRZVFV9F' />
      <Script id='google-analytics'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-YXZRZVFV9F');
        `}
      </Script>

      <body className='antialiased text-default bg-page tracking-tight'>
        {/* <Provider> */}

        <ContactModal />
        <Nav />
        {children}
        <Footer />
        <Analytics />
        {/* </Provider> */}
      </body>
    </html>
  );
}
