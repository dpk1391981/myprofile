"use client";
import React, { useState } from "react";
import {
  getFlagshipProjects,
  getOtherProjects,
  type FeaturedProject,
} from "./utils/portfolio-data";
import { useScrollRevealChildren } from "./utils/useScrollReveal";
import {
  IconArrowUpRight,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconTargetArrow,
  IconBulb,
} from "@tabler/icons-react";

/* ============================================================
   FLAGSHIP CARD — owned products, given the most visual weight
   ============================================================ */
const FlagshipCard = ({ project }: { project: FeaturedProject }) => {
  const [open, setOpen] = useState(false);

  return (
    <article
      className="flagship-card"
      itemScope
      itemType="https://schema.org/SoftwareApplication"
    >
      <div className="flagship-card-glow" aria-hidden="true" />

      <div className="flagship-card-inner">
        {/* ---- Header ---- */}
        <div className="flagship-head">
          <span className="flagship-emoji" aria-hidden="true">
            {project.emoji}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flagship-title-row">
              <h3 className="flagship-title font-display" itemProp="name">
                {project.title}
              </h3>
              {project.status === "Live" && (
                <span className="flagship-live">
                  <span className="flagship-live-dot" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
            <p className="flagship-tagline" itemProp="description">
              {project.tagline}
            </p>
            <p className="flagship-meta">
              {project.role} · {project.type}
              {project.year ? ` · ${project.year}` : ""}
            </p>
          </div>

          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flagship-visit-icon"
              aria-label={`Visit ${project.title}`}
              itemProp="url"
            >
              <IconArrowUpRight size={18} />
            </a>
          )}
        </div>

        {/* ---- Metrics ---- */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="flagship-metrics">
            {project.metrics.map((m) => (
              <div key={m.label} className="flagship-metric">
                <p className="flagship-metric-value font-display">{m.value}</p>
                <p className="flagship-metric-label">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ---- Overview ---- */}
        <p className="flagship-overview">{project.overview}</p>

        {/* ---- Tech ---- */}
        <div className="flagship-tech-row">
          {project.technologies.slice(0, open ? undefined : 8).map((t) => (
            <span key={t} className="flagship-tech">
              {t}
            </span>
          ))}
          {!open && project.technologies.length > 8 && (
            <span className="flagship-tech flagship-tech--more">
              +{project.technologies.length - 8}
            </span>
          )}
        </div>

        {/* ---- Expandable deep dive ---- */}
        {open && (
          <div className="flagship-detail">
            {project.problem && (
              <div className="flagship-block">
                <p className="flagship-block-label">
                  <IconTargetArrow size={13} /> The Problem
                </p>
                <p className="flagship-block-text">{project.problem}</p>
              </div>
            )}

            {project.solution && (
              <div className="flagship-block">
                <p className="flagship-block-label">
                  <IconBulb size={13} /> What I Built
                </p>
                <p className="flagship-block-text">{project.solution}</p>
              </div>
            )}

            {project.features && project.features.length > 0 && (
              <div className="flagship-block">
                <p className="flagship-block-label">
                  <IconCircleCheck size={13} /> Key Capabilities
                </p>
                <ul className="flagship-feature-list" role="list">
                  {project.features.map((f, i) => (
                    <li key={i} className="flagship-feature">
                      <span className="flagship-feature-dot" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ---- Actions ---- */}
        <div className="flagship-actions">
          <button
            onClick={() => setOpen(!open)}
            className="flagship-btn flagship-btn--ghost"
            aria-expanded={open}
          >
            {open ? "Show less" : "How it works"}
            {open ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
          </button>

          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flagship-btn flagship-btn--primary"
            >
              Visit {project.title.replace(/\.(in|com)$/, "")}
              <IconArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

/* ============================================================
   COMPACT CARD — client & enterprise work
   ============================================================ */
const CompactCard = ({ project }: { project: FeaturedProject }) => {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(project.impact?.length || project.problem);

  return (
    <article
      className="work-card"
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <div className="work-card-head">
        <span className="work-card-emoji" aria-hidden="true">
          {project.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="work-card-title font-display" itemProp="name">
            {project.title}
          </h3>
          <p className="work-card-meta">
            {project.client}
            {project.year ? ` · ${project.year}` : ""}
          </p>
        </div>
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="work-card-link"
            aria-label={`Visit ${project.title}`}
          >
            <IconArrowUpRight size={15} />
          </a>
        )}
      </div>

      <span className="work-card-type">{project.type}</span>

      <p className="work-card-overview" itemProp="description">
        {project.overview}
      </p>

      {open && project.impact && project.impact.length > 0 && (
        <ul className="work-card-impact" role="list">
          {project.impact.map((im, i) => (
            <li key={i}>
              <IconCircleCheck size={13} className="work-card-impact-icon" />
              <span>{im}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="work-card-tech">
        {project.technologies.slice(0, 5).map((t) => (
          <span key={t} className="work-card-tag">
            {t}
          </span>
        ))}
        {project.technologies.length > 5 && (
          <span className="work-card-tag work-card-tag--more">
            +{project.technologies.length - 5}
          </span>
        )}
      </div>

      {hasDetail && (
        <button
          onClick={() => setOpen(!open)}
          className="work-card-toggle"
          aria-expanded={open}
        >
          {open ? "Less" : "Impact"}
          {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
        </button>
      )}
    </article>
  );
};

/* ============================================================
   SECTION
   ============================================================ */
const Projects = () => {
  const gridRef = useScrollRevealChildren<HTMLDivElement>();
  const flagship = getFlagshipProjects();
  const others = getOtherProjects();

  return (
    <section
      className="relative not-prose scroll-mt-[72px] section-pad"
      id="projects"
      aria-label="Products and projects built by Deepak Kumar"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <header className="section-header section-header-center text-center">
          <p className="section-eyebrow">Products &amp; Projects</p>
          <h2 className="section-title font-display">
            Products I Built <span className="text-gradient">End&#8209;to&#8209;End</span>
          </h2>
          <p className="section-sub">
            Two live products I own from architecture to SEO — plus the enterprise
            platforms I&apos;ve shipped for clients and employers.
          </p>
        </header>

        {/* ---- Flagship products ---- */}
        <div className="flagship-grid">
          {flagship.map((p) => (
            <FlagshipCard key={p.slug} project={p} />
          ))}
        </div>

        {/* ---- Client & enterprise work ---- */}
        {others.length > 0 && (
          <>
            <div className="work-divider">
              <span className="work-divider-label">Client &amp; Enterprise Work</span>
            </div>

            <div ref={gridRef} className="work-grid stagger-children">
              {others.map((p) => (
                <div key={p.slug} className="animate-on-scroll">
                  <CompactCard project={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Projects;
