import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight, IconArrowRight } from "@tabler/icons-react";
import { EXPERIENCES } from "../utils/portfolio-data";
import { totalExperianceYears } from "../utils/date";
import SectionHead from "./SectionHead";

/** Career history — dates and tenure in the left column, the role in the right. */
export default function Career({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="bs-wrap bs-section" id="experience">
      <SectionHead
        kicker="Career"
        title={`${totalExperianceYears()} across ${EXPERIENCES.length} employers.`}
      />

      <div className="bs-mt-7">
        {EXPERIENCES.map((r) => {
          const tenure = totalExperianceYears(
            r.startDate.year,
            r.startDate.month,
            r.startDate.day,
            r.endDate?.year,
            r.endDate?.month,
            r.endDate?.day
          );

          return (
            <article key={`${r.company}-${r.dateLabel}`} className="bs-role">
              <div>
                <p className="bs-small bs-quiet" style={{ letterSpacing: ".06em", textTransform: "uppercase" }}>
                  {r.dateLabel}
                </p>
                <p className="bs-small bs-mt-1" style={{ color: "var(--spot)" }}>{tenure}</p>
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
                  <h3 style={{ fontSize: 22 }}>{r.company}</h3>
                  {r.url ? (
                    // Most entries link out to the employer's site; an entry with
                    // no outside site points at a section of this one, which must
                    // not open in a new tab and takes the internal arrow.
                    r.url.startsWith("/") || r.url.startsWith("#") ? (
                      <Link href={r.url} aria-label={`${r.company} — see the work`} style={{ display: "inline-flex", color: "var(--quiet)" }}>
                        <IconArrowRight size={15} />
                      </Link>
                    ) : (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${r.company} website`} style={{ display: "inline-flex", color: "var(--quiet)" }}>
                        <IconArrowUpRight size={15} />
                      </a>
                    )
                  ) : null}
                  {r.isCurrent ? (
                    <span className="bs-live-flag">Present</span>
                  ) : null}
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
        })}
      </div>
    </section>
  );
}
