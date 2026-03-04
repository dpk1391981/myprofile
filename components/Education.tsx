"use client";
import React from "react";
import Image from "next/image";
import { EDUCATION } from "./utils/portfolio-data";
import { useScrollRevealChildren } from "./utils/useScrollReveal";
import { IconCertificate, IconSchool, IconExternalLink } from "@tabler/icons-react";

const Education = () => {
  const sectionRef = useScrollRevealChildren<HTMLDivElement>();
  const degrees = EDUCATION.filter((e) => e.type === "degree");
  const certs = EDUCATION.filter((e) => e.type === "certification");

  return (
    <section className="relative not-prose scroll-mt-[72px] py-10 md:py-14" id="education">
      <div className="edu-bg-pattern" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8" ref={sectionRef}>
        <header className="section-header section-header-center text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Academic Background</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Education &amp; Certifications
          </h2>
        </header>

        {/* Degrees + Certs side by side on desktop */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Degrees — takes 3 cols */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="edu-section-icon"><IconSchool size={16} /></div>
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "var(--font-display)" }}>Degrees</h3>
            </div>
            <div className="space-y-3 stagger-children">
              {degrees.map((edu, i) => (
                <article key={i} className="animate-on-scroll edu-compact-card" itemScope itemType="https://schema.org/EducationalOccupationalCredential">
                  <div className="edu-card-logo edu-card-logo--sm flex-shrink-0">
                    <Image src={edu.logo} alt={edu.logoAlt} width={32} height={32} loading="lazy" className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug" itemProp="name">{edu.title}</h4>
                    {edu.subtitle && <p className="text-xs text-blue-600 font-medium" itemProp="educationalLevel">{edu.subtitle}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{edu.institution} · <time>{edu.dateLabel}</time></p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Certs — takes 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="edu-section-icon edu-section-icon--cert"><IconCertificate size={16} /></div>
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "var(--font-display)" }}>Certifications</h3>
            </div>
            <div className="space-y-3 stagger-children">
              {certs.map((edu, i) => (
                <article key={i} className="animate-on-scroll edu-compact-card" itemScope itemType="https://schema.org/EducationalOccupationalCredential">
                  <div className="edu-card-logo edu-card-logo--sm flex-shrink-0">
                    <Image src={edu.logo} alt={edu.logoAlt} width={32} height={32} loading="lazy" className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug" itemProp="name">{edu.title}</h4>
                    {edu.subtitle && <p className="text-xs text-slate-500">{edu.subtitle}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">{edu.institution} · <time>{edu.dateLabel}</time></span>
                      {edu.certificateUrl && (
                        <a href={edu.certificateUrl} target="_blank" rel="noopener noreferrer" className="edu-cert-link" aria-label={`View certificate`}>
                          <IconExternalLink size={11} /> Cert
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;