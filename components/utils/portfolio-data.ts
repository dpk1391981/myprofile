// ============================================================
// PORTFOLIO DATA — Single source of truth
// Update ONLY this file to change all content across the site
// ============================================================

export const PERSONAL_INFO = {
  firstName: "Deepak",
  lastName: "Kumar",
  fullName: "Deepak Kumar",
  title: "Sr Software Engineer",
  tagline: "JavaScript | Full Stack | Node.js | React.js | Angular | MySQL | NoSQL",
  bio: `Experienced Software Engineer combining technical expertise, strategic problem-solving, and leadership abilities. Skilled in guiding teams to deliver scalable solutions, optimizing processes, and adapting to new technologies. Passionate about creating innovative solutions and driving success in the fast-paced software development landscape.`,
  careerStartDate: { year: "2016", month: "12", day: "01" },
  email: process.env.NEXT_PUBLIC_EMAIL_ID || "",
  phone: "+91-8285257636",
  website: process.env.NEXT_PUBLIC_WEB_SITE || "",
  location: "India",
  social: {
    twitter: "https://x.com/deepakkutniyal",
    twitterHandle: "@deepakkutniyal",
    linkedin: "https://www.linkedin.com/in/dpk1391981/",
    github: "https://github.com/dpk1391981",
  },
  profileImage: "/assets/images/profile-pic-removebg-preview.png",
  avatarInitials: "DK",
  currentWork: {
    company: "India Today Group",
    logo: "/assets/projects/group-logo.png",
    url: "https://www.indiatodaygroup.com/",
    role: "Sr Software Engineer",
    focus: ["MERN Stack", "Generative AI"],
    highlights: [
      "Architecting scalable web apps with MongoDB, Express, React & Node.js",
      "Integrating OpenAI & LangChain for content automation & intelligent search",
      "Building editorial tools, election dashboards & video CMS components",
    ],
  },
};

// ============================================================
// EXPERIENCE DATA
// ============================================================
export interface ChildProject {
  title: string;
  type: string;
  overview: string;
  technologies: string[];
  website?: string;
}

export interface ExperienceChild {
  company: string;
  logo: string;
  logoAlt: string;
  url: string;
  role: string;
  startDate: { year: string; month: string; day: string };
  endDate: { year: string; month: string; day: string } | null;
  dateLabel: string;
  description: string;
  tools: string[];
  highlights: string[];
  projects?: ChildProject[];
}

export interface ExperienceItem {
  company: string;
  logo: string;
  logoAlt: string;
  url: string;
  role: string;
  startDate: { year: string; month: string; day: string };
  endDate: { year: string; month: string; day: string } | null;
  isCurrent: boolean;
  dateLabel: string;
  description: string;
  tools: string[];
  highlights: string[];
  children?: ExperienceChild[];
  projects?: ChildProject[];
}

