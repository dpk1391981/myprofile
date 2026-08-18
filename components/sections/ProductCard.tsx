"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconArrowUpRight,
  IconBroadcast,
  IconChevronDown,
  IconCornerDownRight,
  IconTool,
} from "@tabler/icons-react";
import type { FeaturedProject } from "../utils/portfolio-data";
import { PRODUCT_LOGOS } from "../utils/site-data";

/**
 * One product, collapsed by default.
 *
 * WHY COLLAPSED. Each of these entries carries an overview, a problem
 * statement, a feature list, a role and a tech rail. Four of them stacked
 * full-height turned the top third of the front page into ~2,000 words that a
 * recruiter has to scroll past to reach the work history — which is the thing
 * they came for. The summary is what stays visible; the detail is one click
 * away for the reader who actually wants it.
 *
 * Expanding is a user-initiated shift, so it costs nothing in Cumulative
 * Layout Shift — CLS excludes movement within 500ms of an interaction.
 */
export default function ProductCard({ product: p }: { product: FeaturedProject }) {
  const [open, setOpen] = useState(false);
  const points = p.features?.length ? p.features : p.impact ?? [];
  const logo = PRODUCT_LOGOS[p.slug];
  const panelId = `product-panel-${p.slug}`;

  // Collapsed shows the first three; the rest arrive with the panel.
  const visibleTags = open ? p.technologies : p.technologies.slice(0, 3);
  const hiddenTagCount = p.technologies.length - visibleTags.length;

  return (
    <article className="bs-product">
      <div className="bs-product-top">
        {logo ? (
          <span className="bs-product-logo">
            <Image
              src={logo.src}
              alt={`${p.title} logo`}
              width={logo.width}
              height={logo.height}
              sizes="120px"
            />
          </span>
        ) : null}

        <div className="bs-product-titles">
          <div className="bs-product-head">
            <h3 className="bs-h3">{p.title}</h3>
            {p.status === "Live" ? (
              <span className="bs-live-flag"><IconBroadcast size={13} /> Live</span>
            ) : p.status === "In Development" ? (
              <span className="bs-live-flag bs-live-flag--wip"><IconTool size={13} /> In development</span>
            ) : null}
          </div>
          {p.tagline ? <p className="bs-product-tagline">{p.tagline}</p> : null}
        </div>
      </div>

      {/* The summary line. Clamped to three lines closed, full when open, so
          every card presents the same height regardless of how much prose the
          entry happens to carry. */}
      <p className={`bs-body-text bs-product-overview${open ? "" : " bs-clamp-3"}`}>
        {p.overview}
      </p>

      <div className="bs-tags bs-product-tags">
        {visibleTags.map((t) => (
          <span key={t} className="bs-tag">{t}</span>
        ))}
        {hiddenTagCount > 0 ? (
          <span className="bs-tag bs-tag--more">+{hiddenTagCount}</span>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className="bs-product-detail">
          {p.problem ? (
            <p className="bs-body-text">
              <span style={{ fontWeight: 600 }}>The problem — </span>
              <span className="bs-quiet">{p.problem}</span>
            </p>
          ) : null}

          {points.length ? (
            <ul className="bs-arrow-list bs-mt-4">
              {points.map((f) => (
                <li key={f}>
                  <IconCornerDownRight size={15} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {p.role ? (
            <div className="bs-product-meta bs-mt-4">
              <p className="bs-eyebrow">Role</p>
              <p className="bs-small bs-mt-1">{p.role}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="bs-product-actions">
        <button
          type="button"
          className="bs-viewmore"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show less" : "View more"}
          <IconChevronDown size={15} className={`bs-viewmore-icon${open ? " bs-viewmore-icon--open" : ""}`} />
        </button>

        {p.website ? (
          <a href={p.website} target="_blank" rel="noopener noreferrer" className="bs-link">
            Visit {p.title} <IconArrowUpRight size={16} />
          </a>
        ) : null}
      </div>
    </article>
  );
}
