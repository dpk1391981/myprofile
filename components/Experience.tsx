"use client";
import React, { useState } from "react";
import Image from "next/image";
import { totalExperianceYears } from "./utils/date";
import { EXPERIENCES } from "./utils/portfolio-data";
import { IconExternalLink, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import type { ExperienceItem, ExperienceChild, ChildProject } from "./utils/portfolio-data";

/* ---- Project mini card ---- */
const ProjectMini = ({ project }: { project: ChildProject }) => (
  <div className="exp-project-mini">
    <div className="flex items-start justify-between gap-2 mb-1">
      <div>
        <p className="text-xs font-bold text-slate-800">{project.title}</p>
        <p className="text-[10px] text-slate-400 font-medium">{project.type}</p>
      </div>
      {project.website && (
        <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" aria-label={`Visit ${project.title}`} onClick={(e) => e.stopPropagation()}>
          <IconExternalLink size={12} />
        </a>
      )}
    </div>
    <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{project.overview}</p>
    <div className="flex flex-wrap gap-1">
      {project.technologies.map((t) => <span key={t} className="exp-project-tech">{t}</span>)}
    </div>
  </div>
);

/* ---- Projects Built — collapsible, default closed ---- */
const ProjectsBuilt = ({ projects }: { projects: ChildProject[] }) => {
  const [open, setOpen] = useState(false);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <button onClick={() => setOpen(!open)} className="exp-projects-toggle">
        <span className="exp-projects-toggle-label">
          Projects Built
          <span className="exp-children-count">{projects.length}</span>
        </span>
        <span className="exp-children-toggle-hint">
          {open ? "Hide" : "View"}
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div className="exp-projects-list">
          {projects.map((proj, pi) => <ProjectMini key={pi} project={proj} />)}
        </div>
      )}
    </div>
  );
};

/* ---- Child project card (expandable) ---- */
const ChildCard = ({ child, defaultOpen = false }: { child: ExperienceChild; defaultOpen?: boolean }) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  const tenure = totalExperianceYears(
    child.startDate.year, child.startDate.month, child.startDate.day,
    child.endDate?.year, child.endDate?.month, child.endDate?.day
  );

  return (
    <article className="timeline-card-child" itemScope itemType="https://schema.org/OrganizationRole">
      {/* Always visible header — tappable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="exp-child-header"
        aria-expanded={expanded}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
          <Image src={child.logo} alt={child.logoAlt} width={40} height={40} loading="lazy" className="object-cover w-full h-full" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm sm:text-base font-bold text-slate-900" itemProp="roleName">{child.company}</h4>
            <a
              href={child.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors"
              aria-label={`Visit ${child.company}`}
              onClick={(e) => e.stopPropagation()}
            >
              <IconExternalLink size={14} />
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {child.role} · <time>{child.dateLabel}</time> · <span className="text-blue-600 font-semibold">{tenure}</span>
          </p>
        </div>
        <div className={`exp-child-toggle ${expanded ? "exp-child-toggle--open" : ""}`}>
          {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="exp-child-body">
          <p className="text-sm text-slate-500 leading-relaxed mb-3" itemProp="description">
            {child.description}
          </p>

          {child.highlights.length > 0 && (
            <ul className="space-y-2 mb-3" role="list">
              {child.highlights.map((h, i) => (
                <li key={i} className="highlight-item">
                  <span className="highlight-dot" aria-hidden="true" />
                  <span className="text-sm text-slate-600 leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          )}

          {child.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {child.tools.map((tool) => (
                <span key={tool} className="tool-tag text-xs">{tool}</span>
              ))}
            </div>
          )}

          {/* Projects built at this company */}
          {child.projects && child.projects.length > 0 && (
            <ProjectsBuilt projects={child.projects} />
          )}
        </div>
      )}
    </article>
  );
};

/* ---- Main experience entry ---- */
const ExperienceEntry = ({ exp }: { exp: ExperienceItem }) => {
  const [childrenOpen, setChildrenOpen] = useState(false);
  const hasChildren = exp.children && exp.children.length > 0;
  const tenure = totalExperianceYears(
    exp.startDate.year, exp.startDate.month, exp.startDate.day,
    exp.endDate?.year, exp.endDate?.month, exp.endDate?.day
  );

  return (
    <article
      className="relative flex gap-4 md:gap-6"
      itemScope
      itemType="https://schema.org/OrganizationRole"
    >
      {/* Timeline node */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="timeline-node">
          <Image
            src={exp.logo}
            alt={exp.logoAlt}
            width={80}
            height={80}
            loading="lazy"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-12">
        <div className="timeline-card">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900" itemProp="memberOf">
                  {exp.company}
                </h3>
                <a
                  href={exp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  aria-label={`Visit ${exp.company} website`}
                >
                  <IconExternalLink size={18} />
                </a>
              </div>
              <p className="text-base font-semibold text-slate-600 mt-0.5" itemProp="roleName">
                {exp.role} · {tenure}
              </p>
            </div>
            {exp.isCurrent && (
              <span className="badge-current flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                Current
              </span>
            )}
          </div>

          {/* Date */}
          <p className="text-sm text-slate-400 font-medium mb-3">
            <time dateTime={`${exp.startDate.year}-${exp.startDate.month}`}>
              {exp.dateLabel}
            </time>
          </p>

          {/* Description */}
          <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4" itemProp="description">
            {exp.description}
          </p>

          {/* Highlights */}
          {exp.highlights.length > 0 && (
            <ul className="space-y-2.5 mb-4" role="list">
              {exp.highlights.map((h, i) => (
                <li key={i} className="highlight-item">
                  <span className="highlight-dot" aria-hidden="true" />
                  <span className="text-sm text-slate-600 leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Tools */}
          {exp.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {exp.tools.map((tool) => (
                <span key={tool} className="tool-tag">{tool}</span>
              ))}
            </div>
          )}

          {/* Projects at parent level (India Today, Phoenix, etc.) */}
          {exp.projects && exp.projects.length > 0 && (
            <ProjectsBuilt projects={exp.projects} />
          )}

          {/* Children (sub-projects / clients) — collapsible */}
          {hasChildren && (
            <div className="mt-5">
              <button
                onClick={() => setChildrenOpen(!childrenOpen)}
                className="exp-children-toggle"
              >
                <span className="exp-children-toggle-label">
                  Products &amp; Clients
                  <span className="exp-children-count">{exp.children!.length}</span>
                </span>
                <span className="exp-children-toggle-hint">
                  {childrenOpen ? "Collapse" : "View all"}
                  {childrenOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </span>
              </button>

              {/* Preview when collapsed — show first child name + others */}
              {!childrenOpen && (
                <div className="exp-children-preview">
                  {exp.children!.map((child, ci) => (
                    <span key={ci} className="exp-children-preview-chip">
                      <Image src={child.logo} alt={child.company} width={16} height={16} className="rounded-sm object-cover" />
                      {child.company}
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded children */}
              {childrenOpen && (
                <div className="exp-children-list">
                  {exp.children!.map((child, ci) => (
                    <ChildCard key={ci} child={child} defaultOpen={ci === 0} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

/* ---- Experience Section ---- */
const Experience = () => {
  return (
    <section className="relative not-prose scroll-mt-[72px] py-16 md:py-24" id="experience">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <header className="section-header mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Career Journey</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Technical Experience
          </h2>
        </header>

        <div className="relative">
          <div className="timeline-line" aria-hidden="true" />
          {EXPERIENCES.map((exp, i) => (
            <ExperienceEntry key={i} exp={exp} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;