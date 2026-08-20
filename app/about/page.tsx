import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import PageHeader from "@/components/bs/PageHeader";
import { CurrentlyBlock, PortraitFigure } from "@/components/bs/HeadFigure";
import Jsonld from "@/components/bs/Jsonld";
import Capabilities from "@/components/sections/Capabilities";
import Credentials from "@/components/sections/Credentials";
import HireCta from "@/components/sections/HireCta";
import SectionHead from "@/components/sections/SectionHead";
import { ABOUT_PRINCIPLES, ABOUT_STORY, PROOF, YEARS_WHOLE } from "@/components/utils/site-data";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

// The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
// current date, so a purely static render freezes them at deploy time and the
// copy understates the experience once an anniversary passes. Re-render daily;
// no data is fetched, so this only costs a regeneration.
export const revalidate = 86400;

export const metadata = pageMeta({
  title: "About Deepak Kumar | Senior Software Engineer in India",
  description:
    `About Deepak Kumar — senior software engineer in New Delhi, ${YEARS_WHOLE} years across news media, healthtech and adtech. React, Next.js, Node.js and Generative AI.`,
  path: "/about",
  keywords: [
    "about Deepak Kumar",
    "Deepak Kumar software engineer",
    "senior software developer in India",
    "React developer in India",
    "MERN stack developer New Delhi",
    "Generative AI engineer India",
    "software engineer biography India",
  ],
});

export default function AboutPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        dateline={["Profile", "New Delhi, India", `${YEARS_WHOLE} years in production`]}
        kicker="About"
        /* "Nine" was typed by hand and had already gone stale — the rest of
           the page computes the figure from the career start date, and the
           dateline two lines up was reading 9+ while the headline said nine.
           "Systems … depend on" is also the claim this page has to justify:
           production software with users attached, not a list of tools. */
        title={
          <>
            <span className="bs-h1-accent">{YEARS_WHOLE} years</span> building the systems other
            people depend on.
          </>
        }
        /* A sentence longer than it needs to be for its own sake — the head is
           a two-column grid and the portrait beside it is taller than a short
           lede, so the extra line is what brings the two columns level. It
           earns its place: it is the answer to "doing what, right now?". */
        lede={`I am a Senior Software Engineer in New Delhi. I build on the MERN stack and Next.js, add Generative AI where it earns its place, and I have spent most of my career inside production systems with real users attached to them. Right now that means editorial AI tooling and election-night dashboards at India Today Group — and four products of my own that I run end to end.`}
        figure={
          <PortraitFigure caption="New Delhi, 2025. Building editorial AI tooling at India Today Group.">
            <CurrentlyBlock
              company={PERSONAL_INFO.currentWork.company}
              role={PERSONAL_INFO.currentWork.role}
              logo={PERSONAL_INFO.currentWork.logo}
              url={PERSONAL_INFO.currentWork.url}
              cta={{ label: "Full career history", href: "/experience" }}
            />
          </PortraitFigure>
        }
      >
        {/* The proof figures used to be a band of their own below the head,
            which left the headline column empty for the height of the portrait
            beside it. In the head they fill that column and the page starts a
            screen earlier. */}
        <div className="bs-proof bs-proof--half bs-mt-6">
          {PROOF.map((f) => (
            <div key={f.label}>
              <p className="bs-proof-value">{f.value}</p>
              <p className="bs-proof-label">{f.label}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      {/*
        Four story blocks in a 2x2 grid, not one long column beside a sidebar.
        Stacked, the four ran to about two and a half screens of single-column
        prose; paired, they fit in one, and the reader can see all four
        headings at once and pick. The rule above each block is what keeps
        them reading as four separate pieces rather than one wrapped one.

        The sidebar that used to sit here is gone: the employer, the city and
        the link through to the full record now sit under the portrait in the
        head (CurrentlyBlock), and the rest of it — a timezone and a
        certification abbreviation — was paying rent on a whole column.
      */}
      <section className="bs-wrap bs-section" id="story">
        <div className="bs-split bs-split--even">
          {ABOUT_STORY.map((block) => (
            <div key={block.heading} style={{ borderTop: "1px solid var(--rule)", paddingTop: 22 }}>
              <h2 className="bs-h3">{block.heading}</h2>
              {block.paras.map((p) => (
                <p key={p.slice(0, 40)} className="bs-body-text bs-mt-3">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="bs-wrap bs-section" id="principles">
        <SectionHead
          kicker="How I think about the work"
          title="Four rules I actually follow."
        />
        {/* 2x2, matching the story grid above. `.bs-cols` auto-fits, which put
            three rules on one line and left the fourth stranded on a line of
            its own — four items read as four when they are laid out as two
            pairs. */}
        <div className="bs-split bs-split--even bs-mt-6">
          {ABOUT_PRINCIPLES.map((p) => (
            <div key={p.title} style={{ borderTop: "1px solid var(--hair)", paddingTop: 18 }}>
              <h3 className="bs-h4">{p.title}</h3>
              <p className="bs-quiet bs-mt-2" style={{ fontSize: 15.5, lineHeight: 1.7 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Capabilities detailed />
      <Credentials />

      <section className="bs-wrap bs-section">
        <SectionHead kicker="Elsewhere" title="Where else to find me." />
        <div className="bs-cols bs-mt-5">
          <div>
            <h3 className="bs-h4">Code</h3>
            <p className="bs-quiet bs-mt-2 bs-small">Side projects, experiments and the odd utility.</p>
            <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" className="bs-link bs-mt-2">
              GitHub <IconArrowUpRight size={15} />
            </a>
          </div>
          <div>
            <h3 className="bs-h4">Career</h3>
            <p className="bs-quiet bs-mt-2 bs-small">Recommendations, roles and the long-form version.</p>
            <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" className="bs-link bs-mt-2">
              LinkedIn <IconArrowUpRight size={15} />
            </a>
          </div>
          <div>
            <h3 className="bs-h4">Writing</h3>
            <p className="bs-quiet bs-mt-2 bs-small">Notes on React performance, RAG and architecture.</p>
            <Link href="/blog" className="bs-link bs-mt-2">
              Read the blog <IconArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <HireCta />
    </>
  );
}
