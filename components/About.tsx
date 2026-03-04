"use client";
import React from "react";
import Image from "next/image";
import SocialLinks from "./utils/SocialLinks";
import { totalExperianceYears } from "./utils/date";
import { PERSONAL_INFO } from "./utils/portfolio-data";
import { IconCirclesRelation, IconExternalLink, IconTerminal2, IconBrandReactNative, IconApi } from "@tabler/icons-react";

const openContactModal = () => {
  const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const About = () => {
  const yearsExp = totalExperianceYears();
  const cw = PERSONAL_INFO.currentWork;

  return (
    <section className="relative not-prose scroll-mt-[72px]" id="about">
      <header className="hero-section hero-code-bg" role="banner">
        {/* Floating code lines */}
        <div className="hero-code-lines" aria-hidden="true">
          <span className="hero-code-line" style={{ top: "8%", left: "5%", animationDelay: "0s" }}>{"const developer = { name: 'Deepak', stack: 'MERN' };"}</span>
          <span className="hero-code-line" style={{ top: "18%", right: "3%", animationDelay: "2s" }}>{"import { AI } from 'langchain';"}</span>
          <span className="hero-code-line" style={{ top: "72%", left: "8%", animationDelay: "4s" }}>{"await deploy(scalableApp);"}</span>
          <span className="hero-code-line" style={{ top: "82%", right: "6%", animationDelay: "1s" }}>{"export default buildFuture();"}</span>
          <span className="hero-code-line" style={{ top: "45%", left: "2%", animationDelay: "3s" }}>{"// 9+ years of shipping code"}</span>
          <span className="hero-code-line" style={{ top: "55%", right: "2%", animationDelay: "5s" }}>{"app.listen(3000, () => console.log('🚀'));"}</span>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-14 md:py-20 lg:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Profile Image */}
            <div className="hero-profile-ring flex-shrink-0">
              <div className="hero-profile-img">
                <Image
                  src={PERSONAL_INFO.profileImage}
                  alt={`${PERSONAL_INFO.fullName} — ${PERSONAL_INFO.title}`}
                  title={PERSONAL_INFO.fullName}
                  width={180}
                  height={180}
                  priority
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center md:text-left flex-1">
              <div className="mb-3">
                <span className="status-pill">
                  <span className="status-dot" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">Open to Opportunities</span>
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight leading-[1.1]"
                style={{ fontFamily: "var(--font-display)" }}
                title={PERSONAL_INFO.fullName}
              >
                {PERSONAL_INFO.fullName}
              </h1>

              <p className="text-sm sm:text-base font-semibold tracking-wider uppercase mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                {PERSONAL_INFO.tagline}
              </p>

              {/* ============================================================
                  KEY HIGHLIGHTS — Experience + Current Company
                  Big, bold, impossible to miss for HR
                  ============================================================ */}
              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 mb-5">
                {/* Total Experience — BIG */}
                <div className="hero-highlight-badge">
                  <span className="hero-highlight-badge-icon hero-highlight-badge-icon--exp">⚡</span>
                  <div>
                    <p className="hero-highlight-badge-value">{yearsExp}</p>
                    <p className="hero-highlight-badge-label">Total Experience</p>
                  </div>
                </div>

                {/* Current Company — BIG */}
                <a href={cw.url} target="_blank" rel="noopener noreferrer" className="hero-highlight-badge hero-highlight-badge--company">
                  <div className="hero-highlight-badge-logo">
                    <Image src={cw.logo} alt={cw.company} width={36} height={36} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <p className="hero-highlight-badge-value">{cw.company}</p>
                    <p className="hero-highlight-badge-label">{cw.role} · Current <IconExternalLink size={11} className="inline ml-1" /></p>
                  </div>
                </a>
              </div>

              <p className="text-sm md:text-base leading-relaxed mb-5 max-w-xl" style={{ color: "rgba(255,255,255,0.78)" }}>
                Combining technical expertise, strategic problem-solving, and leadership to deliver scalable solutions. Focused on{" "}
                {cw.focus.map((f, i) => (
                  <strong key={f} className="text-blue-300 font-bold">{f}{i < cw.focus.length - 1 ? " & " : ""}</strong>
                ))}.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3">
                <button onClick={openContactModal} className="hero-cta-btn" aria-label={`Contact ${PERSONAL_INFO.fullName}`}>
                  Contact Me <IconCirclesRelation size={18} />
                </button>
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* ---- Current Work Highlights — scrollable strip inside hero ---- */}
          <div className="hero-work-strip">
            {cw.highlights.map((h, i) => (
              <div key={i} className="hero-work-chip">
                <span className="hero-work-chip-icon" aria-hidden="true">
                  {i === 0 ? <IconTerminal2 size={13} /> : i === 1 ? <IconBrandReactNative size={13} /> : <IconApi size={13} />}
                </span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 -mt-7 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "⚡", value: yearsExp, label: "Experience" },
            { icon: "🚀", value: "15+", label: "Projects" },
            { icon: "🏢", value: "7+", label: "Companies" },
            { icon: "🛠️", value: "25+", label: "Technologies" },
          ].map((stat, i) => (
            <article key={i} className="stat-card">
              <span className="text-xl mb-0.5 block" aria-hidden="true">{stat.icon}</span>
              <p className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {stat.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;