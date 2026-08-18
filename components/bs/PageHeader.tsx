import Link from "next/link";
import React from "react";

export interface Crumb { label: string; href?: string }

/**
 * The front-page furniture reused as an inner-page head: breadcrumb,
 * the thick–thin rail around a dateline, then the headline.
 */
export default function PageHeader({
  crumbs,
  dateline,
  kicker,
  title,
  lede,
  children,
}: {
  crumbs: Crumb[];
  dateline: string[];
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="bs-wrap" style={{ paddingTop: 26 }}>
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

      <div style={{ paddingTop: 52 }}>
        <p className="bs-kicker">{kicker}</p>
        <h1 className="bs-h1 bs-mt-2" style={{ maxWidth: "20ch" }}>{title}</h1>
        {lede ? (
          <p className="bs-lede bs-mt-4" style={{ maxWidth: "58ch" }}>{lede}</p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
