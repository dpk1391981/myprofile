// ============================================================
// SITE DATA — revamp content layer (Broadsheet edition)
// Narrative copy, navigation, capabilities, services and the
// keyword landing pages. Facts live in portfolio-data.ts.
// ============================================================

import { careerYears, totalExperianceYears } from "./date";

// The env var may carry a trailing slash; strip it so joined paths never double up.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in"
).replace(/\/+$/, "");

export const YEARS = totalExperianceYears();
// Whole years for prose — "9+". Re-exported so copy never hardcodes the number.
export const YEARS_WHOLE = careerYears();

// ---------- navigation ----------
export const PRIMARY_NAV = [
  { label: "Work", href: "/projects" },
  { label: "Career", href: "/experience" },
  { label: "Skills", href: "/skills" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_NAV: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Portfolio",
    links: [
      { label: "Home", href: "/" },
      { label: "Projects & products", href: "/projects" },
      { label: "Career history", href: "/experience" },
      { label: "Skills & stack", href: "/skills" },
      { label: "Education", href: "/education" },
      { label: "Recommendations", href: "/reviews" },
    ],
  },
  {
    title: "Hire me",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "React developer in India", href: "/react-developer-in-india" },
      { label: "Software developer in India", href: "/software-developer-in-india" },
      { label: "JavaScript developer in India", href: "/javascript-developer-in-india" },
      { label: "Full stack developer in India", href: "/full-stack-developer-in-india" },
      { label: "AI engineer in India", href: "/ai-engineer-in-india" },
    ],
  },
];

// ---------- the dateline rail ----------
export const DATELINE = {
  left: "Senior Software Engineer · MERN & Generative AI",
  centre: "New Delhi, India · Remote friendly",
  right: "Open to senior & AI roles",
};

// ---------- front page ----------
export const HERO = {
  /**
   * Rendered in three parts so the years can carry the spot colour — see
   * Hero.tsx. Set as one em-dashed sentence it read as "— 9+", where the dash
   * and the plus sign sat close enough to look like one broken glyph. A full
   * stop separates the clauses instead, and the number now opens its own
   * clause where it reads as a figure rather than punctuation.
   *
   * `headline` keeps the flat string for anywhere a plain sentence is needed.
   */
  headlineParts: {
    lead: "Software that holds under load.",
    accent: `${YEARS_WHOLE} years`,
    tail: "of MERN and Generative AI in production.",
  },
  headline: `Software that holds under load. ${YEARS_WHOLE} years of MERN and Generative AI in production.`,
  lede: `${YEARS_WHOLE} years of production engineering — MERN, Next.js and TypeScript on the surface, Generative AI and real-time architecture underneath. Currently building editorial and election platforms at India Today Group (Aaj Tak), and running four products of my own.`,
  captions: {
    photo: `Deepak Kumar — ${YEARS_WHOLE} years across media, healthtech, adtech and four products of his own.`,
  },
};

export const PROOF = [
  { value: `${YEARS_WHOLE} yrs`, label: "In production" },
  { value: "Millions", label: "Daily users served" },
  { value: "17+", label: "Products shipped" },
  { value: "4", label: "Products I own" },
];

// ---------- product logos ----------
/**
 * Keyed by the project's slug in FEATURED_PROJECTS.
 *
 * Widths are the file's own aspect ratio scaled to a common 36px logo height,
 * so two square app icons and two wide wordmarks sit on the same optical line
 * without any being stretched. They are passed to next/image as explicit
 * width/height, which reserves the exact box before the file loads — a logo
 * that sizes itself after arriving is a layout shift on every card.
 */
export const PRODUCT_LOGOS: Record<string, { src: string; width: number; height: number }> = {
  plantoday:     { src: "/assets/products/plantoday.png",     width: 36,  height: 36 },  // 256×256
  trendmetoday:  { src: "/assets/products/trendmetoday.png",  width: 108, height: 36 },  // 2172×724
  vtechxhub:     { src: "/assets/products/vtecxhub.jpeg",     width: 36,  height: 36 },  // 500×500
  think4buysale: { src: "/assets/products/think4buysale.png", width: 98,  height: 36 },  // 160×59
};

// ---------- selected work ledger ----------
export interface LedgerEntry {
  title: string;
  meta: string;
  stack: string[];
  overview: string;
  result: string;
  website?: string;
}

