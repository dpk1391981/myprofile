import { totalExperianceYears } from "../components/utils/date";

const description = `Experienced React/JavaScript Developer with ${totalExperianceYears()} years of expertise. Deepak Kumar excels in developing high-quality web applications using modern frameworks like React, Node.js, and Next.js for seamless software development.`;

const title = `Deepak Kumar | Expert React & JavaScript Developer`;
const profileImage = "https://myprofiledk.s3.ap-south-1.amazonaws.com/images/profile-pic-removebg-preview.png";

export const NEXT_SEO_DEFAULT = {
  title: title,
  applicationName: "Deepak Kumar | Sr Software Engineer",
  description: description,
  keywords: [
    "Deepak Kumar", 
    "Deepak Kutniyal", 
    "React Developer", 
    "JavaScript Developer", 
    "Frontend Developer", 
    "Node.js Developer", 
    "Angular js Developer",
    "Full Stack Developer", 
    "Next.js", 
    "TypeScript", 
    "Web Development", 
    "REST APIs", 
    "Redux Saga", 
    "Software Engineer", 
    "HTML5", 
    "CSS3"
  ],
  openGraph: {
    url: process.env.NEXT_PUBLIC_WEB_SITE,
    title: title,
    description: description,
    type: "profile",
    profile: {
      firstName: "Deepak",
      lastName: "Kumar",
      gender: "male"
    },
    images: [
      {
        url: profileImage,
        alt: "Deepak Kumar - Full Stack Engineer",
        width: 1200,
        height: 630,
      },
    ],
    site_name: "Deepak Kumar Portfolio",
  },
  creator: "Deepak Kumar",
  authors: [
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
    site: "https://x.com/deepakkutniyal?s=09",
    handle: "@deepakkutniyal",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_SITE),
};

// Enhanced Structured Data with Schema.org
export const STRUCT_DATA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Deepak Kumar",
  "jobTitle": "React/JavaScript Developer",
  "description": description,
  "url": process.env.NEXT_PUBLIC_WEB_SITE,
  "image": profileImage,
  "email": "mailto:dpk1391981@gmail.com",
  "telephone": "+91-8285257636",
  "sameAs": [
    "https://x.com/deepakkutniyal?s=09",
    "https://www.linkedin.com/in/dpk1391981/",
    "https://github.com/dpk1391981",
  ],
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "Ambedkar Institute of Advanced Communication Technologies & Research",
    "url": "https://www.yourcollegewebsite.com"
  },
  "worksFor": {
    "@type": "Organization",
    "name": "Instant system inc.",
    "url": "https://instantsys.com/"
  },
  "knowsAbout": [
    "React.js",
    "JavaScript",
    "Node.js",
    "TypeScript",
    "Next.js",
    "Frontend Development",
    "REST APIs",
    "HTML5",
    "CSS3",
    "Full Stack Development"
  ],
  "skills": [
    "JavaScript",
    "React",
    "Angular",
    "TypeScript",
    "Node.js",
    "Next.js",
    "Redux",
    "CSS",
    "HTML",
    "REST APIs",
    "PHP"
  ],
  "potentialAction": {
    "@type": "HireAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": process.env.NEXT_PUBLIC_WEB_SITE + "/contact",
      "inLanguage": "en-US",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    },
    "result": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "mailto:dpk1391981@gmail.com"
    }
  }
};
