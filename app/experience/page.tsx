import { YEARS_WHOLE } from "@/components/utils/site-data";
import PageHeader from "@/components/bs/PageHeader";
import { TimelineFigure } from "@/components/bs/HeadFigure";
import Jsonld from "@/components/bs/Jsonld";
import Career from "@/components/sections/Career";
import SelectedWork from "@/components/sections/SelectedWork";
import HireCta from "@/components/sections/HireCta";
import { EXPERIENCES } from "@/components/utils/portfolio-data";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

// The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
// current date, so a purely static render freezes them at deploy time and the
// copy understates the experience once an anniversary passes. Re-render daily;
// no data is fetched, so this only costs a regeneration.
export const revalidate = 86400;

export const metadata = pageMeta({
  title: `Experience | Deepak Kumar — ${YEARS_WHOLE} Years as a Software Engineer`,
  description:
    `${YEARS_WHOLE} years of career history — India Today Group, Instant Systems (Clove Dental, Humanize, SYNQY, Ceekr) and Phoenix Media. React, Node.js, AWS and AI.`,
  path: "/experience",
  keywords: [
    "Deepak Kumar experience",
    "senior software engineer India experience",
    "React developer career India",
    "India Today Group developer",
    "Instant Systems Inc engineer",
    "Clove Dental developer",
    "SYNQY Corporation developer",
    "software engineer work history India",
  ],
});

export default function ExperiencePage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Experience", path: "/experience" },
        ])}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Experience" }]}
        dateline={["Career", `Since December 2016`, `${EXPERIENCES.length} employers`]}
        kicker="Career history"
        /* "9+ years" is one word here. Left to wrap, the 20ch measure broke it
           as "Where the 9+ / years went." — the number stranded at the end of a
           line, away from its unit. `.bs-h1-accent` is nowrap and spot-coloured,
           the same treatment the front-page headline gives the same figure. */
        title={
          <>
            Where the <span className="bs-h1-accent">{YEARS_WHOLE} years</span> went.
          </>
        }
        lede="From a Delhi advertising agency writing PHP to architecting Generative AI features at India Today Group — every role, what it involved and what came out of it."
        figure={<TimelineFigure roles={EXPERIENCES} />}
      />

      <Career detailed />
      <SelectedWork />
      <HireCta />
    </>
  );
}
