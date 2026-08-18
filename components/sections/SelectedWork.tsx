import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { SELECTED_WORK } from "../utils/site-data";
import SectionHead from "./SectionHead";

/** The work ledger — project, what it did, result. */
export default function SelectedWork({
  limit,
  showMore = false,
}: {
  limit?: number;
  showMore?: boolean;
}) {
  const rows = limit ? SELECTED_WORK.slice(0, limit) : SELECTED_WORK;

  return (
    <section className="bs-wrap bs-section" id="work">
      <SectionHead
        kicker="Selected work"
        title="Shipped for employers and clients."
        lede="Seventeen products across news media, healthcare, real estate and adtech. A few with numbers attached."
      />

      <div className="bs-mt-6">
        <div className="bs-ledger-head">
          <span>Project</span>
          <span>What it did</span>
          <span>Result</span>
        </div>

        {rows.map((w) => (
          <div key={w.title} className="bs-ledger-row">
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{w.title}</p>
              <p className="bs-small bs-quiet bs-mt-1">{w.meta}</p>
              <div className="bs-tags bs-mt-2" style={{ gap: 6 }}>
                {w.stack.map((t) => (
                  <span key={t} className="bs-tag bs-tag--outline">{t}</span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.62 }}>{w.overview}</p>
            <div>
              <p className="bs-quiet" style={{ fontSize: 15, lineHeight: 1.55 }}>{w.result}</p>
              {w.website ? (
                <a
                  href={w.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bs-link bs-mt-1"
                  style={{ fontSize: 13.5 }}
                >
                  Visit <IconArrowUpRight size={14} />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {showMore ? (
        <Link href="/projects" className="bs-link bs-mt-4">
          See every project in detail <IconArrowUpRight size={16} />
        </Link>
      ) : null}
    </section>
  );
}
