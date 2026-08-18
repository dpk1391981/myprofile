import {
  IconBrain,
  IconBrowser,
  IconCloud,
  IconDatabase,
  IconServer,
} from "@tabler/icons-react";
import { CAPABILITIES } from "../utils/site-data";
import SectionHead from "./SectionHead";

const ICONS = {
  browsers: IconBrowser,
  server: IconServer,
  database: IconDatabase,
  brain: IconBrain,
  cloud: IconCloud,
} as const;

/** What I actually work with — five columns, no boxes. */
export default function Capabilities({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="bs-wrap bs-section" id="skills">
      <SectionHead kicker="Capabilities" title="What I actually work with." />

      <div className="bs-cols bs-mt-7">
        {CAPABILITIES.map((c) => {
          const Icon = ICONS[c.icon];
          return (
            <div key={c.title}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Icon size={19} style={{ color: "var(--spot)" }} />
                <h3 style={{ fontSize: 17 }}>{c.title}</h3>
              </div>
              <p className="bs-quiet bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>{c.items}</p>
              {detailed ? (
                <p className="bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>{c.detail}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
