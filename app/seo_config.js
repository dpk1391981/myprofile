import { totalExperianceYears } from "../components/utils/date";

const description = `Experienced React/JavaScript Developer with ${totalExperianceYears()} years of expertise. Deepak Kumar excels in developing robust web applications using modern frameworks like React, Node.js, and Next.js for seamless software development.`;

const title = `Deepak Kumar | Expert React & JavaScript Developer`;
const profileImage = "https://myprofiledk.s3.ap-south-1.amazonaws.com/images/profile-pic-removebg-preview.png";

export const NEXT_SEO_DEFAULT = {
  title: title,
  applicationName: "Deepak Kumar | Software Engineer",
  description: description,
  keywords: [
    "Deepak Kumar", 
    "Deepak Kutniyal", 
    "React Developer", 
    "JavaScript Developer", 
    "Software Engineer", 
    "Frontend Developer", 
    "Node.js Developer", 
    "Next.js Developer", 
    "Web Developer", 
    "Full Stack Engineer", 
    "React Hooks", 
    "JavaScript Expert", 
    "REST APIs", 
    "Redux Saga", 
    "TypeScript",
    "ReactJS",
    "HTML5", 
    "CSS3"
  ],
  openGraph: {
    url: process.env.NEXT_PUBLIC_WEB_SITE,
    title: title,
    description: description,
    images: [
      {
        url: profileImage,
        alt: "Deepak Kumar - Javascript Developer",
        width: 1200,
        height: 630,
      },
    ],
    site_name: "Deepak Kumar Portfolio",
  },
  creator: "Deepak Kumar",
  authors: [
    { name: "Deepak Kumar" },
    { name: "Deepak Kumar", url: process.env.NEXT_PUBLIC_WEB_SITE }
  ],
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
    cardType: "summary_large_image",
    title: title,
    description: description,
    creator: "@deepakkutniyal",
    images: [profileImage],
    site: "https://twitter.com/deepakkutniyal",
    handle: "@deepakkutniyal",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_SITE),
};

export const STRUCT_DATA = {
  "@context": process.env.NEXT_PUBLIC_WEB_SITE,
  "@type": "Portfolio",
  headline: title,
  name: "Deepak Kumar",
  jobTitle: "React/JavaScript Developer",
  url: process.env.NEXT_PUBLIC_WEB_SITE,
  image: profileImage,
  description: description,
  sameAs: [
    "https://twitter.com/deepakkutniyal",
    "https://www.linkedin.com/in/deepakkutniyal/",
    "https://github.com/deepakkutniyal",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Ambedkar Institute of Advanced Communication Technologies & Research",
  },
  worksFor: {
    "@type": "Organization",
    name: "Instant system inc.",
  },
  skills: [
    "React",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Next.js",
    "HTML5",
    "CSS3",
    "Redux",
    "REST APIs",
    "Frontend Development",
  ],
};
