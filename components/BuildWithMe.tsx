"use client";
import React from "react";
import Link from "next/link";
import { PERSONAL_INFO, FOOTER } from "./utils/portfolio-data";
import { totalExperianceYears } from "./utils/date";
import {
  IconRocket,
  IconBrain,
  IconCode,
  IconServer,
  IconArrowRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconCheck,
  IconDownload,
  IconClockHour4,
  IconWorld,
} from "@tabler/icons-react";

const SERVICES = [
  {
    icon: <IconCode size={20} />,
    title: "Full Stack Development",
    desc: "React, Next.js, Node.js, NestJS, MongoDB & MySQL — production-grade web apps",
  },
  {
    icon: <IconBrain size={20} />,
    title: "AI / ML Integration",
    desc: "OpenAI, LangChain, RAG systems, semantic search, content & voice automation",
  },
  {
    icon: <IconServer size={20} />,
    title: "Architecture & Scale",
    desc: "Microservices, real-time pipelines, caching — proven at 5M+ concurrent users",
  },
  {
    icon: <IconRocket size={20} />,
    title: "Product Engineering",
    desc: "Idea → MVP → scale. Two live products of my own, 15+ shipped for others",
  },
];

const PROOF_POINTS = [
  "9+ years production experience",
  "Currently at India Today Group",
  "17+ products shipped",
  "2 live products I own",
  "5M+ concurrent users handled",
  "AWS Certified Solutions Architect",
];

const openContactModal = () => {
  const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const BuildWithMe = () => {
  const yearsExp = totalExperianceYears();

  return (
    <section
      className="relative not-prose scroll-mt-[72px] section-pad"
      id="build-with-me"
      aria-label="Work with Deepak Kumar"
    >
      {/* Dark background */}
      <div className="bwm-bg" aria-hidden="true">
        <div className="bwm-aurora bwm-aurora--1" />
        <div className="bwm-aurora bwm-aurora--2" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">
        {/* ---- Header ---- */}
        <div className="text-center mb-10">
          <p className="bwm-eyebrow">Let&apos;s Build Something</p>
          <h2 className="bwm-title font-display">
            Ready to ship your <span className="hero-role-accent">next product?</span>
          </h2>
          <p className="bwm-sub">
            {yearsExp} of shipping software that holds up under real traffic. Hire me
            full-time, bring me in on contract, or start with a quick conversation —
            I reply within 24 hours.
          </p>
        </div>

        {/* ---- Services grid ---- */}
        <div className="grid sm:grid-cols-2 gap-3 mb-9">
          {SERVICES.map((s) => (
            <div key={s.title} className="bwm-service-card">
              <div className="bwm-service-icon">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ---- Proof points ---- */}
        <div className="bwm-proof-row">
          {PROOF_POINTS.map((p) => (
            <span key={p} className="bwm-proof-chip">
              <IconCheck size={12} className="text-emerald-400 flex-shrink-0" />
              {p}
            </span>
          ))}
        </div>

        {/* ---- Resume + hire panel ---- */}
        <div className="bwm-panel">
          <div className="bwm-panel-copy">
            <h3 className="bwm-panel-title font-display">
              Reviewing me for a role?
            </h3>
            <p className="bwm-panel-text">
              Grab the full CV — career history, stack, certifications and the
              products I&apos;ve shipped, in one PDF.
            </p>
            <div className="bwm-panel-meta">
              <span>
                <IconClockHour4 size={13} /> Replies in ~24h
              </span>
              <span>
                <IconWorld size={13} /> Delhi NCR or fully remote
              </span>
            </div>
          </div>

          <div className="bwm-panel-actions">
            <a
              href={FOOTER.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="dk-btn dk-btn--primary dk-btn--lg"
              aria-label="Download Deepak Kumar's resume as PDF"
            >
              <IconDownload size={18} />
              Download Resume
            </a>
            <button onClick={openContactModal} className="dk-btn dk-btn--glass dk-btn--lg">
              <IconMail size={18} />
              Message Me
            </button>
          </div>
        </div>

        {/* ---- Secondary CTA ---- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/joinme" className="bwm-cta-primary">
            <IconRocket size={18} />
            Start a Project
            <IconArrowRight size={16} />
          </Link>
          <Link href="/projects" className="bwm-cta-secondary">
            See What I&apos;ve Built
            <IconArrowRight size={16} />
          </Link>
        </div>

        {/* ---- Social row ---- */}
        <div className="flex items-center justify-center gap-3 mt-7">
          <a
            href={PERSONAL_INFO.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="bwm-social"
            aria-label="GitHub"
          >
            <IconBrandGithub size={18} />
          </a>
          <a
            href={PERSONAL_INFO.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="bwm-social"
            aria-label="LinkedIn"
          >
            <IconBrandLinkedin size={18} />
          </a>
          {PERSONAL_INFO.email && (
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="bwm-social"
              aria-label="Email"
            >
              <IconMail size={18} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default BuildWithMe;
