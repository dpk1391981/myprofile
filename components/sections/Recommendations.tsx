import Image from "next/image";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { REVIEWS } from "../utils/portfolio-data";
import SectionHead from "./SectionHead";

/** Recommendations, set as pull quotes in the serif's italic voice. */
export default function Recommendations({ full = false }: { full?: boolean }) {
  return (
    <section className="bs-wrap bs-section" id="recommendations">
      <SectionHead kicker="Recommendations" title="From people who shipped with me." />

      <div className="bs-cols--quotes bs-mt-7" style={{ display: "grid" }}>
        {REVIEWS.map((q) => (
          <blockquote key={q.name} className="bs-quote">
            <p>
              “{full ? q.quote : q.quote.length > 330 ? `${q.quote.slice(0, 320).trim()}…` : q.quote}”
            </p>
            <footer>
              <Image src={q.avatar} alt={q.name} width={44} height={44} className="bs-avatar" />
              <div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{q.name}</p>
                <p className="bs-small bs-quiet">{q.role}, {q.company}</p>
              </div>
              <a
                href={q.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${q.name} on LinkedIn`}
                style={{ marginLeft: "auto", color: "var(--quiet)", display: "inline-flex" }}
              >
                <IconBrandLinkedin size={20} />
              </a>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
