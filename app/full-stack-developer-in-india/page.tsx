import { notFound } from "next/navigation";
import KeywordLanding from "@/components/sections/KeywordLanding";
import { getLandingPage } from "@/components/utils/site-data";
import { pageMeta } from "@/components/utils/seo";

const SLUG = "full-stack-developer-in-india";
const page = getLandingPage(SLUG)!;

export const metadata = pageMeta({
  title: page.title,
  description: page.description,
  path: `/${SLUG}`,
  keywords: page.keywords,
});

export default function Page() {
  const data = getLandingPage(SLUG);
  if (!data) notFound();
  return <KeywordLanding page={data} />;
}
