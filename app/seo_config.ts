import type { Metadata } from "next";
import { careerYears, totalExperianceYears } from "@/components/utils/date";
import { FAQS } from "@/components/utils/portfolio-data";
import crypto from "crypto";

const GLOBAL_EMAIL = process.env.NEXT_PUBLIC_EMAIL_ID || "";
const SITE_URL = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

const yearsExp = totalExperianceYears();

/*
  TWO DESCRIPTIONS, ON PURPOSE.

  `metaDescription` is what goes in <meta name="description"> and og:description.
  A SERP snippet renders roughly 155–160 characters and drops the rest, so the
  long version below was being cut mid-sentence — everything after "…AWS, OpenAI
  and LangChain." never reached a reader, and the call to action at the end of
  it never appeared at all. This one ends before the cut.

  `description` stays long because the Person schema is not a snippet: it is
  the entity summary Google reads to work out who this is, where nothing is
  truncated and every extra fact (employer, city, products, availability) is
  another edge in the knowledge graph.
*/
const metaDescription = `Deepak Kumar — senior software and AI engineer in India, ${careerYears()} years building React, Next.js, Node.js and AI products. At India Today Group.`;

const description = `Deepak Kumar is a senior software engineer and AI engineer in India with ${yearsExp} building scalable web applications, Generative AI products and enterprise platforms — React.js, Next.js, Node.js, TypeScript, MongoDB, AWS, OpenAI and LangChain. Currently at India Today Group (Aaj Tak) in New Delhi, running four products of his own. Available for senior roles and contract work, Delhi NCR or fully remote.`;

// The home page targets the broad, high-intent terms — a specific technology
// (React, JavaScript, full stack) gets its own landing page instead.
// 76 characters was about a line and a half of a SERP title; Google renders
// ~60 and rewrites the rest. The two terms worth ranking for — the role and
// the country — now both fit, and the name still lands inside the cut.
const title = "Software & AI Engineer in India | Deepak Kumar";

function getGravatarUrl(email: string, size = 120): string {
  if (email) {
    const emailHash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
  }
  return "";
}

const profileImage = `${SITE_URL}/assets/images/og-default.png`;
// Kept for the Person schema, which wants a portrait rather than a share card.
// This is the image Google's Knowledge Panel reads, and it gets cropped square,
// so it carries no text -- unlike the OG card above.
const portraitImage = `${SITE_URL}/assets/images/deepak-kumar-react-developer-india.jpg`;
// Must match the file on disk; both are produced by scripts/generate-og.py.
const PORTRAIT_SIZE = 800;
const gravatarFallback = getGravatarUrl(GLOBAL_EMAIL);

export const NEXT_SEO_DEFAULT: Metadata = {
  title,
  applicationName: "Deepak Kumar — Software & AI Engineer",
  description: metaDescription,
  keywords: [
    // ---- Primary targets: broad, high-intent terms for the home page ----
    "software engineer in India",
    "AI engineer in India",
    "software developer in India",
    "senior software engineer India",
    "best software engineer in India",
    "full stack developer in India",
    "Generative AI engineer India",
    "AI developer in India",
    "software engineer in New Delhi",
    "hire software engineer India",
    "remote software engineer India",
    "top software engineer India",

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
    description: metaDescription,
    type: "profile",
    firstName: "Deepak",
    lastName: "Kumar",
    gender: "male",
    images: [
      {
        url: profileImage,
        alt: "Deepak Kumar — React, Node.js and Generative AI developer in India",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    siteName: "Deepak Kumar — Software Engineer Portfolio",
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
    card: "summary_large_image",
    title: "Deepak Kumar | Software & AI Engineer in India",
    description: `Sr Software Engineer with ${yearsExp} exp. React.js, Node.js, AI/ML, OpenAI, LangChain. Currently at India Today Group. Open to opportunities.`,
    creator: "@deepakkutniyal",
    images: [profileImage],
    site: "@deepakkutniyal",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1 as const,
      "max-image-preview": "large" as const,
      "max-snippet": -1 as const,
    },
  },

  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon/favicon.ico"],
  },
  manifest: "/favicon/site.webmanifest",

  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
};

// ============================================================
// STRUCTURED DATA — Multiple Schema.org types for rich results
// ============================================================

