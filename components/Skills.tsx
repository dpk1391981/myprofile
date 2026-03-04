"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { SKILLS_CATEGORIES, SKILL_TAGS } from "./utils/portfolio-data";
import { useScrollRevealChildren } from "./utils/useScrollReveal";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/* ---- Skill chip ---- */
const SkillChip = ({ name, level }: { name: string; level: number }) => {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="skill-chip">
      <div className="skill-chip-bar"><div className="skill-chip-bar-fill" style={{ width: animate ? `${level}%` : "0%" }} /></div>
      <span className="skill-chip-name">{name}</span>
      <span className="skill-chip-level">{level}</span>
    </div>
  );
};

/* ---- Scrollable row with arrow buttons ---- */
const ScrollableRow = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [checkScroll]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="scroll-row-wrapper">
      {/* Left arrow */}
      {canLeft && (
        <button className="scroll-arrow scroll-arrow--left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <IconChevronLeft size={16} />
        </button>
      )}

      <div className="skill-scroll-container" ref={scrollRef}>
        <div className="skill-scroll-track">{children}</div>
      </div>

      {/* Right arrow */}
      {canRight && (
        <button className="scroll-arrow scroll-arrow--right" onClick={() => scroll(1)} aria-label="Scroll right">
          <IconChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

/* ---- Skills Section ---- */
const Skills = () => {
  const sectionRef = useScrollRevealChildren<HTMLDivElement>();

  return (
    <section className="relative not-prose scroll-mt-[72px] py-10 md:py-14" id="skills">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <header className="section-header mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">What I Work With</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Technical Skills
          </h2>
        </header>

        <div ref={sectionRef} className="space-y-3 mb-8 stagger-children">
          {SKILLS_CATEGORIES.map((cat, ci) => (
            <div key={cat.category} className="skill-category-row animate-on-scroll" style={{ transitionDelay: `${ci * 0.06}s` }}>
              <div className="skill-category-header">
                <span className="skill-category-emoji" aria-hidden="true">{cat.icon}</span>
                <h3 className="skill-category-title">{cat.category}</h3>
                <span className="skill-category-count">{cat.items.length}</span>
              </div>
              <ScrollableRow>
                {cat.items.map((skill) => (
                  <SkillChip key={skill.name} name={skill.name} level={skill.level} />
                ))}
              </ScrollableRow>
            </div>
          ))}
        </div>

        {/* All technologies ribbon */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">All Technologies</h3>
          <ScrollableRow>
            {SKILL_TAGS.map((tag) => (
              <span key={tag} className="skill-cloud-tag">{tag}</span>
            ))}
          </ScrollableRow>
        </div>
      </div>
    </section>
  );
};

export default Skills;