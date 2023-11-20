import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer, Nav, ContactModal } from "@/components";
// import Provider from "@/components/Provider";
import Head from "next/head";
import Script from "next/script";
import { currentYrsExp } from "../components/utils/date";
const diffExprs = currentYrsExp();

/**
 * Meta keywords for SEO
 */
export const metadata: Metadata = {
  title: `Deepak Kumar | Experienced Software Engineer | ${diffExprs.years()}+ Years Expertise`,
  applicationName: "Deepak Kumar | Software Engineer",
  description: `Experienced software engineer with ${diffExprs.years()}+ Years expertise in JavaScript. Deepak Kumar excels in crafting innovative solutions for seamless software development`,
  keywords: ["Deepak Kumar, Software Engineer, Node Js ,React Js, Javascript"],
  openGraph: {
    url: "https://imdeepak.in/",
    images: "https://myprofiledk.s3.ap-south-1.amazonaws.com/images/profile-pic-removebg-preview.png",
  },
  creator: "Deepak Kumar",
  authors: [{ name: "Deepak Kumar" }, { name: "Deepak Kumar", url: "https://imdeepak.in/" }],
  verification: {
    google: "JX0NG7dsDG67hlED07lGMa2XzCryv4PnDEzzDBwG6eg",
  },
  alternates: {
    canonical: "https://imdeepak.in/",
    languages: {
      "en-US": "/en-US",
    },
  },
  metadataBase: new URL("https://imdeepak.in/"),
};

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
        {/* </Provider> */}
      </body>
    </html>
  );
}
