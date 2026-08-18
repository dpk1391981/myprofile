import { Projects } from "@/components";
import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "../seo_config";

const SITE_URL = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

export const metadata: Metadata = {
  ...NEXT_SEO_DEFAULT,
  title: "Projects & Products by Deepak Kumar | PlanToday.in, TrendMeToday.com & Enterprise Platforms",
  description:
    "Products and projects built by Deepak Kumar — PlanToday.in, an AI-powered wedding and event vendor marketplace covering 500+ Indian cities, and TrendMeToday.com, a real-time trend intelligence platform with 0–100 heat scoring. Plus enterprise platforms: AI podcast generation, real-time election dashboards at 5M+ concurrent users, and SaaS analytics products.",
  alternates: { canonical: `${SITE_URL}/projects` },
  openGraph: {
    ...NEXT_SEO_DEFAULT.openGraph,
    url: `${SITE_URL}/projects`,
    title: "Projects & Products by Deepak Kumar — PlanToday.in & TrendMeToday.com",
    description:
      "Two live products owned end-to-end plus enterprise platforms shipped at scale. Built with Next.js, NestJS, FastAPI, MySQL, Redis and Generative AI.",
  },
};

export default function ProjectsPage() {
  return <Projects />;
}
