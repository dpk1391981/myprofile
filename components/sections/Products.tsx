import { IconArrowUpRight, IconBroadcast, IconCornerDownRight, IconTool } from "@tabler/icons-react";
import { getFlagshipProjects } from "../utils/portfolio-data";
import SectionHead from "./SectionHead";

/** The products owned end to end, set as long-form articles. */
export default function Products({ heading = true }: { heading?: boolean }) {
  const products = getFlagshipProjects();

  return (
    <section className="bs-wrap bs-section" id="products">
      {heading ? (
        <SectionHead
          kicker="Products I own end to end"
          title={`${products.length} products of my own — product, architecture, engineering and SEO, all mine.`}
        />
      ) : null}

      <div className="bs-mt-6">
        {products.map((p) => {
          const points = p.features?.length ? p.features : p.impact ?? [];

          return (
            <article key={p.slug} className="bs-product">
              <div className="bs-product-head">
                <h3 className="bs-h3">{p.title}</h3>
                {p.status === "Live" ? (
                  <span className="bs-live-flag"><IconBroadcast size={13} /> Live</span>
                ) : p.status === "In Development" ? (
                  <span className="bs-live-flag bs-live-flag--wip"><IconTool size={13} /> In development</span>
                ) : null}
              </div>

              {p.tagline ? <p className="bs-lede bs-italic bs-quiet bs-mt-2">{p.tagline}</p> : null}

              {/*
                Prose keeps its 62ch measure — that is the readable line length
                and widening it would be a downgrade. The shell is 1080px, so
                the leftover ~570px is given to a metadata rail instead of
                being left as dead space beside every paragraph.
              */}
              <div className="bs-product-body bs-mt-3">
                <div className="bs-product-main">
                  <p className="bs-body-text">{p.overview}</p>

                  {p.problem ? (
                    <p className="bs-body-text bs-mt-3">
                      <span style={{ fontWeight: 600 }}>The problem — </span>
                      <span className="bs-quiet">{p.problem}</span>
                    </p>
                  ) : null}

                  {points.length ? (
                    <ul className="bs-arrow-list bs-mt-4">
                      {points.slice(0, 4).map((f) => (
                        <li key={f}>
                          <IconCornerDownRight size={15} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <aside className="bs-product-rail">
                  {p.role ? (
                    <div className="bs-product-meta">
                      <p className="bs-eyebrow">Role</p>
                      <p className="bs-small bs-mt-1">{p.role}</p>
                    </div>
                  ) : null}

                  <div className="bs-product-meta">
                    <p className="bs-eyebrow">Built with</p>
                    <div className="bs-tags bs-mt-2">
                      {p.technologies.slice(0, 9).map((t) => (
                        <span key={t} className="bs-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  {p.website ? (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="bs-link">
                      Visit {p.title} <IconArrowUpRight size={16} />
                    </a>
                  ) : null}
                </aside>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
