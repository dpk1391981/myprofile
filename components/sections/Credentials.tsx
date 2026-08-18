import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { EDUCATION } from "../utils/portfolio-data";
import SectionHead from "./SectionHead";

/** Degrees on the left, certifications on the right. */
export default function Credentials() {
  const degrees = EDUCATION.filter((e) => e.type === "degree");
  const certs = EDUCATION.filter((e) => e.type === "certification");

  return (
    <section className="bs-wrap bs-section" id="education">
      <SectionHead kicker="Education & certification" title="Credentials." />

      <div className="bs-cols--wide bs-mt-6" style={{ display: "grid" }}>
        <div>
          <p className="bs-list-head">Degrees</p>
          {degrees.map((d) => (
            <div key={d.title} className="bs-list-row">
              <Image src={d.logo} alt={d.logoAlt} width={32} height={32} className="bs-logo" />
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{d.title}</p>
                {d.subtitle ? (
                  <p className="bs-small bs-mt-1" style={{ color: "var(--spot)" }}>{d.subtitle}</p>
                ) : null}
                <p className="bs-small bs-quiet bs-mt-1">{d.institution} · {d.dateLabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="bs-list-head">Certifications</p>
          {certs.map((c) => (
            <div key={c.title} className="bs-list-row">
              <Image src={c.logo} alt={c.logoAlt} width={32} height={32} className="bs-logo" />
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{c.title}</p>
                <p className="bs-small bs-quiet bs-mt-1">{c.subtitle} · {c.dateLabel}</p>
                {c.certificateUrl ? (
                  <a
                    href={c.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bs-link bs-mt-1"
                    style={{ fontSize: 13 }}
                  >
                    View certificate <IconArrowUpRight size={13} />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
