import { IconArrowUpRight, IconCornerDownRight } from "@tabler/icons-react";
import PageHeader from "@/components/bs/PageHeader";
import Jsonld from "@/components/bs/Jsonld";
import Products from "@/components/sections/Products";
import HireCta from "@/components/sections/HireCta";
import SectionHead from "@/components/sections/SectionHead";
import { getOtherProjects } from "@/components/utils/portfolio-data";
import { SITE_URL } from "@/components/utils/site-data";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

export const metadata = pageMeta({
  title: "Projects & Products by Deepak Kumar | PlanToday.in, TrendMeToday.com & Enterprise Platforms",
  description:
    "Seventeen products shipped by Deepak Kumar — PlanToday.in, an AI-powered wedding and event vendor marketplace; TrendMeToday.com, real-time trend intelligence with 0–100 heat scoring; plus a live election dashboard serving millions of daily users, AI podcast generation and clinical software for Clove Dental.",
  path: "/projects",
  keywords: [
    "Deepak Kumar projects",
    "React developer portfolio India",
    "full stack projects India",
    "PlanToday.in",
    "TrendMeToday.com",
    "AI marketplace India",
    "election dashboard developer",
    "Next.js projects portfolio",
  ],
});

export default function ProjectsPage() {
  const others = getOtherProjects();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projects and products by Deepak Kumar",
    itemListElement: others.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      url: p.website || `${SITE_URL}/projects`,
    })),
  };

  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ])}
      />
      <Jsonld data={itemListLd} />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        dateline={["Portfolio", "17+ products shipped", "4 live products I own"]}
        kicker="Projects & products"
        title="Everything I have shipped, and what it did."
        lede="Four products I own end to end, then the client and employer work — news media, healthcare, adtech, real estate and real-time communication. Numbers attached where numbers exist."
      />

      <Products heading={false} />

      <section className="bs-wrap bs-section" id="client-work">
        <SectionHead
          kicker="Client & enterprise work"
          title="Built for employers and clients."
          lede="Shipped inside product teams — some under my own architecture, all in production."
        />

        <div className="bs-mt-6">
          {others.map((p) => (
            <article key={p.slug} className="bs-role" style={{ gridTemplateColumns: "minmax(0,4fr) minmax(0,6fr)" }}>
              <div>
                <h3 className="bs-h4">{p.title}</h3>
                <p className="bs-small bs-quiet bs-mt-1">{p.type}</p>
                <p className="bs-small bs-mt-2" style={{ color: "var(--spot)" }}>
                  {p.client}{p.year ? ` · ${p.year}` : ""}
                </p>
                <p className="bs-small bs-quiet bs-mt-1">{p.role}</p>
                {p.website ? (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" className="bs-link bs-mt-2" style={{ fontSize: 13.5 }}>
                    Visit site <IconArrowUpRight size={14} />
                  </a>
                ) : null}
              </div>

              <div>
                <p className="bs-body-text" style={{ maxWidth: "68ch" }}>{p.overview}</p>

                {p.problem ? (
                  <p className="bs-small bs-quiet bs-mt-2" style={{ maxWidth: "68ch" }}>
                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>Problem — </span>{p.problem}
                  </p>
                ) : null}
                {p.solution ? (
                  <p className="bs-small bs-quiet bs-mt-1" style={{ maxWidth: "68ch" }}>
                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>Solution — </span>{p.solution}
                  </p>
                ) : null}

                {p.impact?.length ? (
                  <ul className="bs-arrow-list bs-mt-3">
                    {p.impact.map((i) => (
                      <li key={i}>
                        <IconCornerDownRight size={15} />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="bs-tags bs-mt-3">
                  {p.technologies.map((t) => (
                    <span key={t} className="bs-tag">{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <HireCta />
    </>
  );
}
