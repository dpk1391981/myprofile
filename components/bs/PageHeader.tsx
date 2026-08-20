import Link from "next/link";
import React from "react";

export interface Crumb { label: string; href?: string }

/**
 * The front-page furniture reused as an inner-page head: breadcrumb,
 * the thick–thin rail around a dateline, then the headline.
 *
 * `figure` puts a standing figure in a right-hand column, the way the front
 * page carries the portrait beside its headline. Without it the head is one
 * column of type ending at 58ch, and the right third of every inner page was
 * empty paper. It is optional so a page with nothing worth drawing can still
 * use the single-column head rather than filling the slot with decoration —
 * see components/bs/HeadFigure.tsx for what belongs there.
 */
export default function PageHeader({
  crumbs,
  dateline,
  kicker,
  title,
  lede,
  figure,
  children,
}: {
  crumbs: Crumb[];
  dateline: string[];
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  figure?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <p className="bs-kicker">{kicker}</p>
      <h1 className="bs-h1 bs-mt-2" style={{ maxWidth: "20ch" }}>{title}</h1>
      {lede ? (
        <p className="bs-lede bs-mt-4" style={{ maxWidth: "58ch" }}>{lede}</p>
      ) : null}
      {children}
    </>
  );

  return (
    <header className="bs-wrap bs-head-top">
      <nav className="bs-breadcrumb" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c.label} style={{ display: "inline-flex", gap: 8 }}>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            {i < crumbs.length - 1 ? <span aria-hidden="true">·</span> : null}
          </span>
        ))}
      </nav>

      <div className="bs-rail-thick" style={{ marginTop: 16 }} />
      <div className="bs-dateline">
        {dateline.map((d, i) => (
          <span key={d} className={i === dateline.length - 1 ? "bs-live" : undefined}>{d}</span>
        ))}
      </div>
      <div className="bs-rail-thin" />

      {/* One column when there is no figure: the grid would otherwise leave a
          1fr track of empty paper, which is the problem this replaces. */}
      <div className="bs-head-body">
        {figure ? (
          <div className="bs-split bs-split--head">
            <div>{body}</div>
            <div>{figure}</div>
          </div>
        ) : (
          body
        )}
      </div>
    </header>
  );
}