export const EXPERIENCES: ExperienceItem[] = [
  {
    company: "India Today Group",
    logo: "/assets/projects/group-logo.png",
    logoAlt: "Deepak Kumar - India Today Group",
    url: "https://www.indiatodaygroup.com/",
    role: "Sr Software Engineer",
    startDate: { year: "2025", month: "05", day: "14" },
    endDate: null,
    isCurrent: true,
    dateLabel: "May 2025 - Current",
    description:
      "Working as a Senior Developer focusing on the MERN Stack and Generative AI applications within India Today's digital and editorial platforms.",
    tools: ["Node.js", "React.js", "MongoDB", "Express.js", "OpenAI", "LangChain", "AWS"],
    highlights: [
      "Architecting and developing scalable web applications using MongoDB, Express.js, React.js, and Node.js.",
      "Integrating Generative AI models (e.g., OpenAI, LangChain) for content automation like article generation, AI summaries, and intelligent search.",
      "Building reusable and modular components for cross-platform use in editorial tools, election dashboards, and video CMS.",
      "Collaborating with editorial and product teams to deploy AI-powered features that improve content speed, SEO, and user engagement.",
      "Mentoring junior developers and maintaining best practices in performance, accessibility, and secure development.",
    ],
    projects: [
      // {
      //   title: "AI Podcast Generation Platform",
      //   type: "AI Editorial Tool · In-house",
      //   overview: "AI-powered platform that converts written news articles into podcast-ready audio using OpenAI embeddings and ElevenLabs voice synthesis, with an editorial dashboard for managing generation.",
      //   technologies: ["React.js", "Node.js", "OpenAI", "ElevenLabs", "AI Embeddings", "REST APIs"],
      // },
      // {
      //   title: "Election Results Automation",
      //   type: "Middleware · In-house",
      //   overview: "Middleware services to automate aggregation of election results from multiple sources and publish in real-time to editorial CMS tools across digital platforms.",
      //   technologies: ["Node.js", "React.js", "MySQL", "Microservices", "REST APIs"],
      // },
      // {
      //   title: "News Publishing Automation",
      //   type: "Editorial Workflow · In-house",
      //   overview: "Backend services automating news publishing workflows — content processing, CMS API integration, and streamlined editorial pipelines for faster article distribution.",
      //   technologies: ["Node.js", "React.js", "MySQL", "CMS APIs", "Open API"],
      // },
    ],
  },
  {
    company: "Instant Systems Inc",
    logo: "/assets/projects/instant_systems_inc_logo.jpeg",
    logoAlt: "Instant Systems Inc",
    url: "https://instantsys.com/",
    role: "Sr Software Engineer",
    startDate: { year: "2017", month: "09", day: "01" },
    endDate: { year: "2025", month: "05", day: "01" },
    isCurrent: false,
    dateLabel: "Sep 2017 - May 2025",
    description:
      "Instant Systems Inc is a unique software product incubator that helps ambitious start-ups with building of innovative products and passionate teams around the world, along with fund raising and back-office support.",
    tools: [],
    highlights: [],
    children: [
      {
        company: "Clove Dental",
        logo: "/assets/projects/clove.jpeg",
        logoAlt: "Clove Dental",
        url: "https://clovedental.in/",
        role: "Module Lead",
        startDate: { year: "2024", month: "03", day: "01" },
        endDate: { year: "2025", month: "05", day: "01" },
        dateLabel: "Mar 2024 - May 2025",
        description: "Clove Dental operates more than 500 independent clinics nationwide, delivering exceptional dental care through a team of over 1,200 skilled professionals.",
        tools: ["Node.js", "Angular", "React.js", "MySQL", "JavaScript", "GIT", "Jira", "AWS", "Mailgun"],
        highlights: [
          "Develop RESTful APIs to support front-end operations, manage data exchange, and ensure secure and efficient communication between client and server.",
          "Utilize Angular and JavaScript to create dynamic, responsive, and user-friendly interfaces that enhance patient and dental professional experiences.",
          "Conduct thorough testing and debugging to identify and resolve performance bottlenecks.",
          "Gather and analyze user feedback to continuously improve the usability and accessibility of dental care platforms.",
          "Integrate microservices architecture to enable modular and maintainable back-end systems.",
        ],
        projects: [
          { title: "PRM System", type: "Internal Enterprise Tool", overview: "Worked on Clove Dental's internal Patient Relationship Management system — managing appointments, follow-ups, and clinic-level analytics across 500+ clinics.", technologies: ["Node.js", "Angular", "React.js", "MySQL", "REST APIs", "AWS"] },
        ],
      },
      {
        company: "Humanize",
        logo: "/assets/projects/humanizeglobal_logo.jpeg",
        logoAlt: "Humanize",
        url: "https://humanize.com/",
        role: "Sr Software Engineer",
        startDate: { year: "2023", month: "06", day: "01" },
        endDate: { year: "2024", month: "03", day: "01" },
        dateLabel: "Jun 2023 - Mar 2024",
        description: "Humanize offers a healthy digital global platform supporting personal development through an innovative science-based curriculum and inter-subjective dyadic practices.",
        tools: ["React.js", "Node.js", "NestJS", "MongoDB", "JavaScript", "GIT", "Jira", "AWS", "Mailgun"],
        highlights: [
          "RESTful APIs for seamless communication between the frontend and backend.",
          "Scalable architecture to accommodate growing user bases and increased data loads.",
          "Secure data handling and user authentication to protect sensitive information.",
          "Integration with third-party services for extended functionality.",
          "Real-time updates and dynamic content rendering for a lively interface.",
          "Accessibility features to ensure inclusivity and compliance with industry standards.",
        ],
        projects: [
          { title: "Video & Audio Communication Platform", type: "Real-time Communication", overview: "Implemented Zoom-style video and audio calling with real-time communication, screen sharing, and meeting management. Business model has since changed.", technologies: ["WebRTC", "React.js", "Node.js", "Socket.io", "NestJS"], website: "https://humanize.com/" },
        ],
      },
      {
        company: "SYNQY Corporation",
        logo: "/assets/projects/synqy.png",
        logoAlt: "SYNQY Corporation",
        url: "https://synqy.com/",
        role: "Sr Software Engineer",
        startDate: { year: "2019", month: "01", day: "01" },
        endDate: { year: "2023", month: "06", day: "01" },
        dateLabel: "2019 - Jun 2023",
        description: "SYNQY's Enhanced Product Listings are a new type of advertising designed to replace or complement your existing retail media.",
        tools: ["React.js", "Node.js", "Serverless", "JavaScript", "MySQL", "DynamoDB", "GIT", "Jira", "AWS"],
        highlights: [
          "Develop and maintain RESTful APIs to facilitate seamless communication between the frontend and backend systems.",
          "Implement robust data management strategies, including database design, optimization, and maintenance.",
          "Integrate backend services with third-party APIs to enhance functionality and support additional features.",
          "Collaborate with frontend developers, UX/UI designers, and other team members to ensure seamless end-to-end functionality.",
        ],
        projects: [
          { title: "Analytics & BI Dashboard", type: "In-house Product", overview: "Built analytics dashboards and backend services for business intelligence reporting with interactive data visualization and real-time metrics.", technologies: ["Node.js", "React.js", "D3.js", "DynamoDB", "Analytics APIs"] },
        ],
      },
      {
        company: "Ceekr",
        logo: "/assets/projects/ceekr_logo.jpeg",
        logoAlt: "Ceekr",
        url: "https://www.ceekr.com/",
        role: "Jr Software Engineer",
        startDate: { year: "2017", month: "09", day: "01" },
        endDate: { year: "2019", month: "01", day: "01" },
        dateLabel: "2017 - 2019",
        description: "Ceekr delves deeply into the complexities of human decision-making, offering a transformative journey combining Yoga, Vedanta research with cutting-edge AI innovations.",
        tools: ["React.js", "HTML", "CSS", "PHP", "JavaScript", "jQuery", "MySQL", "GIT", "Jira", "AWS"],
        highlights: [
          "Develop and maintain server-side logic using PHP, ensuring high performance, responsiveness, and scalability.",
          "Create and maintain robust and scalable APIs to facilitate seamless communication between the frontend and backend components.",
        ],
        projects: [
          { title: "Customer Experience Platform", type: "Marketing Engagement", overview: "Marketing engagement platform delivering personalized digital experiences with campaign management and analytics.", technologies: ["React.js", "PHP", "JavaScript", "MySQL"], website: "https://www.ceekr.com/home" },
        ],
      },
    ],
  },
  {
    company: "Phoenix Media Pvt. Ltd",
    logo: "/assets/projects/phoenix.jpeg",
    logoAlt: "Phoenix Media Pvt. Ltd",
    url: "https://www.linkedin.com/company/phoenix-media-pvt--ltd-/about/",
    role: "Software Engineer",
    startDate: { year: "2016", month: "12", day: "01" },
    endDate: { year: "2017", month: "05", day: "01" },
    isCurrent: false,
    dateLabel: "Dec 2016 - May 2017",
    description: "Phoenix group is a complete advertising agency offering a full suite of marketing services for progressive businesses globally.",
    tools: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
    highlights: [
      "Explored a wide range of projects and learned from experienced professionals in the field.",
      "Developed an e-commerce platform for a client, learning effective team collaboration and clean code practices.",
    ],
    projects: [
      { title: "MLRS", type: "In-house Product", overview: "Worked on MLRS — an internal marketing and lead management system for Phoenix Media's advertising clients.", technologies: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"] },
    ],
  },
  {
    company: "Galaxy Tourism Pvt. Ltd",
    logo: "/assets/projects/galaxy.jpeg",
    logoAlt: "Galaxy Tourism Pvt. Ltd",
    url: "https://www.galaxytourism.com/index.html",
    role: "Web Developer (Training)",
    startDate: { year: "2016", month: "06", day: "01" },
    endDate: { year: "2016", month: "12", day: "01" },
    isCurrent: false,
    dateLabel: "Training — 6 months",
    description: "Galaxy Tourism is a leading B2B Destination Management Company (DMC) offering hotel reservations, sightseeing and adventure tours for Dubai, Singapore and Malaysia.",
    tools: ["HTML", "CSS", "PHP", "MySQL", "jQuery", "JavaScript"],
    highlights: [
      "PHP server-side development leveraging frameworks such as CodeIgniter and CakePHP.",
      "Database design and management using MySQL with optimization and security.",
      "JavaScript for dynamic and interactive user interfaces.",
      "Modern JavaScript frameworks and libraries for responsive frontend applications.",
    ],
    projects: [
      { title: "Tour & Package Management System", type: "Internal Tool", overview: "Built an internal tool to manage tour packages, hotel reservations, sightseeing itineraries, and booking workflows for Dubai, Singapore, and Malaysia destinations.", technologies: ["PHP", "MySQL", "jQuery", "JavaScript", "HTML", "CSS"] },
    ],
  },
  {
    company: "Own Products",
    logo: "/assets/images/profile-pic-removebg-preview.png",
    logoAlt: "Deepak Kumar - Freelance",
    url: "https://officialdeepak.in",
    role: "Full Stack Developer & Product Owner",
    startDate: { year: "2024", month: "01", day: "01" },
    endDate: { year: "2025", month: "03", day: "01" },
    isCurrent: false,
    dateLabel: "2024 - 2025",
    description: "Building and maintaining personal products and independent projects alongside full-time work to continuously learn and grow with new technologies.",
    tools: ["React.js", "Next.js", "Node.js", "MongoDB", "SEO"],
    highlights: [],
    projects: [
      { title: "VTechXHub", type: "Own Product · Live", overview: "Content publishing platform for guest posts, quality articles, and SEO-driven distribution. Owning this product end-to-end — built contributor workflows, SEO optimization, and content management.", technologies: ["React.js", "Node.js", "MySQL", "NEXT JS", "NEST JS"], website: "https://vtechxhub.com/" },
      { title: "Think4BuySale", type: "Own Product · Under Development", overview: "Real estate platform with property listing, advanced search, filtering, and management dashboards for buyers and sellers.", technologies: ["React.js", "Nest.js", "MySQL", "Next.js", "REST APIs"], website: "https://reales-think4buysale.vercel.app/" },
    ],
  },
];

// ============================================================
// EDUCATION DATA
// ============================================================
export interface EducationItem {
  title: string;
  subtitle?: string;
  institution: string;
  dateLabel: string;
  logo: string;
  logoAlt: string;
  certificateUrl?: string;
  type: "degree" | "certification";
}

export const EDUCATION: EducationItem[] = [
  {
    title: "Post Graduate Computer Application",
    subtitle: "Artificial Intelligence & Machine Learning",
    institution: "University Grants Commission (UGC)",
    dateLabel: "Expected May 2024",
    logo: "/assets/projects/jain-deemed.png",
    logoAlt: "Jain University",
    type: "degree",
  },
  {
    title: "Graduate — University of Delhi (DU)",
    subtitle: "Bachelor in Commerce",
    institution: "University of Delhi",
    dateLabel: "Jun 2013 - Jun 2017",
    logo: "/assets/projects/du.png",
    logoAlt: "Delhi University",
    type: "degree",
  },
  {
    title: "Diploma / Jr Engineering",
    subtitle: "Computer Science / IT",
    institution: "Board of Technical Education (BTE)",
    dateLabel: "May 2013 - May 2016",
    logo: "/assets/projects/bte.jpeg",
    logoAlt: "BTE",
    type: "degree",
  },
  {
    title: "AWS Certified Solutions Architect Associate",
    subtitle: "Ultimate AWS Certified Solutions Architect Associate SAA-C03",
    institution: "Udemy",
    dateLabel: "Oct 2023 - Nov 2023",
    logo: "/assets/projects/aws1.png",
    logoAlt: "AWS Certification",
    certificateUrl: "https://www.udemy.com/certificate/UC-25c5f6ca-9233-45dd-97e0-1c7571ff91a6/",
    type: "certification",
  },
  {
    title: "MERN Stack Front To Back",
    subtitle: "Full Stack React, Redux & Node.js",
    institution: "Udemy",
    dateLabel: "Sep 2021 - Nov 2021",
    logo: "/assets/projects/mern.png",
    logoAlt: "MERN Stack",
    certificateUrl: "https://www.udemy.com/certificate/UC-7170ecb4-3c8a-420a-b0e9-7cb9b5b22b77/",
    type: "certification",
  },
];

// ============================================================
// SKILLS DATA
// ============================================================
export const SKILLS_CATEGORIES = [
  {
    category: "Frontend",
    icon: "🎨",
    items: [
      { name: "React.js", level: 95 },
      { name: "Next.js", level: 88 },
      { name: "Angular", level: 78 },
      { name: "TypeScript", level: 85 },
      { name: "JavaScript (ES6+)", level: 95 },
      { name: "HTML5 / CSS3", level: 92 },
      { name: "Tailwind CSS", level: 88 },
      { name: "Redux / Saga", level: 85 },
    ],
  },
  {
    category: "Backend",
    icon: "⚙️",
    items: [
      { name: "Node.js", level: 92 },
      { name: "Express.js", level: 90 },
      { name: "NestJS", level: 75 },
      { name: "PHP", level: 70 },
      { name: "REST APIs", level: 95 },
      { name: "Serverless", level: 80 },
    ],
  },
  {
    category: "Database",
    icon: "🗄️",
    items: [
      { name: "MongoDB", level: 88 },
      { name: "MySQL", level: 85 },
      { name: "DynamoDB", level: 75 },
      { name: "Redis", level: 70 },
    ],
  },
  {
    category: "Cloud & DevOps",
    icon: "☁️",
    items: [
      { name: "AWS Services", level: 82 },
      { name: "Docker", level: 72 },
      { name: "GIT", level: 90 },
      { name: "CI/CD", level: 78 },
    ],
  },
  {
    category: "AI / ML",
    icon: "🤖",
    items: [
      { name: "OpenAI / GPT", level: 78 },
      { name: "LangChain", level: 72 },
      { name: "Generative AI", level: 75 },
    ],
  },
];

export const SKILL_TAGS: string[] = [
  "JavaScript", "TypeScript", "React.js", "Next.js", "Angular", "Node.js",
  "Express.js", "NestJS", "MongoDB", "MySQL", "DynamoDB", "Redis",
  "AWS", "Docker", "GIT", "REST APIs", "GraphQL", "Serverless",
  "Redux", "Tailwind CSS", "Bootstrap", "HTML5", "CSS3", "PHP",
  "jQuery", "Jira", "CI/CD", "Microservices", "OpenAI", "LangChain",
  "React Native", "Webpack", "Linux", "Agile", "Scrum",
];

// ============================================================
// STATS
// ============================================================
export const STATS = [
  { label: "Years Experience", value: "dynamic", icon: "⚡" },
  { label: "Projects Delivered", value: "15+", icon: "🚀" },
  { label: "Companies", value: "7+", icon: "🏢" },
  { label: "Technologies", value: "25+", icon: "🛠️" },
];

// ============================================================
// REVIEWS / RECOMMENDATIONS
// ============================================================
export interface ReviewItem {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  linkedinUrl: string;
}

export const REVIEWS: ReviewItem[] = [
  {
    quote:
      "Hard Working, Intelligent, Committed, Sharp and an Excellent team player are just a couple of words that can aptly describe Deepak. I worked with him for almost 3 years on the same project. He is technically very sound, always ready to learn new things, accept new challenges and the best part about him is that he always have simple solution to the complex problem which makes him stand out from the crowd. His analytical skills are also great and I wish him all the best for the future I know he will prove to be an asset for any organization he joins.",
    name: "Amit Saraswat",
    role: "System Analyst",
    company: "Instant Systems Inc",
    avatar: "/assets/images/amit.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/amitmsaraswat/",
  },
  {
    quote:
      "We did a lot together and Deepak is really very talented, he learns new technology quickly and is very hard working. I felt very good after working with him, he is a person of very good personality.",
    name: "Maya Tripathi",
    role: "Full-Stack Developer",
    company: "Teamwork Arts",
    avatar: "/assets/images/maya.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/maya-tripathi-34a16b2b/",
  },
];

// ============================================================
// NAV LINKS
// ============================================================
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  // { label: "Projects", href: "/projects" },
  { label: "Education", href: "/education" },
  { label: "Skills", href: "/skills" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
];

// ============================================================
// FOOTER
// ============================================================
export const FOOTER = {
  tagline: "Empowering Innovation through Elegant Code",
  copyright: `Copyright © ${new Date().getFullYear()} — All rights reserved by @deepak`,
  resumePath: "/pdf/resume/Deepak-Resume.pdf",
};

// ============================================================
// BLOG POSTS
// Add new posts here — they auto-appear on /blog and sitemap
// ============================================================
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;         // YYYY-MM-DD
  readTime: string;     // e.g. "8 min read"
  tags: string[];
  coverEmoji: string;   // displayed as card icon
  featured: boolean;
  content: string;      // full article in markdown-style (rendered as HTML)
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "react-performance-optimization",
    title: "React Performance Optimization: 10 Techniques I Use in Production",
    description: "Practical React performance patterns I've used at India Today Group to optimize rendering, reduce bundle size, and deliver sub-second load times for millions of users.",
    date: "2026-03-01",
    readTime: "10 min read",
    tags: ["React.js", "Performance", "JavaScript", "Web Vitals", "Frontend"],
    coverEmoji: "⚡",
    featured: true,
    content: `
<p>After building React applications for 9+ years across companies like <strong>India Today Group</strong>, <strong>Clove Dental</strong>, and multiple startups, I've compiled the performance techniques that actually matter in production.</p>

<h2>1. Memoization Done Right</h2>
<p>Most developers misuse <code>React.memo()</code> and <code>useMemo()</code>. The key is to only memoize components that receive <strong>referentially unstable props</strong> and render expensive trees.</p>
<pre><code>// ❌ Useless memoizationBuilding and maintaining personal products and freelance projects alongside full-time work
const Button = React.memo(({ onClick }) =&gt; &lt;button onClick={onClick}&gt;Click&lt;/button&gt;);

// ✅ Useful — prevents expensive list re-renders
const DataTable = React.memo(({ rows, columns, onSort }) =&gt; {
  // Renders 1000+ rows with complex cells
  return &lt;table&gt;...&lt;/table&gt;;
});</code></pre>

<h2>2. Code Splitting with Dynamic Imports</h2>
<p>At India Today, our editorial dashboard has 40+ features. Loading everything upfront would be insane. We use route-based and component-based splitting:</p>
<pre><code>// Route-based splitting in Next.js
const ElectionDashboard = dynamic(() =&gt; import('./ElectionDashboard'), {
  loading: () =&gt; &lt;DashboardSkeleton /&gt;,
  ssr: false, // client-only for chart libraries
});</code></pre>

<h2>3. Virtual Scrolling for Large Lists</h2>
<p>When rendering election results with 500+ constituencies, virtual scrolling is essential. We use <code>react-window</code> to render only visible rows:</p>
<pre><code>import { FixedSizeList } from 'react-window';

&lt;FixedSizeList height={600} itemCount={constituencies.length} itemSize={72}&gt;
  {({ index, style }) =&gt; &lt;ConstituencyRow data={constituencies[index]} style={style} /&gt;}
&lt;/FixedSizeList&gt;</code></pre>

<h2>4. Image Optimization with Next.js</h2>
<p>We reduced LCP by 40% by switching to <code>next/image</code> with proper sizing, priority loading for above-fold images, and blur placeholders.</p>

<h2>5. Debouncing & Throttling API Calls</h2>
<p>Search autocomplete in our CMS fires on every keystroke. Without debouncing, that's 10+ API calls per second:</p>
<pre><code>const debouncedSearch = useMemo(
  () =&gt; debounce((query) =&gt; fetchResults(query), 300),
  []
);</code></pre>

<h2>6. State Management Architecture</h2>
<p>We moved from Redux to a hybrid approach — <strong>React Context</strong> for UI state, <strong>React Query/SWR</strong> for server state. This eliminated 60% of our Redux boilerplate.</p>

<h2>7. Bundle Analysis & Tree Shaking</h2>
<p>Run <code>npx next build --analyze</code> regularly. We found that importing <code>lodash</code> instead of <code>lodash/debounce</code> added 70KB to our bundle.</p>

<h2>8. Lazy Loading Below-the-Fold</h2>
<p>Using Intersection Observer to load components only when they scroll into view — exactly what this portfolio uses for scroll animations.</p>

<h2>9. Web Workers for Heavy Computation</h2>
<p>Election night data processing (parsing 10,000+ results in real-time) runs in a Web Worker to keep the UI thread responsive.</p>

<h2>10. Profiling with React DevTools</h2>
<p>The React Profiler is your best friend. We profile every release candidate and flag any component that re-renders more than 3 times per user interaction.</p>

<h2>Results</h2>
<p>These optimizations helped us achieve: <strong>LCP under 1.2s</strong>, <strong>TTI under 2s</strong>, and <strong>95+ Lighthouse performance score</strong> on India Today's editorial platform serving millions of daily users.</p>
    `,
  },
  {
    slug: "build-rag-app-with-langchain",
    title: "Build a RAG App with LangChain, OpenAI & Node.js — Step by Step",
    description: "How I built a Retrieval-Augmented Generation system at India Today Group for intelligent article search and content automation using LangChain, OpenAI, and MongoDB Atlas Vector Search.",
    date: "2026-02-20",
    readTime: "12 min read",
    tags: ["AI/ML", "LangChain", "OpenAI", "Node.js", "RAG", "Generative AI"],
    coverEmoji: "🤖",
    featured: true,
    content: `
<p>At <strong>India Today Group</strong>, we needed an intelligent search system that could understand editorial queries like "find articles about economic policy impact on rural India" — not just keyword matching, but <strong>semantic understanding</strong>. Here's how I built it using RAG (Retrieval-Augmented Generation).</p>

<h2>What is RAG?</h2>
<p>RAG combines a retrieval system (finding relevant documents) with a generation model (LLM like GPT-4) to produce accurate, context-aware answers grounded in your actual data — not hallucinated facts.</p>

<h2>Architecture Overview</h2>
<pre><code>User Query → Embed Query (OpenAI) → Vector Search (MongoDB Atlas)
  → Top K Documents → LLM Prompt + Context → Generated Answer</code></pre>

<h2>Step 1: Setup Dependencies</h2>
<pre><code>npm install langchain @langchain/openai @langchain/community mongodb</code></pre>

<h2>Step 2: Document Ingestion Pipeline</h2>
<p>First, we ingest articles from our CMS, split them into chunks, generate embeddings, and store in MongoDB Atlas Vector Search:</p>
<pre><code>import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MongoDBAtlasVectorSearch } from '@langchain/community/vectorstores/mongodb_atlas';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Split articles into chunks
const docs = await splitter.createDocuments(
  articles.map(a =&gt; a.content),
  articles.map(a =&gt; ({ title: a.title, id: a._id, date: a.publishedAt }))
);

// Store with embeddings in MongoDB
await MongoDBAtlasVectorSearch.fromDocuments(docs, embeddings, {
  collection: mongoCollection,
  indexName: 'article_vector_index',
});</code></pre>

<h2>Step 3: Query Pipeline with LangChain</h2>
<pre><code>import { ChatOpenAI } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';

const llm = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.2,
});

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: mongoCollection,
  indexName: 'article_vector_index',
});

const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(5));

// Query
const result = await chain.call({
  query: 'What are the latest developments in India education policy?',
});
console.log(result.text); // AI-generated answer with citations</code></pre>

<h2>Step 4: Production Considerations</h2>
<p>In production at India Today, we added: <strong>caching</strong> (Redis for repeated queries), <strong>rate limiting</strong>, <strong>streaming responses</strong> for real-time UX, and <strong>source attribution</strong> so editors can verify AI-generated summaries.</p>

<h2>Results</h2>
<p>The RAG system reduced editorial research time by <strong>60%</strong> and powers the intelligent search across India Today's digital platform. Editors can now ask natural language questions and get accurate answers grounded in our 50,000+ article archive.</p>
    `,
  },
  {
    slug: "nextjs-ai-integration",
    title: "Integrating AI into Next.js Apps: OpenAI, Streaming & Edge Functions",
    description: "A practical guide to adding AI-powered features to Next.js applications using OpenAI API, Vercel AI SDK, streaming responses, and edge functions for low-latency inference.",
    date: "2026-02-10",
    readTime: "9 min read",
    tags: ["Next.js", "AI/ML", "OpenAI", "Vercel", "Streaming", "Edge Functions"],
    coverEmoji: "🧠",
    featured: false,
    content: `
<p>Adding AI to your Next.js app doesn't have to be complex. Here's my battle-tested approach from building AI features at <strong>India Today Group</strong> — including streaming responses, edge deployment, and error handling.</p>

<h2>1. Setup: Vercel AI SDK</h2>
<p>The Vercel AI SDK makes streaming AI responses trivial in Next.js:</p>
<pre><code>npm install ai openai</code></pre>

<h2>2. API Route with Streaming</h2>
<pre><code>// app/api/chat/route.ts
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge'; // Deploy to edge for low latency

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}</code></pre>

<h2>3. Client-Side Hook</h2>
<pre><code>// components/Chat.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    &lt;div&gt;
      {messages.map(m =&gt; (
        &lt;div key={m.id} className={m.role === 'user' ? 'user-msg' : 'ai-msg'}&gt;
          {m.content}
        &lt;/div&gt;
      ))}
      &lt;form onSubmit={handleSubmit}&gt;
        &lt;input value={input} onChange={handleInputChange} placeholder="Ask anything..." /&gt;
        &lt;button type="submit" disabled={isLoading}&gt;Send&lt;/button&gt;
      &lt;/form&gt;
    &lt;/div&gt;
  );
}</code></pre>

<h2>4. AI-Powered Article Summarization</h2>
<p>One of our most popular features — editors paste a 2000-word article and get a 3-line summary instantly:</p>
<pre><code>const summary = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{
    role: 'system',
    content: 'Summarize the following news article in exactly 3 concise sentences for an Indian audience.'
  }, {
    role: 'user',
    content: articleText
  }],
  max_tokens: 200,
  temperature: 0.3, // Low temperature for factual accuracy
});</code></pre>

<h2>5. Edge Functions for Speed</h2>
<p>By deploying AI routes to Vercel Edge Functions, we reduced response latency from ~800ms to ~200ms for the initial token. The <code>runtime = 'edge'</code> directive is all it takes.</p>

<h2>6. Error Handling & Rate Limiting</h2>
<p>In production, always handle: API rate limits (implement exponential backoff), token limits (truncate context), and model fallbacks (GPT-4 → GPT-3.5 on quota errors).</p>

<h2>Key Takeaway</h2>
<p>AI integration in Next.js is now a first-class experience. With streaming, edge functions, and the Vercel AI SDK, you can ship AI features that feel instant — not like waiting for a loading spinner.</p>
    `,
  },
  {
    slug: "mern-stack-architecture-2026",
    title: "MERN Stack Architecture in 2026: What's Changed & Best Practices",
    description: "How I architect MERN stack applications in 2026 — MongoDB Atlas, Express with TypeScript, React Server Components, Node.js 22, and the tools that replaced Redux.",
    date: "2026-01-28",
    readTime: "11 min read",
    tags: ["MERN", "MongoDB", "React.js", "Node.js", "Architecture", "TypeScript"],
    coverEmoji: "🏗️",
    featured: false,
    content: `
<p>The MERN stack in 2026 looks very different from 2020. Having built MERN apps across <strong>7 companies</strong> over <strong>9+ years</strong>, here's how I architect production MERN applications today.</p>

<h2>The Modern MERN Stack</h2>
<pre><code>MongoDB Atlas (with Vector Search) + Express 5 / tRPC + React 19 (RSC) + Node.js 22</code></pre>

<h2>1. MongoDB: Beyond CRUD</h2>
<p>MongoDB Atlas now offers Vector Search (for AI), Atlas Search (for full-text), Change Streams (for real-time), and serverless instances. We use the aggregation pipeline heavily instead of pulling data into Node.js for processing.</p>

<h2>2. Express → tRPC for Type Safety</h2>
<p>For internal APIs, we've moved to tRPC which gives end-to-end type safety between React and Node.js — zero runtime overhead, full autocompletion.</p>

<h2>3. React Server Components Changed Everything</h2>
<p>With Next.js App Router and RSC, we fetch data on the server by default. Client components are only for interactivity. This eliminated most of our loading spinners.</p>

<h2>4. State Management: What Replaced Redux</h2>
<p>Our stack now: <strong>React Query</strong> for server state, <strong>Zustand</strong> for client state (3KB vs Redux's 45KB), <strong>URL state</strong> via <code>nuqs</code> for filters/pagination.</p>

<h2>5. Authentication: Better-Auth</h2>
<p>We switched from NextAuth to Better-Auth for more control over session management, multi-tenant support, and social login.</p>

<h2>6. Testing: Vitest + Playwright</h2>
<p>Jest is replaced by Vitest (10x faster), Playwright for E2E. Every PR runs both in CI.</p>

<h2>Conclusion</h2>
<p>The MERN stack is still incredibly productive in 2026. The key evolution: TypeScript everywhere, server-first rendering, AI-native data layer, and lightweight state management.</p>
    `,
  },
  {
    slug: "election-dashboard-engineering",
    title: "Engineering India Today's Election Dashboard: Real-Time Data at Scale",
    description: "Behind the scenes of building India Today's live election results dashboard — handling 10,000+ constituency results in real-time with WebSockets, React, and Node.js.",
    date: "2026-01-15",
    readTime: "8 min read",
    tags: ["React.js", "WebSocket", "Real-time", "Node.js", "India Today", "Engineering"],
    coverEmoji: "🗳️",
    featured: true,
    content: `
<p>Election night at <strong>India Today Group</strong> is the Super Bowl of Indian tech media. Millions of concurrent users watching live results. Zero tolerance for downtime. Here's how we engineered it.</p>

<h2>The Challenge</h2>
<p>Displaying real-time results for <strong>543 Lok Sabha constituencies</strong> + <strong>4000+ state assembly seats</strong> with sub-second updates to millions of concurrent viewers.</p>
Building and maintaining personal products and freelance projects alongside full-time work
<h2>Architecture</h2>
<pre><code>EC Data Feed → Node.js Ingestion → Redis Pub/Sub → WebSocket Gateway
  → CDN (static) + SSE/WS (dynamic) → React Dashboard</code></pre>

<h2>Key Decisions</h2>
<p><strong>Server-Sent Events over WebSockets</strong> — for the public dashboard, SSE is simpler, works through CDN, and handles millions of one-way connections better than bidirectional WebSockets.</p>
<p><strong>React with Canvas</strong> — the India map visualization renders 543 constituency polygons. DOM would choke at this scale, so we use Canvas with React for the controls.</p>
<p><strong>Redis for pub/sub</strong> — when a result comes in, it's published to Redis. All WebSocket gateway instances subscribe and push to connected clients within 200ms.</p>

<h2>Results</h2>
<p>Handled <strong>5 million+ concurrent users</strong> on election night with <strong>99.99% uptime</strong> and <strong>sub-500ms update latency</strong>. The dashboard became one of India Today's most-visited features.</p>
    `,
  },
];

