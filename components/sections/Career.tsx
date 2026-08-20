import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight, IconArrowRight } from "@tabler/icons-react";
import { EXPERIENCES } from "../utils/portfolio-data";
import type { ExperienceItem } from "../utils/portfolio-data";
import { totalExperianceYears } from "../utils/date";
import SectionHead from "./SectionHead";

/**
 * Career history.
 *
 * TWO LAYOUTS, ONE COMPONENT.
 *
 * `detailed` (on /experience) keeps the ledger: every role as a full-width row
 * with dates in the left column, and the highlights and projects that only make
 * sense at full measure.
 *
 * The front page gets the summary instead — the current role as a lead, then
 * the rest as a 2x2 of cards. Five identical full-width rows made the current
 * job just the first of five, and each row's prose stopped about two thirds of
 * the way across, so the section read as a column of text with a permanent
 * empty margin down the right.
 */

const tenureOf = (r: ExperienceItem) =>
  totalExperianceYears(
    r.startDate.year,
    r.startDate.month,
    r.startDate.day,
    r.endDate?.year,
    r.endDate?.month,
    r.endDate?.day
  );

/** The employer's own site, or a section of this one for an entry with no
 *  outside site — which must not open in a new tab, and takes the internal
 *  arrow rather than the external one. */
function CompanyLink({ url, company }: { url?: string; company: string }) {
  if (!url) return null;
  const internal = url.startsWith("/") || url.startsWith("#");
  const style = { display: "inline-flex", color: "var(--quiet)" } as const;

  return internal ? (
    <Link href={url} aria-label={`${company} — see the work`} style={style}>
      <IconArrowRight size={15} />
    </Link>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${company} website`} style={style}>
      <IconArrowUpRight size={15} />
    </a>
  );
}

/** One past role at half width. */
function RoleCard({ r }: { r: ExperienceItem }) {
  return (
    <article className="bs-rolecard">
      <div className="bs-rolecard-top">
        <span>{r.dateLabel}</span>
        <span className="bs-rolecard-tenure">{tenureOf(r)}</span>
      </div>

      <div className="bs-rolecard-head">
        <Image src={r.logo} alt={r.logoAlt || r.company} width={30} height={30} className="bs-logo" />
        <h3 className="bs-role-company">{r.company}</h3>
        <CompanyLink url={r.url} company={r.company} />
      </div>

      <p className="bs-quiet" style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{r.role}</p>
      <p style={{ fontSize: 15, lineHeight: 1.65, margin: 0 }}>{r.description}</p>

      {r.children?.length ? (
        <p className="bs-small bs-quiet" style={{ margin: 0 }}>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Products &amp; clients — </span>
          {r.children.map((c) => c.company).join(" · ")}
        </p>
      ) : null}

      {/* Capped at five. The cards sit two to a row and stretch to the taller
          of the pair, so an eight-tag stack on one side pushes a gap into the
          other; the full list is on /experience. */}
      <div className="bs-tags" style={{ gap: 7, marginTop: "auto", paddingTop: 4 }}>
        {r.tools.slice(0, 5).map((t) => (
          <span key={t} className="bs-tag">{t}</span>
        ))}
      </div>
    </article>
  );
}

/** One role as a full-width row: the ledger layout, and the front-page lead. */
function RoleRow({ r, detailed, lead }: { r: ExperienceItem; detailed: boolean; lead?: boolean }) {
  return (
    <article className={`bs-role ${lead ? "bs-role--lead" : ""}`}>
      <div>
        <p className="bs-small bs-quiet" style={{ letterSpacing: ".06em", textTransform: "uppercase" }}>
          {r.dateLabel}
        </p>
        <p className="bs-small bs-mt-1" style={{ color: "var(--spot)" }}>{tenureOf(r)}</p>
        <Image
          src={r.logo}
          alt={r.logoAlt || r.company}
          width={34}
          height={34}
          className="bs-logo bs-mt-3"
        />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h3 className="bs-role-company">{r.company}</h3>
          <CompanyLink url={r.url} company={r.company} />
          {r.isCurrent ? <span className="bs-live-flag">Present</span> : null}
        </div>

        <p className="bs-quiet bs-mt-1" style={{ fontSize: 16, fontWeight: 600 }}>{r.role}</p>
        <p className="bs-mt-2" style={{ fontSize: 15, lineHeight: 1.65, maxWidth: "70ch" }}>
          {r.description}
        </p>

        {r.children?.length ? (
          <p className="bs-small bs-quiet bs-mt-2">
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Products &amp; clients — </span>
            {r.children.map((c) => `${c.company} (${c.dateLabel})`).join(" · ")}
          </p>
        ) : null}

        {detailed && r.highlights?.length ? (
          <ul className="bs-arrow-list bs-mt-3">
            {r.highlights.map((h) => (
              <li key={h}>
                <span aria-hidden="true" style={{ color: "var(--spot)", marginTop: 2 }}>—</span>
                <span className="bs-quiet">{h}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {detailed && r.projects?.length ? (
          <div className="bs-mt-3">
            <p className="bs-eyebrow">Projects</p>
            {r.projects.map((pr) => (
              <div key={pr.title} className="bs-list-row" style={{ display: "block" }}>
                <p style={{ fontSize: 15.5, fontWeight: 600 }}>{pr.title}</p>
                <p className="bs-small bs-quiet">{pr.type}</p>
                <p className="bs-small bs-mt-1" style={{ maxWidth: "68ch" }}>{pr.overview}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="bs-tags bs-mt-3" style={{ gap: 7 }}>
          {r.tools.map((t) => (
            <span key={t} className="bs-tag">{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Career({ detailed = false }: { detailed?: boolean }) {
  // The current job leads. Falling back to the first entry rather than
  // assuming one is flagged: an empty lead would drop a role from the page.
  const lead = EXPERIENCES.find((r) => r.isCurrent) ?? EXPERIENCES[0];
  const rest = EXPERIENCES.filter((r) => r !== lead);

  return (
    <section className="bs-wrap bs-section" id="experience">
      {/*
        No heading on /experience: the page head directly above already reads
        "Career history — Where the 9+ years went", and a second heading under
        it said the same thing in a second spelling of the same number.

        On the front page the heading stays but drops the figure. "9.7+ Yrs"
        sat a few centimetres under a proof tile reading "9+ yrs" and a
        headline reading "9+ years" — one career length, three renderings, and
        the third one to the decimal. The number is established by then; this
        line only has to say what the section is.
      */}
      {detailed ? null : (
        <SectionHead kicker="Career" title="Where the work has been." />
      )}

      {detailed ? (
        <div className="bs-mt-2">
          {EXPERIENCES.map((r) => (
            <RoleRow key={`${r.company}-${r.dateLabel}`} r={r} detailed />
          ))}
        </div>
      ) : (
        <>
          <div className="bs-mt-7">
            <RoleRow r={lead} detailed={false} lead />
          </div>
          <div className="bs-split bs-split--even bs-mt-6">
            {rest.map((r) => (
              <RoleCard key={`${r.company}-${r.dateLabel}`} r={r} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