// 1. Person schema (main)
const personSchema = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Deepak Kumar",
  alternateName: ["Deepak Kutniyal", "DK"],
  jobTitle: ["Senior Software Engineer", "AI Engineer", "Full Stack Developer"],
  description,
  url: SITE_URL,
  image: {
    "@type": "ImageObject",
    url: portraitImage,
    contentUrl: portraitImage,
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    caption: "Deepak Kumar — senior React and full stack developer in New Delhi, India",
    name: "Deepak Kumar, Senior Software Engineer",
  },
  email: `mailto:${GLOBAL_EMAIL}`,
  telephone: "+91-8285257636",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  /*
    sameAs — the profiles that corroborate this entity.

    This is the property Google and answer engines use to decide that the
    Deepak Kumar on LinkedIn, on GitHub and on this domain are ONE person. A
    self-hosted page asserting its own authority is the claim search engines
    discount hardest; every independent profile here that links BACK to
    officialdeepak.in is what makes the claim resolvable.

    ONLY REAL, LIVE PROFILES BELONG HERE. A sameAs pointing at a URL that does
    not exist, or at an account belonging to a different Deepak Kumar, is worse
    than a short list: it teaches the resolver that this node's assertions are
    unreliable, and the reconciliation it was meant to help fails instead.

    Facebook and Instagram were already rendered in the site footer (see
    components/utils/SocailLinks.tsx) but were never declared here, so two
    genuine corroborating profiles were invisible to every consumer of this
    graph.

    Worth adding when the accounts exist, in rough order of value for entity
    resolution — do NOT add them speculatively:
      - a Wikidata item (answer engines lean on it hardest for "who is X")
      - Stack Overflow, npm, Dev.to / Hashnode / Medium
      - Peerlist, Topmate, Crunchbase
  */
  sameAs: [
    "https://x.com/deepakkutniyal",
    "https://www.linkedin.com/in/dpk1391981/",
    "https://github.com/dpk1391981",
    "https://www.facebook.com/dpk1391981/",
    "https://www.instagram.com/deepak_kutniyal/",
    SITE_URL,
  ],
  /*
    The four products he owns and runs. `owns` is defined on Person, and each
    target is a full node below rather than a bare string, so a consumer that
    follows the reference gets a described entity instead of a URL it has to
    guess about. This is the strongest available signal that the "17+ products
    shipped" claim on the landing pages is backed by things that exist.
  */
  owns: [
    { "@id": `${SITE_URL}/#plantoday` },
    { "@id": `${SITE_URL}/#trendmetoday` },
    { "@id": `${SITE_URL}/#vtechxhub` },
    { "@id": `${SITE_URL}/#think4buysale` },
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
    alternateName: ["Aaj Tak", "India Today Group | Aaj Tak", "TV Today Network"],
    url: "https://www.indiatodaygroup.com/",
    sameAs: ["https://www.aajtak.in/", "https://www.indiatoday.in/"],
  },
  workLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
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
  knowsLanguage: ["English", "Hindi"],
  nationality: { "@type": "Country", name: "India" },
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "course",
      name: "Ultimate AWS Certified Solutions Architect Associate SAA-C03 (course completion)",
      recognizedBy: { "@type": "Organization", name: "Udemy" },
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "MERN Stack Front To Back — Full Stack React, Redux & Node.js",
    },
  ],
  seeks: {
    "@type": "Demand",
    name: "Senior Software Engineer / Full Stack / AI-ML Engineer roles — remote or Delhi NCR",
  },
  hasOccupation: {
    "@type": "Occupation",
    name: "Software Engineer",
    occupationalCategory: "15-1252.00",
    skills: "React.js, Node.js, TypeScript, MongoDB, AI/ML, OpenAI, LangChain, AWS, Docker",
  },
  /*
    CommunicateAction — verified against schema.org's vocabulary dump, not
    recalled.

    This block previously said `HireAction`, then `ContactAction`. NEITHER TYPE
    EXISTS. Both read exactly like they should, which is the trap: the JSON is
    valid, every property is right, and a consumer discards the whole node
    because it cannot resolve the type. Since this Person schema ships from the
    root layout, that cost the potentialAction on every page of the site.

    `CommunicateAction` (InteractAction → Action) is real, and is the closest
    honest description of what this is: an invitation to get in touch, whose
    target is the enquiry page and whose result is a ContactPoint. The
    "available for work" claim itself is carried by `seeks` above — a genuine
    Person property that was correct all along.

    Anything added here is now checked by `npm run validate:schema` against
    scripts/schemaorg-vocab.json, so an invented type fails the run.
  */
  potentialAction: {
    "@type": "CommunicateAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/contact`,
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

/*
  1b. The products he owns and runs.

  WHY THESE ARE THEIR OWN NODES. Before this, PlanToday and TrendMeToday existed
  only as prose — a sentence in the bio and a card on /projects. Prose is not an
  entity: nothing connected "Deepak Kumar" to "PlanToday.in" in a form a
  resolver could follow, so four live products contributed nothing to the
  identity graph they are the best evidence for.

  Each is a WebApplication (SoftwareApplication -> CreativeWork), which is what
  they actually are — browser-delivered software, not a downloadable app and not
  an Organization. `author` and `publisher` are CreativeWork properties, so they
  are in domain here; `founder` is NOT (it is Organization-only) and is
  deliberately absent, even though it reads like the natural word.

  Every type and property here was checked against scripts/schemaorg-vocab.json.
  See the CommunicateAction note below for why that rule exists.

  THE BACKLINK IS THE OTHER HALF. This node asserts the relationship from one
  side; it is worth real ranking only when plantoday.in, trendmetoday.com,
  vtechxhub.com and think4buysale.in each link back to officialdeepak.in. Those
  are separate sites — this file cannot do it for them.
*/
const productSchemas = [
  {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#plantoday`,
    name: "PlanToday.in",
    url: "https://plantoday.in/",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description:
      "AI-powered wedding and event vendor marketplace for India. Hosts describe what they need in plain English or Hinglish and an NLP intent parser returns budget-aware, hyperlocal vendor matches; vendors get a profile, a lead inbox and a token wallet.",
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    inLanguage: ["en-IN", "hi-IN"],
  },
  {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#trendmetoday`,
    name: "TrendMeToday.com",
    url: "https://trendmetoday.com/",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description:
      "Real-time trend intelligence for India. An ingestion pipeline clusters publisher RSS coverage into single stories roughly every 15 minutes and scores each 0-100 on momentum, listing the named outlets reporting it.",
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en-IN",
  },
  {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#vtechxhub`,
    name: "VTechXHub.com",
    url: "https://vtechxhub.com/",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description:
      "SEO-driven technical content publishing platform, run on an automated multi-agent editorial pipeline.",
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en",
  },
  {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#think4buysale`,
    name: "Think4BuySale",
    url: "https://www.think4buysale.in/",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description:
      "Real-estate listing and enquiry marketplace, currently on its development build.",
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en-IN",
  },
];

// 2. WebSite schema (enables sitelinks in Google)
const websiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Deepak Kumar — Software & AI Engineer",
  url: SITE_URL,
  inLanguage: "en-IN",
  publisher: { "@id": `${SITE_URL}/#person` },
  description: `Portfolio of Deepak Kumar, Sr Software Engineer with ${yearsExp} experience in React, Node.js, AI/ML`,
  author: { "@id": `${SITE_URL}/#person` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// 3. ProfilePage schema (Google profile rich results)
const profilePageSchema = {
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  name: "Deepak Kumar — Software & AI Engineer in India",
  url: SITE_URL,
  inLanguage: "en-IN",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
  dateCreated: "2023-01-01T00:00:00+05:30",
  dateModified: new Date().toISOString(),
};

// 4. FAQPage schema (Google "People also ask" + AI answer engines / AEO)
const faqSchema = {
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

// Combined as @graph for a single JSON-LD block
// Site-wide graph, emitted from the root layout on every page.
// faqSchema is deliberately NOT included here — pages that show an FAQ emit
// their own FAQPage block, and two FAQPage blocks on one URL make Google
// discard both. The home page adds `HOME_FAQ_STRUCT_DATA` alongside this.
export const STRUCT_DATA = {
  "@context": "https://schema.org",
  "@graph": [personSchema, websiteSchema, profilePageSchema, ...productSchemas],
};

// The home page's own FAQPage block.
export const HOME_FAQ_STRUCT_DATA = {
  "@context": "https://schema.org",
  ...faqSchema,
};