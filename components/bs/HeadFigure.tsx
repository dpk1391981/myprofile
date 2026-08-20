import Image from "next/image";
import React from "react";
import Link from "next/link";
import { IconArrowUpRight, IconBrandGithub, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";

/**
 * The standing figures that sit in the right-hand column of an inner-page
 * head (see components/bs/PageHeader.tsx).
 *
 * WHY THESE EXIST. The head was a single column: headline and lede ran to
 * about 58ch and the remaining third of the page was empty paper, on every
 * inner route. The front page never had that problem because its head is a
 * `.bs-split` with the portrait on the right — so these give the inner heads
 * the same two-column shape, and the same optical weight.
 *
 * WHY DRAWN AND NOT PHOTOGRAPHED. A stock illustration would be decoration.
 * Each of these is the page's own data drawn small — five stack layers, five
 * employers on a spine, one square per shipped product — which is what a
 * newspaper puts in that slot: a figure with a caption, not a picture.
 *
 * HOUSE RULES for anything added here.
 *   - One canvas width (FIG_W) and a viewBox, so every figure scales as one
 *     system and none of them can overflow its column on a narrow screen.
 *   - Colour comes from `currentColor` and the palette custom properties
 *     only. Both themes then work with no second copy and no media query —
 *     a hard-coded #201e1d would vanish on the dark ground.
 *   - `role="img"` plus a <title>: these carry information, so they are
 *     content to a screen reader, not decoration to skip. The <figcaption>
 *     says the same thing in prose for everyone else.
 *   - No text below 10px, and nothing that depends on a font that may not
 *     have painted yet — labels are set in the inherited serif.
 */

/** The one canvas width every figure is drawn on. */
const FIG_W = 380;

const INK = "currentColor";
const HAIR = "var(--hair)";
const RULE = "var(--rule)";
const QUIET = "var(--quiet)";
const SPOT = "var(--spot)";
const SURFACE = "var(--surface)";
const PAPER = "var(--paper)";

/** Uppercase micro-label — the same setting as `.bs-eyebrow`, inside SVG. */
const label = (size = 10.5) => ({
  fontSize: size,
  letterSpacing: "0.13em",
  fill: QUIET,
});

function Figure({
  title,
  caption,
  height,
  children,
}: {
  title: string;
  caption: React.ReactNode;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="bs-figure bs-headfig">
      <div className="bs-headfig-box">
        <svg
          viewBox={`0 0 ${FIG_W} ${height}`}
          role="img"
          aria-label={title}
          focusable="false"
        >
          <title>{title}</title>
          {children}
        </svg>
      </div>
      <figcaption className="bs-figcaption">{caption}</figcaption>
    </figure>
  );
}

/* ── /skills — the stack in cross-section ─────────────────────────────── */

const ROW_H = 46;
const ROW_GAP = 8;

export function StackFigure({ layers }: { layers: string[] }) {
  const rows = layers.slice(0, 5);
  const height = rows.length * (ROW_H + ROW_GAP) - ROW_GAP + 6;

  return (
    <Figure
      title={`The stack in cross-section: ${rows.join(", ")}`}
      caption="The stack in cross-section — interface at the top, infrastructure at the base."
      height={height}
    >
      {/* Depth axis. The arrow, not a second label, is what says which way is
          down; the rotated caption then only has to name the two ends. */}
      <line x1="8" y1="6" x2="8" y2={height - 14} stroke={RULE} strokeWidth="1" />
      <path
        d={`M4 ${height - 18} L8 ${height - 10} L12 ${height - 18}`}
        fill="none"
        stroke={RULE}
        strokeWidth="1"
      />
      <text
        transform={`translate(22 ${height / 2}) rotate(-90)`}
        textAnchor="middle"
        style={label(9.5)}
      >
        SURFACE → INFRASTRUCTURE
      </text>

      {rows.map((name, i) => {
        const y = i * (ROW_H + ROW_GAP);
        return (
          <g key={name}>
            <rect
              x="34"
              y={y}
              width={FIG_W - 34}
              height={ROW_H}
              fill={SURFACE}
              stroke={HAIR}
              strokeWidth="1"
            />
            {/* Weight fades down the stack, so the eye reads it as depth
                rather than as five equal boxes. */}
            <rect
              x="34"
              y={y}
              width="3"
              height={ROW_H}
              fill={SPOT}
              opacity={1 - i * 0.16}
            />
            <text x="52" y={y + 28} style={{ fontSize: 14.5, fontWeight: 600, fill: INK }}>
              {name}
            </text>
            <text x={FIG_W - 14} y={y + 28} textAnchor="end" style={label()}>
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

/* ── /experience — the career spine ──────────────────────────────────── */

export type FigureRole = { company: string; dateLabel: string; isCurrent?: boolean };

/** "India Today Group | Aaj Tak" → "India Today Group". The figure has one
 *  line per role; the page below carries the full name and the link. */
function shortCompany(name: string): string {
  const head = name.split("|")[0].replace(/\bPvt\.?\s*Ltd\.?\b/i, "").trim();
  return head.length > 24 ? `${head.slice(0, 23).trimEnd()}…` : head;
}

const NODE_GAP = 58;

export function TimelineFigure({ roles }: { roles: FigureRole[] }) {
  const height = roles.length * NODE_GAP + 16;
  const spine = 24;

  return (
    <Figure
      title={`Career spine: ${roles.map((r) => shortCompany(r.company)).join(", ")}`}
      caption={`${roles.length} employers since December 2016 — the role I am in now is the one in colour.`}
      height={height}
    >
      <line x1={spine} y1="10" x2={spine} y2={height - 18} stroke={RULE} strokeWidth="1" />
      {/* Caps close the spine so it reads as a measured span rather than a
          line that ran off the edge of the drawing. */}
      <line x1={spine - 5} y1="10" x2={spine + 5} y2="10" stroke={RULE} strokeWidth="1" />
      <line x1={spine - 5} y1={height - 18} x2={spine + 5} y2={height - 18} stroke={RULE} strokeWidth="1" />

      {roles.map((r, i) => {
        const cy = 28 + i * NODE_GAP;
        return (
          <g key={`${r.company}-${r.dateLabel}`}>
            {r.isCurrent ? (
              <>
                <circle cx={spine} cy={cy} r="10" fill={SPOT} opacity=".16" />
                <circle cx={spine} cy={cy} r="5.5" fill={SPOT} />
              </>
            ) : (
              <circle cx={spine} cy={cy} r="5" fill={PAPER} stroke={INK} strokeWidth="1.5" />
            )}
            <text x={spine + 24} y={cy - 4} style={label()}>
              {r.dateLabel.toUpperCase()}
            </text>
            <text
              x={spine + 24}
              y={cy + 15}
              style={{ fontSize: 15, fontWeight: 600, fill: INK, letterSpacing: "-0.01em" }}
            >
              {shortCompany(r.company)}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

/* ── /projects — one square per shipped product ──────────────────────── */

const CELL = 64;
const CELL_GAP = 11;
const PER_ROW = 5;

export function ShippedFigure({ shipped, owned }: { shipped: number; owned: number }) {
  const cells = Array.from({ length: shipped }, (_, i) => i);
  const rows = Math.ceil(shipped / PER_ROW);
  const height = rows * (CELL + CELL_GAP) - CELL_GAP + 30;

  return (
    <Figure
      title={`${shipped} products shipped, ${owned} of them owned end to end`}
      caption={`One square per shipped product. The ${owned} in colour are the ones I own end to end.`}
      height={height}
    >
      {cells.map((i) => {
        const x = (i % PER_ROW) * (CELL + CELL_GAP);
        const y = Math.floor(i / PER_ROW) * (CELL + CELL_GAP);
        const mine = i < owned;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            fill={mine ? SPOT : SURFACE}
            stroke={mine ? SPOT : HAIR}
            strokeWidth="1"
          />
        );
      })}
      <text x="0" y={height - 6} style={label()}>
        {`${shipped}+ SHIPPED`}
      </text>
      <text x={FIG_W} y={height - 6} textAnchor="end" style={{ ...label(), fill: SPOT }}>
        {`${owned} MINE`}
      </text>
    </Figure>
  );
}

/* ── /education — the record ─────────────────────────────────────────── */

/**
 * The first version of this was a stamp with MCA set large in the middle of
 * it. That is the one credential on the page that is not finished, and a seal
 * is the most emphatic object a page can carry — it read as the headline
 * qualification when it is the in-progress one.
 *
 * So: no seal, and nothing singled out. Four lines of record, each with what
 * it is, where it is from and where it stands. Honest at a glance, and the
 * in-progress line is a strength rather than a hedge when it is dated and
 * stated plainly instead of dressed up.
 */
export function RecordFigure({
  rows,
}: {
  rows: { kind: string; title: string; where: string; when: string; status?: string }[];
}) {
  return (
    <figure className="bs-figure bs-headfig">
      <div className="bs-headfig-box">
        <p className="bs-eyebrow">The record</p>
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0 }}>
          {rows.map((r, i) => (
            <li
              key={r.title}
              style={{
                padding: "14px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--hair)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, justifyContent: "space-between" }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".13em", textTransform: "uppercase", color: "var(--quiet)" }}>
                  {r.kind}
                </span>
                <span style={{ fontSize: 10.5, letterSpacing: ".13em", textTransform: "uppercase", color: r.status ? "var(--spot)" : "var(--quiet)" }}>
                  {r.status || r.when}
                </span>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 15.5, fontWeight: 600, lineHeight: 1.3 }}>{r.title}</p>
              <p className="bs-small bs-quiet" style={{ margin: "2px 0 0" }}>
                {r.where}
                {r.status ? ` · ${r.when}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="bs-figcaption">
        Where each qualification stands — completed, or dated and still running.
      </figcaption>
    </figure>
  );
}

/* ── /reviews — who wrote them ───────────────────────────────────────── */

/**
 * A contributor list, not a quote.
 *
 * Two earlier passes were wrong in instructive ways: grey bars standing in for
 * quote text looked exactly like a loading skeleton, and a real pull quote put
 * the first recommendation at the top of a page whose next screen is that same
 * recommendation in full. This lists the people instead — names and roles a
 * reader can scan before deciding to read the quotes themselves.
 */
export function ReferencesFigure({
  people,
}: {
  people: { name: string; role: string; company: string; avatar: string; linkedinUrl: string }[];
}) {
  return (
    <figure className="bs-figure bs-headfig">
      <div className="bs-headfig-box">
        <p className="bs-eyebrow">Written by</p>
        <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
          {people.map((p, i) => (
            <li
              key={p.linkedinUrl}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--hair)",
              }}
            >
              <Image
                src={p.avatar}
                alt=""
                width={44}
                height={44}
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <a
                  href={p.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bs-link-plain"
                  style={{ fontSize: 16, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 }}
                >
                  {p.name}
                  <IconBrandLinkedin size={15} style={{ color: "var(--spot)" }} />
                </a>
                <p className="bs-small bs-quiet" style={{ margin: "2px 0 0" }}>
                  {p.role}, {p.company}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="bs-figcaption">
        Every recommendation links back to the LinkedIn profile that wrote it.
      </figcaption>
    </figure>
  );
}

/* ── /contact — the reply window ─────────────────────────────────────── */

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function ReplyFigure({ rows }: { rows: { label: string; value: string }[] }) {
  const cx = FIG_W / 2;
  const cy = 92;
  const r = 68;
  const height = 190 + rows.length * 34;

  // 24 hours of a day drawn as 300° rather than a full turn: a closed ring
  // would read as "always", and the promise is a working day, not a clock.
  const sweep = 300;
  const start = polar(cx, cy, r, 0);
  const end = polar(cx, cy, r, sweep);

  return (
    <Figure
      title="Replies within 24 hours, from New Delhi on IST"
      caption="Every message lands in my inbox directly — replies inside a working day."
      height={height}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={HAIR} strokeWidth="10" />
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={SPOT}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        style={{ fontSize: 42, fontWeight: 600, fill: INK, letterSpacing: "-0.03em" }}
      >
        24h
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" style={label(9.5)}>
        REPLY WINDOW
      </text>

      {rows.map((row, i) => {
        const y = 188 + i * 34;
        return (
          <g key={row.label}>
            <line x1="0" y1={y - 20} x2={FIG_W} y2={y - 20} stroke={HAIR} strokeWidth="1" />
            <text x="0" y={y} style={label()}>
              {row.label.toUpperCase()}
            </text>
            <text x={FIG_W} y={y} textAnchor="end" style={{ fontSize: 13.5, fill: INK }}>
              {row.value}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

/* ── /about — the portrait ───────────────────────────────────────────── */

/**
 * About is the one page where the figure should be a photograph: it is the
 * page a person reads to decide who they are dealing with. Same halftone
 * treatment as the front page, so the two heads are the same object.
 */
export function PortraitFigure({
  caption,
  children,
}: {
  caption: string;
  /** Standing details under the caption — see /about, which puts the facts
   *  that used to sit in a sidebar here instead. */
  children?: React.ReactNode;
}) {
  return (
    <figure className="bs-figure bs-headfig">
      <div
        className="bs-halftone"
        style={{ width: "100%", aspectRatio: "4 / 5", position: "relative" }}
      >
        <Image
          src="/assets/images/deepak-kumar-react-developer-india.jpg"
          alt="Deepak Kumar, senior software and AI engineer, in New Delhi"
          fill
          sizes="(max-width: 1024px) 100vw, 380px"
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>
      <figcaption className="bs-figcaption">{caption}</figcaption>

      {/* Directly under the portrait, above anything else: they belong to the
          photograph, and pushed to the bottom of a stack of details they read
          as a footer for the whole column instead. */}
      <div
        className="bs-socials bs-mt-3"
        style={{ paddingTop: 14, borderTop: "1px solid var(--hair)" }}
      >
        <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" aria-label="Deepak Kumar on GitHub">
          <IconBrandGithub size={21} />
        </a>
        <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Deepak Kumar on LinkedIn">
          <IconBrandLinkedin size={21} />
        </a>
        <a href={PERSONAL_INFO.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Deepak Kumar on X">
          <IconBrandX size={21} />
        </a>
      </div>

      {children}
    </figure>
  );
}

/**
 * The employer and the way through to the full record — what is left after
 * cutting a sidebar of five facts down to the ones a reader acts on. The city
 * is not among them: the caption above it and the dateline at the top of the
 * page both already say New Delhi, and a third copy was costing a row.
 */
export function CurrentlyBlock({
  company,
  role,
  logo,
  url,
  cta,
}: {
  company: string;
  role: string;
  logo: string;
  url: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="bs-mt-4" style={{ paddingTop: 16, borderTop: "1px solid var(--hair)" }}>
      <p className="bs-eyebrow">Currently</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 11 }}>
        <Image src={logo} alt={company} width={38} height={38} className="bs-logo" />
        <div style={{ minWidth: 0 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-link-plain"
            style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25, display: "block" }}
          >
            {company}
          </a>
          <p className="bs-small bs-quiet" style={{ margin: "2px 0 0" }}>{role}</p>
        </div>
      </div>

      {cta ? (
        <div className="bs-actions bs-mt-4">
          <Link href={cta.href} className="bs-link">
            {cta.label} <IconArrowUpRight size={16} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/* ── /blog — the archive ─────────────────────────────────────────────── */

/**
 * A broadsheet page drawn small, then the numbers under it. The blog index is
 * the one page whose subject *is* a page, so the figure can be literal: this
 * is what the reader is about to scroll through.
 */
export function ArchiveFigure({
  articles,
  topics,
  latest,
}: {
  articles: number;
  topics: number;
  latest?: string;
}) {
  const rows = [
    { label: "Articles", value: String(articles) },
    { label: "Topics", value: String(topics) },
    ...(latest ? [{ label: "Latest", value: latest }] : []),
  ];
  const pageH = 186;
  const height = pageH + 26 + rows.length * 34;

  // Two columns of body copy, drawn as rules. Ragged lengths and a short last
  // line per column, so it reads as set type rather than as a placeholder.
  const colW = (FIG_W - 24) / 2;
  const lines = [1, 0.94, 1, 0.88, 1, 0.72];

  return (
    <Figure
      title={`Blog archive: ${articles} articles across ${topics} topics`}
      caption={`${articles} articles across ${topics} topics — every one of them reachable from this page.`}
      height={height}
    >
      <rect x="0" y="0" width={FIG_W} height={pageH} fill={SURFACE} stroke={HAIR} strokeWidth="1" />

      {/* Masthead: the same thick–thin rail the real page runs under. */}
      <rect x="16" y="16" width={FIG_W - 32} height="5" fill={INK} />
      <rect x="16" y="27" width={FIG_W - 32} height="1" fill={RULE} />

      {/* Headline, two decks. */}
      <rect x="16" y="42" width={FIG_W - 90} height="13" fill={INK} opacity=".82" />
      <rect x="16" y="61" width={FIG_W - 150} height="13" fill={INK} opacity=".82" />
      <rect x="16" y="86" width="54" height="6" fill={SPOT} />

      {[0, 1].map((col) =>
        lines.map((w, i) => (
          <rect
            key={`${col}-${i}`}
            x={16 + col * (colW + 8)}
            y={104 + i * 13}
            width={(colW - 16) * w}
            height="6"
            fill={RULE}
          />
        ))
      )}

      {rows.map((r, i) => {
        const y = pageH + 44 + i * 34;
        return (
          <g key={r.label}>
            <line x1="0" y1={y - 20} x2={FIG_W} y2={y - 20} stroke={HAIR} strokeWidth="1" />
            <text x="0" y={y} style={label()}>
              {r.label.toUpperCase()}
            </text>
            <text x={FIG_W} y={y} textAnchor="end" style={{ fontSize: 13.5, fill: INK }}>
              {r.value}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}
