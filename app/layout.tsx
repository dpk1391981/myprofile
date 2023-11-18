import type { Metadata } from "next";
import "./globals.css";
import { Footer, Nav, ContactModal } from "@/components";
import Provider from "@/components/Provider";
import Head from "next/head";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Home | Deepak Kumar",
  description: "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <Head>
        <meta http-equiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta
          name='description'
          content='Deepak Kumar | Portfolio | Software Engineer'
          key='JavaScript | Full Stack | Node js | React js | MySql | NoSql'
        />
        <meta property='og:url' content='https://imdeepak.in/' />
        <meta
          property='og:image'
          content='https://myprofiledk.s3.ap-south-1.amazonaws.com/images/profile-pic-removebg-preview.png'
        />
        <meta name='author' content='Deepak Kumar' />
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
        <Provider>
          <ContactModal />
          <Nav />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