export const SELECTED_WORK: LedgerEntry[] = [
  {
    title: "Live election dashboard",
    meta: "India Today Group | Aaj Tak · 2024–25",
    stack: ["Node.js", "React", "Redis pub/sub", "SSE"],
    overview:
      "Middleware that ingests results feeds from multiple sources, normalises them and publishes to editorial CMS platforms in real time, with a canvas-rendered constituency map on the front end.",
    result: "Live results delivered to millions of daily users through election night, without a stall",
  },
  {
    title: "AI podcast generation platform",
    meta: "India Today Group | Aaj Tak · 2025",
    stack: ["React", "Node.js", "OpenAI", "ElevenLabs"],
    overview:
      "Turns written news articles into podcast-ready audio — article processing, structured prompting, AI voice synthesis and an editorial dashboard to manage generation.",
    result: "Cut podcast production time by roughly 80%",
  },
  {
    title: "Patient relationship management",
    meta: "Clove Dental (via Instant Systems) · 2024–25",
    stack: ["Angular", "Node.js", "MySQL", "AWS"],
    overview:
      "Internal PRM handling appointments, follow-ups and clinic-level analytics, built as modular services with REST APIs for the clinical front end.",
    result: "In use across 500+ clinics and 1,200+ practitioners",
    website: "https://clovedental.in/",
  },
  {
    title: "Video and audio meeting platform",
    meta: "Humanize · 2023–24",
    stack: ["WebRTC", "Socket.io", "NestJS", "React"],
    overview:
      "Zoom-style real-time video and audio calling with screen sharing and meeting management, on a scalable signalling and media layer.",
    result: "Real-time calling shipped end to end",
    website: "https://humanize.com/",
  },
  {
    title: "Enhanced product listing analytics",
    meta: "SYNQY Corporation · 2019–23",
    stack: ["Node.js", "React", "D3.js", "DynamoDB"],
    overview:
      "Analytics and business-intelligence dashboards for a retail media product — serverless backends, interactive visualisation and live metrics.",
    result: "Four years owning the reporting stack",
    website: "https://synqy.com/",
  },
  {
    title: "Think4BuySale real-estate marketplace",
    meta: "Freelance · 2023",
    stack: ["Next.js", "Node.js", "MongoDB"],
    overview:
      "Property marketplace with listing management, advanced multi-facet search and separate buyer and seller journeys.",
    result: "Shipped solo, end to end",
    website: "https://www.think4buysale.in/",
  },
  {
    title: "VTechXHub",
    meta: "Own product · 2023",
    stack: ["Next.js", "NestJS", "MySQL"],
    overview:
      "Content publishing platform for guest posts and SEO-driven distribution, with contributor workflows and editorial management.",
    result: "Owned end to end, still running",
    website: "https://vtechxhub.com/",
  },
];

// ---------- capabilities ----------
export interface Capability {
  icon: "browsers" | "server" | "database" | "brain" | "cloud";
  title: string;
  items: string;
  detail: string;
}

export const CAPABILITIES: Capability[] = [
  {
    icon: "browsers",
    title: "Front end",
    items:
      "React.js · Next.js · TypeScript · JavaScript (ES6+) · Angular · Redux / Saga · Tailwind CSS · HTML5 & CSS3",
    detail:
      "Component architecture that survives a growing team: typed props, isolated state, code-split routes, and Core Web Vitals treated as a build-time budget rather than a post-launch clean-up.",
  },
  {
    icon: "server",
    title: "Back end",
    items:
      "Node.js · Express.js · NestJS · REST APIs · Serverless · Microservices · WebSocket & SSE · PHP",
    detail:
      "Services split along business seams, not technical ones. Idempotent write paths, queue-backed background work, and streaming transports (SSE and WebSocket) where polling would fall over.",
  },
  {
    icon: "database",
    title: "Data",
    items:
      "MongoDB (incl. Atlas Vector Search) · MySQL · DynamoDB · Redis · aggregation pipelines · caching strategy",
    detail:
      "Schema design driven by read patterns, aggregation pipelines instead of application-side joins, and a cache layer with explicit invalidation rules rather than hopeful TTLs.",
  },
  {
    icon: "brain",
    title: "AI engineering",
    items:
      "OpenAI / GPT · LangChain · RAG pipelines · embeddings & semantic search · content and voice automation",
    detail:
      "Retrieval-augmented generation built on real evaluation: chunking tuned to the corpus, vector search over MongoDB Atlas, guardrails on output, and a human review step wherever the output is published.",
  },
  {
    icon: "cloud",
    title: "Cloud & delivery",
    items:
      "AWS (Solutions Architect Associate coursework) · Docker · CI/CD · Git · Linux · Agile / Scrum",
    detail:
      "AWS-certified architecture with containerised services, pipeline-gated deploys, and observability wired in before launch — logs, metrics and alerts that name the failing component.",
  },
];

// ---------- services offered ----------
export interface Service {
  icon: "code" | "sparkle" | "tree" | "rocket";
  title: string;
  desc: string;
}

export const SERVICES: Service[] = [
  {
    icon: "code",
    title: "Full-stack product build",
    desc: "React, Next.js, Node, NestJS, MongoDB and MySQL — from idea to production.",
  },
  {
    icon: "sparkle",
    title: "AI features that ship",
    desc: "OpenAI and LangChain, RAG, semantic search, content and voice automation.",
  },
  {
    icon: "tree",
    title: "Architecture and scale",
    desc: "Microservices, real-time pipelines and caching — proven at national news scale.",
  },
  {
    icon: "rocket",
    title: "Founding engineer work",
    desc: "Idea to MVP to scale, with SEO and analytics built in from the start.",
  },
];

