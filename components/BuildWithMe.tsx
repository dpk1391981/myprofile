"use client";
import React from "react";
import { PERSONAL_INFO } from "./utils/portfolio-data";
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
} from "@tabler/icons-react";

const SERVICES = [
  { icon: <IconCode size={20} />, title: "Full Stack Development", desc: "React, Next.js, Node.js, MongoDB — production-grade web apps" },
  { icon: <IconBrain size={20} />, title: "AI / ML Integration", desc: "OpenAI, LangChain, RAG systems, content automation, voice AI" },
  { icon: <IconServer size={20} />, title: "Architecture & Scalability", desc: "Microservices, real-time systems, 5M+ concurrent user scale" },
  { icon: <IconRocket size={20} />, title: "Product Engineering", desc: "From idea → MVP → scale. Built 10+ products across 5+ companies" },
];

const PROOF_POINTS = [
  "9+ years production experience",
  "Currently at India Today Group",
  "15+ products shipped",
  "AI-powered editorial tools",
  "5M+ concurrent users handled",
  "MERN + AI/ML full stack",
];

const openContactModal = () => {
  const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const BuildWithMe = () => {
  const yearsExp = totalExperianceYears();

  return (
    <section className="relative not-prose scroll-mt-[72px] py-12 md:py-20" id="build-with-me">
      {/* Dark background */}
      <div className="bwm-bg" aria-hidden="true" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Let&apos;s Create Together</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Build With Me
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            I help companies build scalable products, integrate AI, and ship faster.
            With {yearsExp} of experience and a passion for clean architecture.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {SERVICES.map((s, i) => (
            <div key={i} className="bwm-service-card">
              <div className="bwm-service-icon">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Proof points */}
        <div className="bwm-proof-row">
          {PROOF_POINTS.map((p, i) => (
            <span key={i} className="bwm-proof-chip">
              <IconCheck size={12} className="text-green-400 flex-shrink-0" />
              {p}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <a href="/joinme" className="bwm-cta-primary">
            <IconRocket size={18} />
            Start a Project
            <IconArrowRight size={16} />
          </a>
          <button onClick={openContactModal} className="bwm-cta-secondary">
            <IconMail size={18} />
            Quick Message
          </button>
        </div>

        {/* Social row */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" className="bwm-social" aria-label="GitHub">
            <IconBrandGithub size={18} />
          </a>
          <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" className="bwm-social" aria-label="LinkedIn">
            <IconBrandLinkedin size={18} />
          </a>
          {PERSONAL_INFO.email && (
            <a href={`mailto:${PERSONAL_INFO.email}`} className="bwm-social" aria-label="Email">
              <IconMail size={18} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default BuildWithMe;