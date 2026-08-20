import Link from "next/link";
import {
  IconClockHour4,
  IconCode,
  IconDownload,
  IconMail,
  IconPhone,
  IconRocket,
  IconSitemap,
  IconSparkles,
  IconWorld,
} from "@tabler/icons-react";
import { HIRE_BLURB, SERVICES } from "../utils/site-data";
import { FOOTER, PERSONAL_INFO } from "../utils/portfolio-data";

const ICONS = {
  code: IconCode,
  sparkle: IconSparkles,
  tree: IconSitemap,
  rocket: IconRocket,
} as const;

/** The closing spread — thick–thin rail, the ask, and what I take on. */
export default function HireCta() {
  return (
    <section className="bs-wrap" id="hire" style={{ paddingTop: 120 }}>
      <div className="bs-rail-thick" />
      <div className="bs-rail-thin" style={{ marginTop: 4 }} />

      <div className="bs-split--cta" style={{ display: "grid", paddingTop: 54 }}>
        <div>
          <h2 className="bs-h1" style={{ maxWidth: "20ch", fontSize: "clamp(2.1rem, 4.4vw, 3.2rem)" }}>
            {HIRE_BLURB.headline}
          </h2>
          <p className="bs-lede bs-quiet bs-mt-4" style={{ maxWidth: "56ch" }}>{HIRE_BLURB.lede}</p>

          <div className="bs-actions bs-mt-5">
            <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="bs-btn bs-btn--solid">
              <IconDownload size={17} /> Download resume (PDF)
            </a>
            <Link href="/contact" className="bs-btn bs-btn--outline">
              <IconMail size={17} /> Start a conversation
            </Link>
          </div>

          <div className="bs-inline-meta bs-mt-5">
            <span><IconClockHour4 size={17} /> {HIRE_BLURB.meta[0]}</span>
            <span><IconWorld size={17} /> {HIRE_BLURB.meta[1]}</span>
            <a href={`tel:${PERSONAL_INFO.phone}`} className="bs-quiet" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <IconPhone size={17} style={{ color: "var(--spot)" }} /> {HIRE_BLURB.meta[2]}
            </a>
          </div>
        </div>

        <div>
          <p className="bs-list-head">What I take on</p>
          {SERVICES.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <div key={s.title} className="bs-list-row">
                <Icon size={20} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 15.5, fontWeight: 600 }}>{s.title}</p>
                  <p className="bs-small bs-quiet bs-mt-1">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
