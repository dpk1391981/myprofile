import PageHeader from "@/components/bs/PageHeader";
import Jsonld from "@/components/bs/Jsonld";
import Recommendations from "@/components/sections/Recommendations";
import HireCta from "@/components/sections/HireCta";
import { REVIEWS } from "@/components/utils/portfolio-data";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

export const metadata = pageMeta({
  title: "Recommendations | Deepak Kumar — References from Colleagues & Leads",
  description:
    "LinkedIn recommendations for Deepak Kumar from the engineers and analysts who shipped alongside him at Instant Systems Inc and Teamwork Arts — on technical depth, problem solving and how he works inside a team.",
  path: "/reviews",
  keywords: [
    "Deepak Kumar reviews",
    "Deepak Kumar recommendations",
    "React developer references India",
    "software engineer testimonials India",
  ],
});

export default function ReviewsPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Recommendations", path: "/reviews" },
        ])}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Recommendations" }]}
        dateline={["References", `${REVIEWS.length} recommendations`, "Verified on LinkedIn"]}
        kicker="Recommendations"
        title="What the people who shipped with me say."
        lede="Written on LinkedIn by colleagues who worked with me directly — each links back to the profile that wrote it."
      />

      <Recommendations full />
      <HireCta />
    </>
  );
}
