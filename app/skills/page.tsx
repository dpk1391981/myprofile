import PageHeader from "@/components/bs/PageHeader";
import Jsonld from "@/components/bs/Jsonld";
import Capabilities from "@/components/sections/Capabilities";
import HireCta from "@/components/sections/HireCta";
import SectionHead from "@/components/sections/SectionHead";
import { SKILLS_CATEGORIES, SKILL_TAGS } from "@/components/utils/portfolio-data";
import { YEARS_WHOLE } from "@/components/utils/site-data";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

// The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
// current date, so a purely static render freezes them at deploy time and the
// copy understates the experience once an anniversary passes. Re-render daily;
// no data is fetched, so this only costs a regeneration.
export const revalidate = 86400;

export const metadata = pageMeta({
  title: "Skills & Tech Stack | Deepak Kumar — React, Node.js, TypeScript, AWS & AI",
  description:
    `The full technical stack of Deepak Kumar, a senior JavaScript developer in India with ${YEARS_WHOLE} years in production — React.js, Next.js, TypeScript, Angular, Node.js, Express, NestJS, MongoDB, MySQL, Redis, DynamoDB, AWS, Docker, and Generative AI with OpenAI, LangChain and RAG pipelines.`,
  path: "/skills",
  keywords: [
    "Deepak Kumar skills",
    "JavaScript developer in India",
    "React developer skills",
    "Node.js developer India",
    "TypeScript developer India",
    "MERN stack skills",
    "AWS certified developer India",
    "LangChain RAG developer India",
  ],
});

export default function SkillsPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Skills", path: "/skills" },
        ])}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Skills" }]}
        dateline={["Technical stack", "Front end to infrastructure", "AWS Certified SA Associate"]}
        kicker="Skills"
        title="The stack, and how deep each part goes."
        lede="Not a list of everything I have ever opened — the tools I have shipped production systems with, grouped by where they sit in the stack."
      />

      <Capabilities detailed />

      <section className="bs-wrap bs-section" id="depth">
        <SectionHead
          kicker="By discipline"
          title="Where the hours have actually gone."
          lede="Depth reflects production use — years shipped and maintained, not courses completed."
        />

        <div className="bs-cols--wide bs-mt-6" style={{ display: "grid" }}>
          {SKILLS_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <p className="bs-list-head">{cat.category}</p>
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--hair)",
                  }}
                >
                  <span style={{ fontSize: 15.5 }}>{item.name}</span>
                  <span className="bs-small bs-quiet" style={{ letterSpacing: ".08em" }}>
                    {item.level >= 90 ? "Daily" : item.level >= 80 ? "Strong" : item.level >= 72 ? "Working" : "Familiar"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="bs-wrap bs-section" id="everything">
        <SectionHead kicker="Everything else" title="The full inventory." />
        <div className="bs-tags bs-mt-5" style={{ maxWidth: "78ch" }}>
          {SKILL_TAGS.map((t) => (
            <span key={t} className="bs-tag">{t}</span>
          ))}
        </div>
      </section>

      <HireCta />
    </>
  );
}
