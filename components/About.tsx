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
        {/* ======= IDE-STYLE CODE BACKGROUND ======= */}
        <div className="hero-ide-bg" aria-hidden="true">
          {/* Left code block — like a real editor */}
          <pre className="hero-code-block hero-code-block--left">
            <code>
              <span className="hc-keyword">const</span> <span className="hc-var">developer</span> <span className="hc-op">=</span> {"{"}{"\n"}
              {"  "}<span className="hc-prop">name</span>: <span className="hc-string">&apos;Deepak Kumar&apos;</span>,{"\n"}
              {"  "}<span className="hc-prop">role</span>: <span className="hc-string">&apos;Sr Software Engineer&apos;</span>,{"\n"}
              {"  "}<span className="hc-prop">stack</span>: [<span className="hc-string">&apos;React&apos;</span>, <span className="hc-string">&apos;Node&apos;</span>, <span className="hc-string">&apos;MongoDB&apos;</span>],{"\n"}
              {"  "}<span className="hc-prop">experience</span>: <span className="hc-string">&apos;9+ years&apos;</span>,{"\n"}
              {"  "}<span className="hc-prop">ai</span>: [<span className="hc-string">&apos;OpenAI&apos;</span>, <span className="hc-string">&apos;LangChain&apos;</span>],{"\n"}
              {"}"};{"\n\n"}
              <span className="hc-keyword">import</span> {"{"} <span className="hc-var">Express</span> {"}"} <span className="hc-keyword">from</span> <span className="hc-string">&apos;express&apos;</span>;{"\n"}
              <span className="hc-keyword">import</span> {"{"} <span className="hc-var">OpenAI</span> {"}"} <span className="hc-keyword">from</span> <span className="hc-string">&apos;langchain&apos;</span>;{"\n\n"}
              <span className="hc-comment">{"// Building the future"}</span>{"\n"}
              <span className="hc-keyword">const</span> <span className="hc-var">app</span> <span className="hc-op">=</span> <span className="hc-func">Express</span>();
            </code>
          </pre>

          {/* Right code block */}
          <pre className="hero-code-block hero-code-block--right">
            <code>
              <span className="hc-keyword">async function</span> <span className="hc-func">buildProduct</span>() {"{"}{"\n"}
              {"  "}<span className="hc-keyword">const</span> <span className="hc-var">api</span> <span className="hc-op">=</span> <span className="hc-keyword">await</span> <span className="hc-func">createAPI</span>();{"\n"}
              {"  "}<span className="hc-keyword">const</span> <span className="hc-var">db</span> <span className="hc-op">=</span> <span className="hc-keyword">await</span> <span className="hc-func">connectDB</span>();{"\n"}
              {"  "}<span className="hc-keyword">const</span> <span className="hc-var">ai</span> <span className="hc-op">=</span> <span className="hc-keyword">new</span> <span className="hc-func">OpenAI</span>();{"\n\n"}
              {"  "}<span className="hc-keyword">return</span> <span className="hc-func">deploy</span>({"{"}{"\n"}
              {"    "}<span className="hc-prop">api</span>, <span className="hc-prop">db</span>, <span className="hc-prop">ai</span>,{"\n"}
              {"    "}<span className="hc-prop">scale</span>: <span className="hc-string">&apos;production&apos;</span>{"\n"}
              {"  "}{"}"});{"\n"}
              {"}"}{"\n\n"}
              <span className="hc-comment">{"// 🚀 Ship it!"}</span>{"\n"}
              <span className="hc-func">buildProduct</span>().<span className="hc-func">then</span>(<span className="hc-var">console</span>.<span className="hc-func">log</span>);
            </code>
          </pre>

          {/* Animated floating particles */}
          <div className="hero-particles">
            <span className="hero-particle" style={{ top: "20%", left: "30%", animationDelay: "0s" }} />
            <span className="hero-particle" style={{ top: "60%", left: "70%", animationDelay: "2s" }} />
            <span className="hero-particle" style={{ top: "40%", left: "50%", animationDelay: "4s" }} />
            <span className="hero-particle" style={{ top: "80%", left: "20%", animationDelay: "1s" }} />
            <span className="hero-particle" style={{ top: "15%", left: "85%", animationDelay: "3s" }} />
            <span className="hero-particle" style={{ top: "70%", left: "40%", animationDelay: "5s" }} />
          </div>
        </div>

        {/* Terminal window dots */}
        <div className="hero-terminal-dots" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20">
          {/* Mobile: stacked centered | Desktop: side by side */}
          <div className="flex flex-col items-center md:flex-row md:items-center gap-6 md:gap-10">
            {/* Profile */}
            <div className="hero-profile-ring flex-shrink-0">
              <div className="hero-profile-img">
                <Image
                  src={PERSONAL_INFO.profileImage}
                  alt={`${PERSONAL_INFO.fullName} — ${PERSONAL_INFO.title}`}
                  title={PERSONAL_INFO.fullName}
                  width={160}
                  height={160}
                  priority
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center md:text-left flex-1 min-w-0">
              {/* Status */}
              <span className="status-pill mb-3 inline-flex">
                <span className="status-dot" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-semibold text-white">Open to Opportunities</span>
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1.5 tracking-tight leading-[1.15]" title={PERSONAL_INFO.fullName}>
                {PERSONAL_INFO.fullName}
              </h1>

              <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-4 text-blue-300/60">
                {PERSONAL_INFO.tagline}
              </p>

              {/* KEY HIGHLIGHTS — stacked on mobile, row on tablet+ */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4 w-full sm:w-auto">
                <div className="hero-highlight-badge">
                  <span className="hero-highlight-badge-icon hero-highlight-badge-icon--exp">⚡</span>
                  <div>
                    <p className="hero-highlight-badge-value">{yearsExp}</p>
                    <p className="hero-highlight-badge-label">Total Experience</p>
                  </div>
                </div>

                <a href={cw.url} target="_blank" rel="noopener noreferrer" className="hero-highlight-badge hero-highlight-badge--company">
                  <div className="hero-highlight-badge-logo">
                    <Image src={cw.logo} alt={cw.company} width={36} height={36} className="object-cover w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="hero-highlight-badge-value truncate">{cw.company}</p>
                    <p className="hero-highlight-badge-label">{cw.role} · Current <IconExternalLink size={10} className="inline" /></p>
                  </div>
                </a>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed mb-4 max-w-lg text-white/75 mx-auto md:mx-0">
                Building scalable solutions with{" "}
                {cw.focus.map((f, i) => (
                  <strong key={f} className="text-blue-300 font-bold">{f}{i < cw.focus.length - 1 ? " & " : ""}</strong>
                ))}.
              </p>

              {/* Actions */}
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <button onClick={openContactModal} className="hero-cta-btn" aria-label={`Contact ${PERSONAL_INFO.fullName}`}>
                  Contact Me <IconCirclesRelation size={16} />
                </button>
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* Work highlights strip */}
          <div className="hero-work-strip">
            {cw.highlights.map((h, i) => (
              <div key={i} className="hero-work-chip">
                <span className="hero-work-chip-icon" aria-hidden="true">
                  {i === 0 ? <IconTerminal2 size={12} /> : i === 1 ? <IconBrandReactNative size={12} /> : <IconApi size={12} />}
                </span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: "⚡", value: yearsExp, label: "Exp." },
            { icon: "🚀", value: "15+", label: "Projects" },
            { icon: "🏢", value: "7+", label: "Companies" },
            { icon: "🛠️", value: "25+", label: "Tech" },
          ].map((stat, i) => (
            <article key={i} className="stat-card">
              <span className="text-base sm:text-xl mb-0.5 block" aria-hidden="true">{stat.icon}</span>
              <p className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-tight font-display">{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;