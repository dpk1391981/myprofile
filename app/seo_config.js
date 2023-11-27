import { totalExperianceYears } from "../components/utils/date";

const description = `Experienced software engineer with ${totalExperianceYears()} expertise in JavaScript. Deepak Kumar excels in crafting innovative solutions for seamless software development`;
const title = `Deepak Kumar | Experienced Software Engineer`;
const profileImage = "https://myprofiledk.s3.ap-south-1.amazonaws.com/images/profile-pic-removebg-preview.png";
export const NEXT_SEO_DEFAULT = {
  title: title,
  applicationName: "Deepak Kumar | Software Engineer",
  description: description,
  keywords: [
    "Deepak Kumar,Deepak kutniyal, Software Engineer, Node Js ,React Js, Javascript, software, saga, kutniyal",
  ],
  openGraph: {
    url: process.env.NEXT_PUBLIC_WEB_SITE,
    images: profileImage,
  },
  creator: "Deepak Kumar",
  authors: [{ name: "Deepak Kumar" }, { name: "Deepak Kumar", url: process.env.NEXT_PUBLIC_WEB_SITE }],
  verification: {
    google: "JX0NG7dsDG67hlED07lGMa2XzCryv4PnDEzzDBwG6eg",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_WEB_SITE,
    languages: {
      "en-US": "/en-US",
    },
  },
  twitter: {
    card: profileImage,
    title: "Deepak Twitte Handle",
    description: "Deepak kumar | Deepak kutniyal | twitter | @deepakkutniyal",
    creator: "@deepakkutniyal",
    images: ["https://pbs.twimg.com/profile_images/968138851955781632/zfcWlg59_normal.jpg"],
    site: "https://twitter.com/deepakkutniyal/",
    handle: "@deepakkutniyal",
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_WEB_SITE}`),
};

export const STRUCT_DATA = {
  "@context": process.env.NEXT_PUBLIC_WEB_SITE,
  "@type": "Portfolio",
  headline: title,
  description: description,
  image: [profileImage],
  author: [
    {
      "@type": "Person",
      name: "Deepak Kumar",
    },
  ],
};
