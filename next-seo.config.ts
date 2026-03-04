import { totalExperianceYears } from "./components/utils/date";
import { PERSONAL_INFO } from "./components/utils/portfolio-data";
import crypto from "crypto";

const GLOBAL_EMAIL = PERSONAL_INFO.email || process.env.NEXT_PUBLIC_EMAIL_ID || "";
const description = `Experienced React/JavaScript Developer with ${totalExperianceYears()} of expertise. ${PERSONAL_INFO.fullName} excels in developing high-quality web applications using modern frameworks like React, Node.js, and Next.js for seamless software development.`;
const title = `${PERSONAL_INFO.fullName} | Expert React & JavaScript Developer`;

function getGravatarUrl(email: string, size = 120): string {
  if (email) {
    const emailHash = crypto
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
  }
  return "";
}

const profileImage = getGravatarUrl(GLOBAL_EMAIL);

export const NEXT_SEO_DEFAULT = {
  title,
  applicationName: `${PERSONAL_INFO.fullName} | ${PERSONAL_INFO.title}`,
  description,
  keywords: [
    PERSONAL_INFO.fullName,
    "Deepak Kutniyal",
    "React Developer",
    "JavaScript Developer",
    "Frontend Developer",
    "Node.js Developer",
    "Full Stack Developer",
    "Angular Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "Web Development",
    "REST APIs",
    "Redux Saga",
    "Software Engineer",
    "Generative AI Developer",
    "MERN Stack Developer",
    "India Today Group",
    "Clove Dental",
    "Ceekr",
    "Synqy",
    "Humanize",
    "AWS Solutions Architect",
    "Microservices Architecture",
    "SaaS Development",
    "Cloud Computing",
    "MongoDB",
    "MySQL",
    "Software Architecture",
    "Technical Leadership",
    "Performance Optimization",
  ],
  openGraph: {
    url: process.env.NEXT_PUBLIC_WEB_SITE,
    title,
    description,
    type: "profile",
    profile: {
      firstName: PERSONAL_INFO.firstName,
      lastName: PERSONAL_INFO.lastName,
      gender: "male",
    },
    images: [
      {
        url: profileImage,
        alt: `${PERSONAL_INFO.fullName} - Full Stack Engineer`,
        width: 1200,
        height: 630,
      },
    ],
    site_name: `${PERSONAL_INFO.fullName} Portfolio`,
  },
  creator: PERSONAL_INFO.fullName,
  authors: [
    { name: PERSONAL_INFO.fullName, url: process.env.NEXT_PUBLIC_WEB_SITE },
  ],
  verification: {
    google: "JX0NG7dsDG67hlED07lGMa2XzCryv4PnDEzzDBwG6eg",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_WEB_SITE,
    languages: { "en-US": "/en-US" },
  },
  twitter: {
    cardType: "summary_large_image",
    title,
    description,
    creator: PERSONAL_INFO.social.twitterHandle,
    images: [profileImage],
    site: PERSONAL_INFO.social.twitter,
    handle: PERSONAL_INFO.social.twitterHandle,
  },
  metadataBase: process.env.NEXT_PUBLIC_WEB_SITE
    ? new URL(process.env.NEXT_PUBLIC_WEB_SITE)
    : undefined,
};

export const STRUCT_DATA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PERSONAL_INFO.fullName,
  jobTitle: "React/JavaScript Developer",
  description,
  url: process.env.NEXT_PUBLIC_WEB_SITE,
  image: profileImage,
  email: `mailto:${GLOBAL_EMAIL}`,
  telephone: PERSONAL_INFO.phone,
  sameAs: [
    PERSONAL_INFO.social.twitter,
    PERSONAL_INFO.social.linkedin,
    PERSONAL_INFO.social.github,
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Ambedkar Institute of Advanced Communication Technologies & Research",
  },
  worksFor: {
    "@type": "Organization",
    name: "India Today Group",
    url: "https://www.indiatodaygroup.com/",
  },
  knowsAbout: [
    "React.js", "JavaScript", "Node.js", "TypeScript", "Next.js",
    "Frontend Development", "REST APIs", "Generative AI", "MongoDB", "AWS",
  ],
  skills: [
    "JavaScript", "React", "Angular", "TypeScript", "Node.js",
    "Next.js", "Redux", "CSS", "HTML", "REST APIs", "PHP",
    "OpenAI", "LangChain", "MongoDB", "MySQL", "AWS",
  ],
  potentialAction: {
    "@type": "HireAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: (process.env.NEXT_PUBLIC_WEB_SITE || "") + "/contact",
      inLanguage: "en-US",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: `mailto:${GLOBAL_EMAIL}`,
    },
  },
};