// Helper: get post by slug
export const getBlogPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);

// Helper: get featured posts
export const getFeaturedPosts = () => BLOG_POSTS.filter((p) => p.featured);

// ============================================================
// FEATURED PROJECTS
// ============================================================
export interface FeaturedProject {
  title: string;
  type: string;
  client: string;
  role: string;
  year?: string;
  website?: string;
  overview: string;
  problem?: string;
  solution?: string;
  impact?: string[];
  technologies: string[];
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    title: "AI Podcast Generation Platform",
    type: "AI Editorial Tool",
    client: "Enterprise Media",
    role: "Senior Software Engineer",
    year: "2025",
    overview: "AI-powered platform that converts written news articles into podcast-ready audio using generative AI and voice synthesis.",
    problem: "Editorial teams needed faster conversion of articles to podcast content without manual recording.",
    solution: "Automated pipeline — article processing → structured prompts → AI voice synthesis → editorial dashboard.",
    impact: ["Reduced podcast production time by 80%", "Automated audio generation at scale", "Improved editorial team efficiency"],
    technologies: ["React.js", "Node.js", "OpenAI", "ElevenLabs", "AI Embeddings", "REST APIs"],
  },
  {
    title: "Election Results Automation Platform",
    type: "Real-time Data Processing",
    client: "Enterprise Media",
    role: "Senior Software Engineer",
    year: "2024",
    overview: "Middleware services to automate aggregation and real-time publishing of election results to editorial CMS.",
    problem: "Election data from multiple sources needed real-time processing and publishing across digital platforms.",
    solution: "Middleware APIs that ingest election feeds, normalize data, and push updates to CMS platforms.",
    impact: ["5M+ concurrent users on election night", "Sub-500ms update latency", "99.99% uptime"],
    technologies: ["Node.js", "React.js", "MySQL", "WebSocket", "Redis", "Microservices"],
  },
  {
    title: "Think4BuySale Real Estate Platform",
    type: "Property Marketplace",
    client: "Freelance Project",
    role: "Full Stack Developer",
    year: "2023",
    website: "https://www.think4buysale.in/",
    overview: "Real estate platform with property listing, advanced search, and management for buyers and sellers. Dev version: reales-think4buysale.vercel.app",
    impact: ["Improved property discovery UX", "Scalable listing architecture", "Advanced filtering system"],
    technologies: ["React.js", "Node.js", "MongoDB", "Next.js", "REST APIs"],
  },
  {
    title: "VTechXHub Content Platform",
    type: "Content Publishing & SEO",
    client: "Own Product",
    role: "Product Owner & Lead Developer",
    year: "2023",
    website: "https://vtechxhub.com/",
    overview: "Platform for managing guest posts, high-quality content publishing, and SEO-driven article distribution. Owning this product end-to-end.",
    impact: ["Structured guest post workflows", "SEO-optimized publishing", "Contributor management system"],
    technologies: ["React.js", "Node.js", "MongoDB", "SEO Tools", "CMS Architecture"],
  },
  {
    title: "Video Communication Platform",
    type: "Real-time Communication",
    client: "Humanize (Enterprise SaaS)",
    role: "Software Engineer",
    website: "https://humanize.com/",
    overview: "Real-time video and audio communication features — Zoom-style meeting platform with screen sharing.",
    technologies: ["WebRTC", "React.js", "Node.js", "Socket.io", "Real-time Communication"],
  },
  {
    title: "Customer Experience Platform",
    type: "Marketing Engagement",
    client: "Ceekr (Enterprise SaaS)",
    role: "Software Engineer",
    website: "https://www.ceekr.com/home",
    overview: "Marketing engagement platform delivering personalized digital experiences with campaign management.",
    technologies: ["React.js", "Node.js", "Analytics Tools", "AWS"],
  },
  {
    title: "Data Analytics Platform",
    type: "Business Intelligence",
    client: "Synqy Corporation",
    role: "Software Engineer",
    website: "https://www.linkedin.com/company/synqy-corporation",
    overview: "Analytics dashboards and backend services for business intelligence reporting and data visualization.",
    technologies: ["Node.js", "React.js", "D3.js", "Data Visualization", "Analytics APIs"],
  },
  {
    title: "News Publishing Automation",
    type: "Editorial Workflow",
    client: "Enterprise Media",
    role: "Backend Engineer",
    year: "2024",
    overview: "Backend services automating news publishing workflows and CMS integration for faster article distribution.",
    technologies: ["Node.js", "React.js", "MySQL", "CMS APIs", "Microservices", "Open API", "LLM Tools"],
  },
  {
    title: "Food Safety Compliance Tool",
    type: "Compliance System",
    client: "Internal Enterprise Tool",
    role: "Software Engineer",
    year: "2017",
    overview: "System to monitor food safety procedures and generate compliance reports for production environments.",
    technologies: ["PHP", "MySQL", "jQuery", "Reporting Tools"],
  },
];