export const HIRE_BLURB = {
  headline: "Hiring, or need something built?",
  lede:
    "Open to senior full-stack and AI engineering roles, and to focused contract work. Delhi NCR or fully remote. I reply within 24 hours.",
  meta: ["Replies in ~24h", "Delhi NCR or fully remote", "+91 82852 57636"],
};

// ---------- about page narrative ----------
export const ABOUT_STORY: { heading: string; paras: string[] }[] = [
  {
    heading: "How it started",
    paras: [
      "I started in December 2016 at a Delhi advertising agency, writing PHP and MySQL for an e-commerce build and an internal lead tracker. It was unglamorous work with a useful lesson attached: software is only finished when somebody else can operate it without calling you.",
      "Within a year I moved to Instant Systems Inc, a product incubator, and spent nearly eight years embedded with its portfolio companies — adtech at Ceekr, retail-media analytics at SYNQY Corporation, real-time video at Humanize, and clinical software at Clove Dental. Four industries, one constant: production systems with real users attached to them.",
    ],
  },
  {
    heading: "What I do now",
    paras: [
      "Since May 2025 I have been a Senior Software Engineer at India Today Group — the publisher behind Aaj Tak and India Today — building on the MERN stack and on Generative AI across editorial and digital platforms — article generation, AI summaries, semantic search with OpenAI and LangChain, plus reusable components for editorial tooling, election dashboards and the video CMS.",
      "The election dashboard is the piece I point at when someone asks what scale means in practice: millions of daily users through results night, fed by a Node ingestion pipeline over Redis pub/sub and served as server-sent events through the CDN.",
    ],
  },
  {
    heading: "The products I own",
    paras: [
      "Alongside full-time work I build and run four of my own products. PlanToday.in is an AI-powered wedding and event vendor marketplace, where hosts search in plain English or Hinglish and an NLP parser turns that into a budget-aware vendor query. TrendMeToday.com is a real-time trend intelligence platform that clusters publisher coverage and scores each story 0–100 on measured momentum. VTechXHub.com is an SEO-driven content publishing platform, and Think4BuySale is a real-estate marketplace currently running on its development build.",
      "On both I own product, architecture, engineering and SEO. Running something end to end changes how you write code: you stop optimising for the pull request and start optimising for the invoice, the crawl budget and the on-call pager.",
    ],
  },
  {
    heading: "How I work",
    paras: [
      "I prefer boring architecture with sharp edges removed: clear service boundaries, typed contracts, caching with explicit invalidation, and observability wired in before launch rather than after the first incident. I would rather ship a small correct thing this week than a large hopeful thing next quarter.",
      "I also mentor. At India Today I run reviews with junior engineers on performance, accessibility and secure development — partly because it makes the codebase better, mostly because someone did the same for me in 2017.",
    ],
  },
];

export const ABOUT_PRINCIPLES = [
  {
    title: "Measure before you claim",
    body: "Every claim on this site maps to something I actually built and can walk you through — the architecture, the trade-offs, and what broke on the way.",
  },
  {
    title: "Own the whole path",
    body: "Product, schema, API, front end, SEO and deployment. Knowing the whole path is what lets you cut the right corner under a deadline.",
  },
  {
    title: "Write for the next engineer",
    body: "Readable beats clever. The person maintaining this in two years is usually you, with none of the context you have today.",
  },
  {
    title: "Ship, then instrument",
    body: "Launch small, watch real traffic, and let the metrics decide the next iteration instead of the loudest opinion in the room.",
  },
];

// ---------- contact page ----------
export const CONTACT_REASONS = [
  {
    title: "A senior or lead engineering role",
    body: "Full-time, Delhi NCR or fully remote. Full-stack, MERN, Next.js or AI engineering.",
  },
  {
    title: "A product you need built",
    body: "MVP to production — marketplace, dashboard, CMS or an AI feature bolted onto something that already works.",
  },
  {
    title: "An AI feature on an existing app",
    body: "RAG over your own content, semantic search, content or voice automation, evaluated properly before it ships.",
  },
  {
    title: "An architecture or performance review",
    body: "A short engagement: read the system, find what breaks under load, write down what to change and in what order.",
  },
];

