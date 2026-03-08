import { totalExperianceYears } from "@/components/utils/date";
import crypto from "crypto";

const GLOBAL_EMAIL = process.env.NEXT_PUBLIC_EMAIL_ID || "";
const SITE_URL = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

const yearsExp = totalExperianceYears();

const description = `Deepak Kumar — Sr Software Engineer with ${yearsExp} of experience building scalable web applications, AI-powered tools, and enterprise platforms. Expert in React.js, Node.js, Next.js, MongoDB, TypeScript, OpenAI, LangChain. Currently at India Today Group building Generative AI solutions. Based in Delhi, India.`;

const title = "Deepak Kumar | Sr Software Engineer — React, Node.js, AI/ML, Full Stack Developer";

function getGravatarUrl(email: string, size = 120): string {
  if (email) {
    const emailHash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
  }
  return "";
}

const profileImage = getGravatarUrl(GLOBAL_EMAIL);

export const NEXT_SEO_DEFAULT = {
  title,
  applicationName: "Deepak Kumar | Sr Software Engineer",
  description,
  keywords: [
    // ---- Name variations (people search your name) ----
    "Deepak Kumar",
    "Deepak Kumar developer",
    "Deepak Kumar software engineer",
    "Deepak Kumar portfolio",
    "Deepak Kumar React developer",
    "Deepak Kutniyal",
    "Deepak Kumar India Today",
    "Deepak Kumar Delhi",

    // ---- Primary role keywords ----
    "best software engineer",
    "best React developer",
    "best JavaScript developer",
    "best full stack developer",
    "best Node.js developer",
    "best frontend developer India",
    "senior software engineer India",
    "top React developer India",
    "hire React developer",
    "hire full stack developer",
    "hire Node.js developer",

    // ---- AI / ML / Generative AI (HIGH DEMAND keywords) ----
    "AI developer",
    "AI ML developer",
    "Generative AI developer",
    "OpenAI developer",
    "LangChain developer",
    "AI powered web applications",
    "AI integration developer",
    "ChatGPT integration developer",
    "AI software engineer",
    "machine learning web developer",
    "best AI developer India",
    "Generative AI engineer",
    "AI full stack developer",
    "LLM application developer",
    "RAG application developer",
    "AI chatbot developer",

    // ---- MERN Stack ----
    "MERN stack developer",
    "MERN stack expert",
    "MongoDB developer",
    "Express.js developer",
    "React.js developer",
    "Node.js developer",
    "MERN full stack developer",

    // ---- React ecosystem ----
    "React developer",
    "React.js expert",
    "Next.js developer",
    "React hooks expert",
    "React performance optimization",
    "React Native developer",
    "React TypeScript developer",
    "Redux developer",
    "React state management",
    "Server side rendering React",
    "SSR Next.js developer",
    "React component architecture",

    // ---- JavaScript / TypeScript ----
    "JavaScript developer",
    "TypeScript developer",
    "ES6+ developer",
    "JavaScript expert",
    "Full Stack JavaScript developer",
    "modern JavaScript development",

    // ---- Backend ----
    "Node.js developer",
    "Express.js developer",
    "REST API developer",
    "GraphQL developer",
    "microservices architect",
    "backend developer India",
    "API development expert",
    "serverless developer",
    "NestJS developer",

    // ---- Database ----
    "MongoDB developer",
    "MySQL developer",
    "DynamoDB developer",
    "Redis developer",
    "NoSQL database expert",
    "database design",

    // ---- Cloud / DevOps ----
    "AWS developer",
    "AWS Solutions Architect",
    "cloud computing developer",
    "Docker developer",
    "CI/CD pipeline",
    "DevOps engineer",
    "serverless architecture",

    // ---- Frontend ----
    "frontend developer",
    "UI/UX developer",
    "responsive web design",
    "Tailwind CSS developer",
    "HTML5 CSS3 developer",
    "Progressive Web App developer",
    "web performance optimization",
    "frontend architecture",
    "single page application developer",
    "SPA developer",

    // ---- Companies (social proof) ----
    "India Today Group developer",
    "Clove Dental developer",
    "Instant Systems Inc",
    "Ceekr developer",
    "Synqy developer",
    "Humanize developer",
    "Galaxy Tourism",
    "Teamwork Arts",

    // ---- Industry terms ----
    "software engineer portfolio",
    "software architect",
    "technical lead",
    "agile developer",
    "scalable web applications",
    "enterprise web development",
    "SaaS development",
    "election dashboard developer",
    "CMS developer",
    "content management system developer",
    "editorial tools developer",
    "video CMS developer",

    // ---- Location-based SEO ----
    "software engineer Delhi",
    "React developer Delhi",
    "full stack developer Delhi NCR",
    "software engineer India",
    "best developer New Delhi",
    "freelance developer India",
    "remote software engineer India",
  ],

  openGraph: {
    url: SITE_URL,
    title,
    description,
    type: "profile",
    profile: {
      firstName: "Deepak",
      lastName: "Kumar",
      gender: "male",
    },
    images: [
      {
        url: profileImage,
        alt: "Deepak Kumar — Sr Software Engineer | React, Node.js, AI/ML Developer",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    site_name: "Deepak Kumar — Software Engineer Portfolio",
  },

  creator: "Deepak Kumar",
  authors: [{ name: "Deepak Kumar", url: SITE_URL }],

  verification: {
    google: "JX0NG7dsDG67hlED07lGMa2XzCryv4PnDEzzDBwG6eg",
  },

  alternates: {
    canonical: SITE_URL,
    languages: { "en-US": "/en-US" },
  },

  twitter: {
    cardType: "summary_large_image",
    title: "Deepak Kumar | Sr Software Engineer — React, AI/ML, Full Stack",
    description: `Sr Software Engineer with ${yearsExp} exp. React.js, Node.js, AI/ML, OpenAI, LangChain. Currently at India Today Group. Open to opportunities.`,
    creator: "@deepakkutniyal",
    images: [profileImage],
    site: "https://x.com/deepakkutniyal",
    handle: "@deepakkutniyal",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
};

// ============================================================
// STRUCTURED DATA — Multiple Schema.org types for rich results
// ============================================================

// 1. Person schema (main)
const personSchema = {
  "@type": "Person",
  name: "Deepak Kumar",
  alternateName: ["Deepak Kutniyal", "DK"],
  jobTitle: "Sr Software Engineer",
  description,
  url: SITE_URL,
  image: profileImage || `${SITE_URL}/assets/images/profile-pic-removebg-preview.png`,
  email: `mailto:${GLOBAL_EMAIL}`,
  telephone: "+91-8285257636",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  sameAs: [
    "https://x.com/deepakkutniyal",
    "https://www.linkedin.com/in/dpk1391981/",
    "https://github.com/dpk1391981",
    SITE_URL,
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Jain University",
      url: "https://www.jainuniversity.ac.in/",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Ambedkar Institute of Advanced Communication Technologies & Research",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Delhi University",
    },
  ],
  worksFor: {
    "@type": "Organization",
    name: "India Today Group",
    url: "https://www.indiatodaygroup.com/",
  },
  knowsAbout: [
    "React.js", "JavaScript", "Node.js", "TypeScript", "Next.js",
    "MongoDB", "MySQL", "REST APIs", "GraphQL", "AWS",
    "Generative AI", "OpenAI", "LangChain", "ChatGPT",
    "Docker", "Microservices", "CI/CD", "Agile",
    "Full Stack Development", "Frontend Architecture",
    "AI/ML Integration", "Serverless Computing",
    "Performance Optimization", "Scalable Web Applications",
    "MERN Stack", "React Native", "Angular",
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: "Software Engineer",
    occupationalCategory: "15-1252.00",
    estimatedSalary: {
      "@type": "MonetaryAmountDistribution",
      currency: "INR",
      name: "base",
    },
    skills: "React.js, Node.js, TypeScript, MongoDB, AI/ML, OpenAI, LangChain, AWS, Docker",
  },
  potentialAction: {
    "@type": "HireAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/joinme`,
      inLanguage: "en",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "ContactPoint",
      contactType: "Professional Inquiry",
      email: `mailto:${GLOBAL_EMAIL}`,
    },
  },
};

// 2. WebSite schema (enables sitelinks in Google)
const websiteSchema = {
  "@type": "WebSite",
  name: "Deepak Kumar — Software Engineer Portfolio",
  url: SITE_URL,
  description: `Portfolio of Deepak Kumar, Sr Software Engineer with ${yearsExp} experience in React, Node.js, AI/ML`,
  author: { "@type": "Person", name: "Deepak Kumar" },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// 3. ProfilePage schema (Google profile rich results)
const profilePageSchema = {
  "@type": "ProfilePage",
  name: "Deepak Kumar Portfolio",
  url: SITE_URL,
  mainEntity: { "@type": "Person", name: "Deepak Kumar" },
  dateCreated: "2023-01-01T00:00:00+05:30",
  dateModified: new Date().toISOString(),
};

// Combined as @graph for a single JSON-LD block
export const STRUCT_DATA = {
  "@context": "https://schema.org",
  "@graph": [personSchema, websiteSchema, profilePageSchema],
};