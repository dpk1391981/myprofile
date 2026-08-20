import Link from "next/link";
import { IconArrowUpRight, IconCornerDownRight } from "@tabler/icons-react";
import PageHeader from "../bs/PageHeader";
import { PortraitFigure } from "../bs/HeadFigure";
import Jsonld from "../bs/Jsonld";
import Faq from "./Faq";
import HireCta from "./HireCta";
import SelectedWork from "./SelectedWork";
import Recommendations from "./Recommendations";
import SectionHead from "./SectionHead";
import type { LandingPage } from "../utils/site-data";
import { breadcrumbLd, faqLd } from "../utils/seo";

/** One keyword landing page, rendered from its LANDING_PAGES entry. */
export default function KeywordLanding({ page }: { page: LandingPage }) {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: page.keyword, path: `/${page.slug}` },
        ])}
      />
      <Jsonld data={faqLd(page.faqs)} />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: page.keyword }]}
        dateline={["Hire", "New Delhi, India · Remote friendly", "Open to senior & contract work"]}
        kicker={page.kicker}
        title={page.h1}
        lede={page.lede}
        /* A hire page is read by someone deciding whether to write to a
           person, so the figure here is the person — same portrait, caption,
           and profile links as /about. The stack terms come from the page's
           own kicker, so each landing page captions itself. */
        figure={<PortraitFigure caption={`Deepak Kumar, New Delhi. ${page.kicker}.`} />}
      >
        {/* In the head rather than in a band under it: the portrait is taller
            than the headline and lede together, so this column was ending
            half a screen early on every one of these pages. */}
        <div className="bs-proof bs-proof--half bs-mt-6">
          {page.proof.map((f) => (
            <div key={f.label}>
              <p className="bs-proof-value">{f.value}</p>
              <p className="bs-proof-label">{f.label}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      {page.sections.map((s) => (
        <section key={s.heading} className="bs-wrap bs-section">
          <h2 className="bs-h2" style={{ maxWidth: "24ch" }}>{s.heading}</h2>
          <p className="bs-body-text bs-measure bs-mt-4" style={{ fontSize: 17 }}>{s.body}</p>
          {s.bullets?.length ? (
            <ul className="bs-arrow-list bs-mt-4" style={{ maxWidth: "72ch" }}>
              {s.bullets.map((b) => (
                <li key={b}>
                  <IconCornerDownRight size={15} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <SelectedWork limit={4} showMore />
      <Recommendations />

      <Faq
        items={page.faqs}
        kicker="Straight answers"
        title={`Hiring a ${page.keyword} — the usual questions.`}
        id={`${page.slug}-faq`}
      />

      <section className="bs-wrap bs-section">
        <SectionHead kicker="Related" title="Other ways people search for this." />
        <div className="bs-mt-5">
          {page.related.map((r) => (
            <div key={r.href} className="bs-list-row">
              <IconArrowUpRight size={18} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 3 }} />
              <Link href={r.href} style={{ fontSize: 17, fontWeight: 600 }}>{r.label}</Link>
            </div>
          ))}
        </div>
      </section>

      <HireCta />
    </>
  );
}
