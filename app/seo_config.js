import { totalExperianceYears } from "../components/utils/date";
import crypto from "crypto";

const GLOBAL_EMAIL = 'dpk1391981@gmail.com';
const description = `Experienced React/JavaScript Developer with ${totalExperianceYears()} years of expertise. Deepak Kumar excels in developing high-quality web applications using modern frameworks like React, Node.js, and Next.js for seamless software development.`;

const title = `Deepak Kumar | Expert React & JavaScript Developer`;
// const profileImage = "https://myprofiledk.s3.ap-south-1.amazonaws.com/images/profile-pic-removebg-preview.png";


function getGravatarUrl(email, size = 120) {
  const emailHash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
}

const profileImage = getGravatarUrl(GLOBAL_EMAIL);

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
    "Full Stack Developer",
    "Angular Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "Web Development",
    "REST APIs",
    "Redux Saga",
    "Software Engineer",
    "Best HTML5 Developer",
    "Best CSS3 Developer",
    "Instant System Inc",
    "Clove Dental",
    "Dental Care Solutions",
    "Healthcare Technology",
    "Ceekr",
    "Synqy",
    "Phoenix",
    "Galaxy Tourism",
    "Humanize",
    "Microservices Architecture",
    "Backend Development",
    "Frontend Technologies",
    "SaaS Development",
    "Agile Software Development",
    "Cloud Computing",
    "Docker",
    "Continuous Integration",
    "Continuous Deployment",
    "DevOps Engineer",
    "MySQL",
    "NoSQL Databases",
    "MongoDB",
    "Software Architecture",
    "UI/UX Optimization",
    "Project Management",
    "Technical Leadership",
    "Web Application Development",
    "Responsive Web Design",
    "Digital Transformation",
    "Cross-Functional Collaboration",
    "Technical Documentation",
    "Data-Driven Development",
    "Software Scalability",
    "Performance Optimization",
    "Unit Testing",
    "Automated Testing",
    "Code Review",
    "Software Solutions",
    "Jain University",
    "Delhi University",
    "Agile Methodologies",
    "JavaScript Frameworks",
    "API Development",
    "Backend APIs",
    "Frontend Performance",
    "ES6+",
    "Bootstrap",
    "Tailwind CSS",
    "Version Control (Git)",
    "Linux",
    "API Integration",
    "Software Engineering Best Practices",
    "Software Testing",
    "Software Debugging",
    "Open Source Contributions",
    "Tech Innovator",
    "Problem-Solving",
    "Career Growth in Tech",
    "Technical Expertise in JavaScript",
    "Professional Software Solutions",
    "Scalable Web Applications",
    "Full Stack JavaScript Development",
    "Top JavaScript Developer",
    "Best React Developer",
    "Expert JavaScript Engineer",
    "Skilled React.js Developer",
    "Experienced Full Stack Engineer",
    "JavaScript Coding Expert",
    "React Specialist",
    "Senior Frontend Developer",
    "Proficient in JavaScript",
    "React Professional",
    "Certified JavaScript Developer",
    "Advanced React Techniques",
    "React Performance Optimization",
    "JavaScript Problem Solver",
    "React Component Design",
    "High-Quality JavaScript Code",
    "Scalable React Applications",
    "React State Management",
    "JavaScript ES6+ Developer",
    "Frontend Development Specialist",
    "Responsive UI Developer",
    "React Hooks Expert",
    "JavaScript Algorithms",
    "Best Practices in JavaScript",
    "JavaScript Unit Testing",
    "Reusable React Components",
    "Top Rated JavaScript Freelancer",
    "React DevTools Expert",
    "Frontend Optimization",
    "React Native Developer",
    "JavaScript Frameworks Specialist",
    "Clean Code in JavaScript",
    "Best JavaScript Practices",
    "Full Stack JavaScript Expert", 
    "Single Page Application (SPA) Developer",
    "Modern JavaScript Development",
    "React Router Expertise",
    "Proven JavaScript Skills",
    "JavaScript Project Portfolio",
    "JavaScript ESNext Features",
    "SEO-Friendly React Development",
    "High-Performance React Applications",
    "React with TypeScript",
    "Optimized JavaScript Solutions",
    "Frontend Architecture Design",
    "React Development Best Practices",
    "JavaScript Optimization Techniques",
    "UI/UX-Focused JavaScript Developer"
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
  "email": `mailto:${GLOBAL_EMAIL}`,
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
      "email": `mailto:${GLOBAL_EMAIL}`,
    }
  }
};
