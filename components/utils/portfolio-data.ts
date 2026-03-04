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
        description:
          "Clove Dental operates more than 500 independent clinics nationwide, delivering exceptional dental care through a team of over 1,200 skilled professionals. With over 2 million happy patients, Clove Dental takes pride in its ethical practices and transparent approach to dentistry.",
        tools: ["Node.js", "Angular", "React.js", "MySQL", "JavaScript", "GIT", "Jira", "AWS", "Mailgun"],
        highlights: [
          "Develop RESTful APIs to support front-end operations, manage data exchange, and ensure secure and efficient communication between client and server.",
          "Utilize Angular and JavaScript to create dynamic, responsive, and user-friendly interfaces that enhance patient and dental professional experiences.",
          "Conduct thorough testing and debugging to identify and resolve performance bottlenecks.",
          "Gather and analyze user feedback to continuously improve the usability and accessibility of dental care platforms.",
          "Integrate microservices architecture to enable modular and maintainable back-end systems.",
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
        description:
          "Humanize offers a healthy digital global platform supporting personal development through an innovative science-based curriculum and inter-subjective dyadic practices.",
        tools: ["React.js", "Node.js", "NestJS", "MongoDB", "JavaScript", "GIT", "Jira", "AWS", "Mailgun"],
        highlights: [
          "RESTful APIs for seamless communication between the frontend and backend.",
          "Scalable architecture to accommodate growing user bases and increased data loads.",
          "Secure data handling and user authentication to protect sensitive information.",
          "Integration with third-party services for extended functionality.",
          "Real-time updates and dynamic content rendering for a lively interface.",
          "Accessibility features to ensure inclusivity and compliance with industry standards.",
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
        description:
          "SYNQY's Enhanced Product Listings are a new type of advertising designed to replace or complement your existing retail media.",
        tools: ["React.js", "Node.js", "Serverless", "JavaScript", "MySQL", "DynamoDB", "GIT", "Jira", "AWS"],
        highlights: [
          "Develop and maintain RESTful APIs to facilitate seamless communication between the frontend and backend systems.",
          "Implement robust data management strategies, including database design, optimization, and maintenance.",
          "Integrate backend services with third-party APIs to enhance functionality and support additional features.",
          "Collaborate with frontend developers, UX/UI designers, and other team members to ensure seamless end-to-end functionality.",
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
        description:
          "Ceekr delves deeply into the complexities of human decision-making, offering a transformative journey combining Yoga, Vedanta research with cutting-edge AI innovations.",
        tools: ["React.js", "HTML", "CSS", "PHP", "JavaScript", "jQuery", "MySQL", "GIT", "Jira", "AWS"],
        highlights: [
          "Develop and maintain server-side logic using PHP, ensuring high performance, responsiveness, and scalability.",
          "Create and maintain robust and scalable APIs to facilitate seamless communication between the frontend and backend components.",
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
    description:
      "Phoenix group is a complete advertising agency offering a full suite of marketing services for progressive businesses globally.",
    tools: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
    highlights: [
      "Explored a wide range of projects and learned from experienced professionals in the field.",
      "Developed an e-commerce platform for a client, learning effective team collaboration and clean code practices.",
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
    description:
      "Galaxy Tourism is a leading B2B Destination Management Company (DMC) offering hotel reservations, sightseeing and adventure tours for Dubai, Singapore and Malaysia.",
    tools: ["HTML", "CSS", "PHP", "MySQL", "jQuery", "JavaScript"],
    highlights: [
      "PHP server-side development leveraging frameworks such as CodeIgniter and CakePHP.",
      "Database design and management using MySQL with optimization and security.",
      "JavaScript for dynamic and interactive user interfaces.",
      "Modern JavaScript frameworks and libraries for responsive frontend applications.",
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
  { label: "Education", href: "/education" },
  { label: "Skills", href: "/skills" },
  { label: "Reviews", href: "/review" },
];

// ============================================================
// FOOTER
// ============================================================
export const FOOTER = {
  tagline: "Empowering Innovation through Elegant Code",
  copyright: `Copyright © ${new Date().getFullYear()} — All rights reserved by @deepak`,
  resumePath: "/pdf/resume/Deepak-Resume.pdf",
};