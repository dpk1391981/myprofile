"use client";
import React from "react";
import Image from "next/image";
import { totalExperianceYears } from "./utils/date";
import { EXPERIENCES } from "./utils/portfolio-data";
import { useScrollRevealChildren } from "./utils/useScrollReveal";
import { IconExternalLink } from "@tabler/icons-react";

import type { ExperienceItem, ExperienceChild } from "./utils/portfolio-data";

/* ---- Child project card ---- */
const ChildCard = ({ child }: { child: ExperienceChild }) => {
  const tenure = totalExperianceYears(child.startDate.year, child.startDate.month, child.startDate.day);

  return (
    <article
      className="timeline-card-child"
      itemScope
      itemType="https://schema.org/OrganizationRole"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
          <Image
            src={child.logo}
            alt={child.logoAlt}
            width={40}
            height={40}
            loading="lazy"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900" itemProp="roleName">
              {child.company}
            </h4>
            <a
              href={child.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors"
              aria-label={`Visit ${child.company} website`}
            >
              <IconExternalLink size={16} />
            </a>
          </div>
          <p className="text-sm font-semibold text-slate-600">{child.role}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            <time>{child.dateLabel}</time> · {tenure}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed mb-3" itemProp="description">
        {child.description}
      </p>

      {/* Highlights */}
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

      {/* Tools */}
      {child.tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {child.tools.map((tool) => (
            <span key={tool} className="tool-tag text-xs">{tool}</span>
          ))}
        </div>
      )}
    </article>
  );
};

/* ---- Main experience entry ---- */
const ExperienceEntry = ({ exp }: { exp: ExperienceItem }) => {
  const tenure = totalExperianceYears(exp.startDate.year, exp.startDate.month, exp.startDate.day);

  return (
    <article
      className="animate-on-scroll relative flex gap-4 md:gap-6"
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
                <h3
                  className="text-xl md:text-2xl font-bold text-slate-900"
                 
                  itemProp="memberOf"
                >
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

          {/* Children (sub-projects) */}
          {exp.children && exp.children.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                Products &amp; Clients
              </p>
              <div className="space-y-3">
                {exp.children.map((child, ci) => (
                  <ChildCard key={ci} child={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

/* ---- Experience Section ---- */
const Experience = () => {
  const sectionRef = useScrollRevealChildren<HTMLDivElement>();

  return (
    <section className="relative not-prose scroll-mt-[72px] py-16 md:py-10" id="experience">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <header className="section-header mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Career Journey</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
           
          >
            Technical Experience
          </h2>
        </header>

        {/* Timeline */}
        <div ref={sectionRef} className="relative stagger-children">
          {/* Vertical line */}
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