export const CONTACT_FAQ = [
  {
    question: "What is the fastest way to reach Deepak Kumar?",
    answer:
      "Email is fastest — every message sent through this form lands in my inbox and I reply within 24 hours on working days. For anything urgent, call or WhatsApp +91 82852 57636.",
  },
  {
    question: "Do you take freelance and contract work?",
    answer:
      "Yes, alongside full-time work — focused engagements such as an MVP build, an AI feature, an architecture review or a performance rescue. I scope in writing before starting and do not take open-ended retainers.",
  },
  {
    question: "Do you work with teams outside India?",
    answer:
      "Yes. I am based in New Delhi (IST, UTC+5:30) and work fully remote with teams in the US, UK, Europe, Singapore and the Middle East. I keep a four-hour overlap with whichever timezone the team runs on.",
  },
  {
    question: "What does a typical engagement cost?",
    answer:
      "It depends on scope and duration, so I quote per project after a short call rather than publishing a rate card. Send a description of what you need and I will come back with a scoped estimate and a timeline.",
  },
];

// ---------- keyword landing pages ----------
export interface LandingSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface LandingPage {
  slug: string;
  keyword: string;
  h1: string;
  title: string;
  description: string;
  kicker: string;
  lede: string;
  keywords: string[];
  proof: { value: string; label: string }[];
  sections: LandingSection[];
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "ai-engineer-in-india",
    keyword: "AI engineer in India",
    h1: "AI engineer in India — Deepak Kumar",
    title: "AI Engineer in India | Deepak Kumar — Generative AI, RAG & LLM Developer",
    description:
      "Deepak Kumar is an AI engineer in India building Generative AI in production — OpenAI and LangChain, RAG pipelines on MongoDB Atlas Vector Search, semantic search and voice automation, currently shipping to readers at India Today Group (Aaj Tak). Based in New Delhi, available on-site or remote.",
    kicker: "Generative AI · RAG · LLM applications",
    lede:
      "I build AI features that reach real users, not demos that die in a notebook. Article generation, semantic search and voice automation, all running in production at a national news organisation.",
    keywords: [
      "AI engineer in India",
      "AI developer in India",
      "Generative AI engineer India",
      "LLM developer India",
      "RAG developer India",
      "OpenAI developer India",
      "LangChain developer India",
      "hire AI engineer India",
      "AI engineer New Delhi",
      "machine learning engineer India",
      "AI integration developer India",
      "Deepak Kumar AI engineer",
    ],
    proof: [
      { value: "Prod", label: "AI shipped to readers" },
      { value: "RAG", label: "On Atlas Vector Search" },
      { value: "80%", label: "Faster podcast production" },
      { value: "MCA", label: "AI & ML postgraduate" },
    ],
    sections: [
      {
        heading: "AI that reaches real users",
        body:
          "At India Today Group — the publisher behind Aaj Tak — I build Generative AI into editorial products: article generation, AI summaries and semantic search over the archive, using OpenAI and LangChain with retrieval on MongoDB Atlas Vector Search. The hard part is never the model call — it is chunking tuned to the corpus, evaluation before rollout, and an editorial review step so nothing unchecked reaches a reader.",
        bullets: [
          "AI podcast platform — articles to broadcast-ready audio, cutting production time roughly 80%",
          "RAG over an editorial archive, with retrieval quality measured rather than assumed",
          "Semantic search and AI summaries built into tools journalists use daily",
          "Structured prompting behind typed API contracts, so failures are catchable in code",
        ],
      },
      {
        heading: "How I engineer an AI feature",
        body:
          "Like any other dependency: with a latency budget, a cost budget, a fallback when it fails, and monitoring that names the failing component. An LLM call is a network call to a probabilistic service — treating it as anything more magical is how teams end up with features they cannot debug or afford.",
        bullets: [
          "Evaluation sets built from real queries before a feature is promoted",
          "Guardrails on output, plus a human review step wherever output is published",
          "Cost and latency tracked per call, alerting like any other service dependency",
          "Graceful degradation — the product still works when the model is slow or down",
        ],
      },
      {
        heading: "Full stack, so the AI actually ships",
        body:
          `An AI engineer who cannot build the product around the model tends to hand over a prototype. I bring ${YEARS_WHOLE} years of MERN and Next.js behind the AI work, which means the retrieval pipeline, the API, the dashboard and the deployment come from the same person.`,
      },
    ],
    faqs: [
      {
        question: "Who is a good AI engineer in India to hire for production work?",
        answer:
          `Deepak Kumar is a senior software and AI engineer in New Delhi with ${YEARS_WHOLE} years of production engineering and a postgraduate qualification in Artificial Intelligence and Machine Learning. He builds Generative AI features with OpenAI and LangChain at India Today Group, including RAG on MongoDB Atlas Vector Search and an AI podcast platform that cut production time roughly 80%.`,
      },
      {
        question: "What AI technologies does he work with?",
        answer:
          "OpenAI and GPT models, LangChain, retrieval-augmented generation, embeddings and semantic search, MongoDB Atlas Vector Search, ElevenLabs voice synthesis, and Python with FastAPI for ingestion pipelines — all integrated into Node.js and Next.js applications.",
      },
      {
        question: "Can he add AI features to an existing application?",
        answer:
          "Yes — that is the most common engagement. RAG over your own content, semantic search, content or voice automation, added to a working product with evaluation, guardrails, cost and latency budgets, and a fallback path when the model is unavailable.",
      },
      {
        question: "Does an AI engineer need full-stack skills?",
        answer:
          `For anything that ships, yes. Deepak brings ${YEARS_WHOLE} years of MERN and Next.js engineering behind the AI work, so the retrieval pipeline, the API, the interface and the deployment are built by one person rather than handed between specialists.`,
      },
    ],
    related: [
      { label: "Software developer in India", href: "/software-developer-in-india" },
      { label: "Full stack developer in India", href: "/full-stack-developer-in-india" },
      { label: "React developer in India", href: "/react-developer-in-india" },
    ],
  },
  {
    slug: "react-developer-in-india",
    keyword: "React developer in India",
    h1: "React developer in India — Deepak Kumar",
    title: "React Developer in India | Deepak Kumar — Senior React.js Engineer, New Delhi",
    description:
      `Deepak Kumar is a senior React developer in India with ${YEARS_WHOLE} years building production React.js and Next.js applications — including the live election dashboard serving millions of daily users at India Today Group. Available for senior roles and contract work, Delhi NCR or remote.`,
    kicker: "React.js · Next.js · TypeScript",
    lede:
      "I have written React for production since 2017 — component libraries, editorial dashboards, real-time result screens and two marketplaces of my own. If you are hiring a React developer in India, this page is the short version of what that has actually involved.",
    keywords: [
      "React developer in India",
      "React js developer India",
      "hire React developer India",
      "senior React developer India",
      "React developer Delhi",
      "React developer New Delhi",
      "freelance React developer India",
      "remote React developer India",
      "Next.js developer India",
      "React TypeScript developer India",
      "best React developer in India",
      "Deepak Kumar React developer",
    ],
    proof: [
      { value: `${YEARS_WHOLE} yrs`, label: "React in production" },
      { value: "Millions", label: "Daily users served" },
      { value: "17+", label: "Products shipped" },
      { value: "Delhi", label: "Based in India (IST)" },
    ],
    sections: [
      {
        heading: "React work that ran under real load",
        body:
          "The India Today live election dashboard is the clearest example. The front end is React, rendering a canvas constituency map and a results grid that updates from a server-sent-events stream while millions of readers follow the count. The engineering problem there is not JSX — it is keeping re-renders bounded when the data underneath changes every few hundred milliseconds.",
        bullets: [
          "Election night: live results to millions of daily users, updating continuously",
          "Editorial tooling and a video CMS built from a shared, reusable React component set",
          "AI podcast dashboard — React front end over an OpenAI and ElevenLabs generation pipeline",
          "PlanToday.in and TrendMeToday.com — two live Next.js products I own end to end",
        ],
      },
      {
        heading: "How I build React applications",
        body:
          "Typed props and isolated state, route-level code splitting, memoisation applied only where the render tree is genuinely expensive, and Core Web Vitals treated as a budget enforced in CI rather than a report read after launch. On Next.js I default to server components and streaming, and drop to the client only where interactivity actually requires it.",
        bullets: [
          "React 18, Next.js App Router, TypeScript, Redux Toolkit / Zustand, React Query",
          "SSR, ISR and streaming — chosen per route against its real cache behaviour",
          "Accessibility and semantic markup checked in review, not retrofitted",
          "Testing at the seams: component tests where logic lives, e2e on the paths that earn money",
        ],
      },
      {
        heading: "Hiring a React developer in India — how this usually works",
        body:
          "I am based in New Delhi and available for senior full-time roles across Delhi NCR or fully remote, plus focused contract work. Indian companies get an on-site option; overseas teams get a working day that overlaps Europe fully and the US east coast for several hours. Every engagement starts with a scoped, written estimate.",
      },
    ],
    faqs: [
      {
        question: "Who is the best React developer in India to hire for a production app?",
        answer:
          `Deepak Kumar is a senior React developer based in New Delhi, India, with ${YEARS_WHOLE} years of production React.js and Next.js experience. He built the India Today Group live election dashboard that serves millions of daily users, and owns two live Next.js products, PlanToday.in and TrendMeToday.com.`,
      },
      {
        question: "How much React experience does Deepak Kumar have?",
        answer:
          `He has shipped React in production since 2017 as part of ${YEARS_WHOLE} years of total software engineering experience, across news media, healthcare, adtech, real estate and his own products.`,
      },
      {
        question: "Can I hire a React developer in India for remote work?",
        answer:
          "Yes. Deepak Kumar works with teams across the US, UK, Europe, Singapore and the Middle East from New Delhi (IST, UTC+5:30), maintaining at least a four-hour overlap with the team's working day.",
      },
      {
        question: "What does a React developer in India cost?",
        answer:
          "Rates depend on scope, seniority and engagement length rather than a fixed price list. Send a short description of the work through the contact page and you will get a scoped estimate and timeline within 24 hours.",
      },
    ],
    related: [
      { label: "JavaScript developer in India", href: "/javascript-developer-in-india" },
      { label: "Full stack developer in India", href: "/full-stack-developer-in-india" },
      { label: "Software developer in India", href: "/software-developer-in-india" },
    ],
  },
  {
    slug: "software-developer-in-india",
    keyword: "software developer in India",
    h1: "Software developer in India — Deepak Kumar",
    title: "Software Developer in India | Deepak Kumar — Senior Software Engineer, New Delhi",
    description:
      `Deepak Kumar is a senior software developer in India with ${YEARS_WHOLE} years across news media, healthtech, adtech and real estate — MERN stack, Next.js, AWS and Generative AI. Available for senior roles and contract work from New Delhi or remote.`,
    kicker: "Full stack · Cloud · Generative AI",
    lede:
      "Nine years, seven companies, four industries and seventeen shipped products. If you are looking for a software developer in India who has run systems under genuine load rather than only in staging, this is the record.",
    keywords: [
      "software developer in India",
      "software engineer in India",
      "senior software developer India",
      "hire software developer India",
      "best software developer in India",
      "software developer New Delhi",
      "software engineer Delhi NCR",
      "remote software developer India",
      "freelance software developer India",
      "MERN stack developer India",
      "AWS certified developer India",
      "Deepak Kumar software developer",
    ],
    proof: [
      { value: `${YEARS_WHOLE} yrs`, label: "Since Dec 2016" },
      { value: "7", label: "Companies" },
      { value: "AWS", label: "Certified SA Associate" },
      { value: "99.99%", label: "Uptime at peak" },
    ],
    sections: [
      {
        heading: `Where the ${YEARS_WHOLE} years went`,
        body:
          "December 2016 to May 2017 at Phoenix Media, building an e-commerce platform and a lead management system in PHP. September 2017 to May 2025 at Instant Systems Inc, embedded with its portfolio companies — Ceekr, SYNQY Corporation, Humanize and Clove Dental. May 2025 to now at India Today Group as a Senior Software Engineer on MERN and Generative AI.",
        bullets: [
          "News media — election data pipelines, editorial AI tooling, video CMS",
          "Healthtech — a patient relationship system in use across 500+ dental clinics",
          "Adtech and retail media — analytics dashboards and serverless reporting at SYNQY",
          "Real-time — WebRTC video and audio meetings with screen sharing at Humanize",
        ],
      },
      {
        heading: "What I actually build",
        body:
          "Full-stack systems in JavaScript and TypeScript: React and Next.js on the front, Node.js, Express and NestJS behind, MongoDB or MySQL underneath, Redis in front of the hot paths, and AWS around all of it. Where a feature needs a language change I use it — the TrendMeToday ingestion pipeline is Python and FastAPI because that is what the job wanted.",
        bullets: [
          "Real-time delivery — Redis pub/sub, server-sent events, WebSocket, CDN-aware caching",
          "Generative AI — OpenAI and LangChain, RAG on MongoDB Atlas Vector Search, voice synthesis",
          "Cloud — AWS Solutions Architect Associate coursework, Docker, CI/CD, serverless",
          "SEO engineering — programmatic pages, JSON-LD, Core Web Vitals as a build budget",
        ],
      },
      {
        heading: "Working with a software developer based in India",
        body:
          "I work from New Delhi on IST (UTC+5:30) and take on-site work across Delhi NCR or fully remote engagements worldwide. For Indian companies that means an engineer in the same timezone who can be in the room; for overseas teams it means a full overlap with Europe and a partial one with the US, plus written handovers so nothing waits a day for a reply.",
      },
    ],
    faqs: [
      {
        question: "Who is a good senior software developer in India to hire?",
        answer:
          `Deepak Kumar is a Senior Software Engineer based in New Delhi with ${YEARS_WHOLE} years of experience across news media, healthcare, adtech and real estate. He currently builds MERN-stack and Generative AI systems at India Today Group.`,
      },
      {
        question: "What technologies does this software developer work with?",
        answer:
          "React.js, Next.js, TypeScript and Angular on the front end; Node.js, Express.js and NestJS on the back end; MongoDB, MySQL, DynamoDB and Redis for data; AWS, Docker and CI/CD for delivery; and OpenAI, LangChain and RAG pipelines for AI features.",
      },
      {
        question: "Is he available for full-time roles or only contract work?",
        answer:
          "Both. He is open to senior full-time software engineering roles in Delhi NCR or fully remote, and separately takes focused contract engagements such as MVP builds, AI features and architecture reviews.",
      },
      {
        question: "What is the largest system he has run?",
        answer:
          "India Today's live election dashboard — live results to millions of daily users on counting night, fed by a Node.js ingestion pipeline over Redis pub/sub and delivered as server-sent events through the CDN.",
      },
    ],
    related: [
      { label: "React developer in India", href: "/react-developer-in-india" },
      { label: "JavaScript developer in India", href: "/javascript-developer-in-india" },
      { label: "Full stack developer in India", href: "/full-stack-developer-in-india" },
    ],
  },
  {
    slug: "javascript-developer-in-india",
    keyword: "JavaScript developer in India",
    h1: "JavaScript developer in India — Deepak Kumar",
    title: "JavaScript Developer in India | Deepak Kumar — Senior JS & TypeScript Engineer",
    description:
      `Deepak Kumar is a senior JavaScript developer in India — ${YEARS_WHOLE} years of JavaScript and TypeScript across React, Next.js, Node.js, Express and NestJS, from real-time election pipelines to AI-powered marketplaces. Based in New Delhi, available on-site or remote.`,
    kicker: "JavaScript · TypeScript · Node.js",
    lede:
      `JavaScript on both sides of the wire since 2017 — browser, server, and the streaming layer in between. If you are hiring a JavaScript developer in India, here is what ${YEARS_WHOLE} years of it has produced.`,
    keywords: [
      "JavaScript developer in India",
      "JavaScript developer India",
      "hire JavaScript developer India",
      "senior JavaScript developer India",
      "TypeScript developer India",
      "Node.js developer India",
      "JavaScript developer Delhi",
      "full stack JavaScript developer India",
      "freelance JavaScript developer India",
      "remote JavaScript developer India",
      "ES6 developer India",
      "Deepak Kumar JavaScript developer",
    ],
    proof: [
      { value: `${YEARS_WHOLE} yrs`, label: "JavaScript in production" },
      { value: "Both", label: "Browser and server" },
      { value: "TS", label: "TypeScript by default" },
      { value: "IST", label: "New Delhi, UTC+5:30" },
    ],
    sections: [
      {
        heading: "JavaScript across the whole stack",
        body:
          "The same language from the React component down to the ingestion worker is the reason a small team can move quickly. My work has run that full span: browser rendering under live data, Node services normalising feeds from several upstreams at once, and the streaming transport joining them without a polling loop in sight.",
        bullets: [
          "Browser — React 18, Next.js App Router, Redux Toolkit, React Query, Zustand",
          "Server — Node.js, Express.js, NestJS, REST APIs, serverless handlers, BullMQ workers",
          "Real-time — Socket.io, WebRTC signalling, server-sent events over Redis pub/sub",
          "Types — TypeScript end to end, with shared contracts between client and API",
        ],
      },
      {
        heading: "The JavaScript problems worth being good at",
        body:
          `Most production JavaScript trouble is not syntax. It is event-loop starvation from synchronous work in a request handler, memory that grows because a listener was never removed, bundles that balloon after a well-meaning dependency, and cache invalidation nobody wrote down. Those are the failures I have spent ${YEARS_WHOLE} years finding and fixing.`,
        bullets: [
          "Bundle discipline — code splitting, tree shaking, dependency budgets checked in CI",
          "Backpressure and queueing so a slow upstream degrades instead of collapsing",
          "Idempotent write paths, so a retry is never a duplicate charge or a duplicate lead",
          "Profiling on real traffic — flame graphs and Web Vitals over guesswork",
        ],
      },
      {
        heading: "Hiring a JavaScript developer in India",
        body:
          "Based in New Delhi on IST, open to senior full-time roles in Delhi NCR or fully remote, and to contract work — an MVP, a rescue on a JavaScript codebase that has grown faster than its structure, or an AI feature added to an existing Node application. Reply within 24 hours, scoped estimate in writing.",
      },
    ],
    faqs: [
      {
        question: "Who is a senior JavaScript developer in India worth hiring?",
        answer:
          `Deepak Kumar, a Senior Software Engineer in New Delhi with ${YEARS_WHOLE} years of JavaScript and TypeScript in production across React, Next.js, Node.js, Express and NestJS. He builds MERN-stack and Generative AI systems at India Today Group and owns two live JavaScript products, PlanToday.in and TrendMeToday.com.`,
      },
      {
        question: "Does he work in TypeScript as well as JavaScript?",
        answer:
          "Yes — TypeScript is the default on new work, with shared types between the client and the API so a contract change fails at build time rather than in production. Existing JavaScript codebases are migrated incrementally rather than rewritten.",
      },
      {
        question: "What full-stack JavaScript experience does he have?",
        answer:
          "Nine years across the whole stack: React and Next.js in the browser, Node.js, Express and NestJS on the server, MongoDB and MySQL for data, Redis for caching and pub/sub, and real-time delivery through server-sent events, Socket.io and WebRTC.",
      },
      {
        question: "Can he join an existing JavaScript team?",
        answer:
          "Yes. He has spent most of his career embedded in existing product teams — at India Today Group and across four Instant Systems portfolio companies — and mentors junior engineers on performance, accessibility and secure development.",
      },
    ],
    related: [
      { label: "React developer in India", href: "/react-developer-in-india" },
      { label: "Software developer in India", href: "/software-developer-in-india" },
      { label: "Full stack developer in India", href: "/full-stack-developer-in-india" },
    ],
  },
  {
    slug: "full-stack-developer-in-india",
    keyword: "full stack developer in India",
    h1: "Full stack developer in India — Deepak Kumar",
    title: "Full Stack Developer in India | Deepak Kumar — MERN & Next.js Engineer, Delhi",
    description:
      `Deepak Kumar is a full stack developer in India with ${YEARS_WHOLE} years on the MERN stack, Next.js, NestJS and AWS — plus Generative AI with OpenAI and LangChain. Owns four products end to end. Hire him in Delhi NCR or fully remote.`,
    kicker: "MERN · Next.js · NestJS · AWS",
    lede:
      "Product, schema, API, front end, SEO and deploy. I have carried all six on my own products and inside teams of thirty, which is the only honest definition of full stack I know.",
    keywords: [
      "full stack developer in India",
      "full stack developer India",
      "hire full stack developer India",
      "MERN stack developer in India",
      "senior full stack developer India",
      "full stack developer Delhi NCR",
      "Next.js full stack developer India",
      "remote full stack developer India",
      "freelance full stack developer India",
      "MongoDB Express React Node developer",
      "full stack AI developer India",
      "Deepak Kumar full stack developer",
    ],
    proof: [
      { value: "MERN", label: "Primary stack" },
      { value: "2", label: "Products owned end to end" },
      { value: "500+", label: "Clinics on one system" },
      { value: "4", label: "Products I own" },
    ],
    sections: [
      {
        heading: "The full stack, end to end",
        body:
          "PlanToday.in is the cleanest proof: a Next.js front end, a NestJS and TypeORM API over MySQL, Redis and BullMQ for background work, Razorpay for payments, phone-OTP auth with JWT sessions across three roles, and programmatic SEO generating a landing page for every city × service pair. Thirteen backend modules, one engineer.",
        bullets: [
          "Front end — Next.js, React, TypeScript, Tailwind, React Query and Zustand",
          "API — NestJS and Express, REST contracts, TypeORM and Mongoose, queue workers",
          "Data — MySQL and MongoDB schema design driven by the read patterns that matter",
          "Delivery — Docker, CI/CD, AWS, PM2, and observability wired in before launch",
        ],
      },
      {
        heading: "Full stack including the AI layer",
        body:
          "At India Today Group the same stack carries Generative AI: article generation, AI summaries and semantic search built with OpenAI and LangChain, retrieval on MongoDB Atlas Vector Search, and an editorial review step before anything reaches a reader. AI is a feature inside the product, not a separate system bolted to the side of it.",
        bullets: [
          "RAG pipelines with chunking tuned to the corpus and evaluation before rollout",
          "Voice synthesis — articles to podcast audio, cutting production time roughly 80%",
          "Structured prompting behind typed API contracts, so failures are catchable",
          "Cost and latency budgets per call, monitored the same way as any other dependency",
        ],
      },
      {
        heading: "Hiring a full stack developer in India",
        body:
          "One engineer who can move from a slow query to a re-render to a cache header without a handover is usually worth more than two specialists and a coordination meeting. I am in New Delhi, available on-site across Delhi NCR or fully remote, for senior roles or scoped contract work.",
      },
    ],
    faqs: [
      {
        question: "What does a full stack developer in India actually deliver?",
        answer:
          "In Deepak Kumar's case: product definition, database schema, API, front end, SEO and deployment. He has delivered all six on his own products — PlanToday.in and TrendMeToday.com — and inside product teams at India Today Group, Clove Dental, Humanize and SYNQY Corporation.",
      },
      {
        question: "Which full stack does he specialise in?",
        answer:
          "MERN — MongoDB, Express.js, React.js and Node.js — extended with Next.js, NestJS and TypeScript, on MySQL where relational data fits better, with Redis for caching and queues and AWS for infrastructure.",
      },
      {
        question: "Can a full stack developer handle AI features too?",
        answer:
          "Yes. He builds Generative AI features on the same stack — OpenAI and LangChain, retrieval-augmented generation on MongoDB Atlas Vector Search, semantic search and voice automation — currently in production at India Today Group.",
      },
      {
        question: "How do I start an engagement?",
        answer:
          "Send a short description of the product or problem through the contact page. You get a reply within 24 hours, a short call to scope it, and a written estimate with a timeline before any work begins.",
      },
    ],
    related: [
      { label: "React developer in India", href: "/react-developer-in-india" },
      { label: "JavaScript developer in India", href: "/javascript-developer-in-india" },
      { label: "Software developer in India", href: "/software-developer-in-india" },
    ],
  },
];

export const getLandingPage = (slug: string) =>
  LANDING_PAGES.find((p) => p.slug === slug);
