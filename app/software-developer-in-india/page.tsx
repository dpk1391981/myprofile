import { notFound } from "next/navigation";
import KeywordLanding from "@/components/sections/KeywordLanding";
import { getLandingPage } from "@/components/utils/site-data";
import { pageMeta } from "@/components/utils/seo";

// The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
// current date, so a purely static render freezes them at deploy time and the
// copy understates the experience once an anniversary passes. Re-render daily;
// no data is fetched, so this only costs a regeneration.
export const revalidate = 86400;

const SLUG = "software-developer-in-india";
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
