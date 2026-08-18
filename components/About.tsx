"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import SocialLinks from "./utils/SocialLinks";
import { totalExperianceYears } from "./utils/date";
import { PERSONAL_INFO, FOOTER, getFlagshipProjects } from "./utils/portfolio-data";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconDownload,
  IconMapPin,
  IconSparkles,
  IconTerminal2,
  IconBrain,
  IconApi,
} from "@tabler/icons-react";

const openContactModal = () => {
  const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

/* Proof chips shown directly under the headline — the fastest way for a
   recruiter to decide this profile is worth reading. */
const PROOF = [
  { icon: "⚡", label: "5M+ concurrent users handled" },
  { icon: "🤖", label: "Generative AI in production" },
  { icon: "🚀", label: "2 live products of my own" },
];

const About = () => {
  const yearsExp = totalExperianceYears();
  const cw = PERSONAL_INFO.currentWork;
  const flagship = getFlagshipProjects();

  return (
    <section className="relative not-prose scroll-mt-[72px]" id="about">
      <header className="hero-banner" role="banner">
        {/* ---------- Ambient background ---------- */}
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-aurora hero-aurora--1" />
          <div className="hero-aurora hero-aurora--2" />
          <div className="hero-aurora hero-aurora--3" />
          <div className="hero-grid" />
          <div className="hero-noise" />
        </div>

        <div className="hero-inner">
          <div className="hero-layout">
            {/* ================= LEFT — the pitch ================= */}
            <div className="hero-main">
              <span className="hero-status">
                <span className="hero-status-dot" aria-hidden="true" />
                Open to Senior &amp; AI Engineering roles
              </span>

              <h1 className="hero-name font-display" title={PERSONAL_INFO.fullName}>
                {PERSONAL_INFO.fullName}
              </h1>

              <p className="hero-role font-display">
                Senior Software Engineer building{" "}
                <span className="hero-role-accent">scalable products</span> and{" "}
                <span className="hero-role-accent">AI systems</span>
              </p>

              <p className="hero-pitch">
                {yearsExp} shipping production software — MERN, Next.js and
                TypeScript on the front, Generative AI and real-time
                architecture underneath. Currently at{" "}
                <strong>{cw.company}</strong>, and building two live products of
                my own.
              </p>

              {/* ---- Proof chips ---- */}
              <ul className="hero-proof" role="list">
                {PROOF.map((p) => (
                  <li key={p.label} className="hero-proof-chip">
                    <span aria-hidden="true">{p.icon}</span>
                    {p.label}
                  </li>
                ))}
              </ul>

              {/* ---- Primary actions ---- */}
              <div className="hero-actions">
                <button
                  onClick={openContactModal}
                  className="dk-btn dk-btn--primary dk-btn--lg"
                  aria-label={`Contact ${PERSONAL_INFO.fullName}`}
                >
                  Hire Me
                  <IconArrowRight size={18} />
                </button>

                <a
                  href={FOOTER.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dk-btn dk-btn--glass dk-btn--lg"
                  aria-label="Download Deepak Kumar's resume as PDF"
                >
                  <IconDownload size={18} />
                  Download Resume
                </a>
              </div>

              {/* ---- Location + socials ---- */}
              <div className="hero-footer-row">
                <span className="hero-location">
                  <IconMapPin size={14} />
                  New Delhi, India · Remote friendly
                </span>
                <SocialLinks />
              </div>
            </div>

            {/* ================= RIGHT — the visual ================= */}
            <div className="hero-aside">
              <div className="hero-portrait">
                <div className="hero-portrait-ring" aria-hidden="true" />
                <div className="hero-portrait-img">
                  <Image
                    src={PERSONAL_INFO.profileImage}
                    alt={`${PERSONAL_INFO.fullName} — ${PERSONAL_INFO.title}`}
                    title={PERSONAL_INFO.fullName}
                    width={260}
                    height={260}
                    priority
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Floating experience badge */}
                <div className="hero-float hero-float--exp">
                  <p className="hero-float-value font-display">{yearsExp}</p>
                  <p className="hero-float-label">Experience</p>
                </div>

              </div>
            </div>
          </div>

          {/* ---------- Live products strip ---------- */}
          {flagship.length > 0 && (
            <div className="hero-products">
              <p className="hero-products-label">
                <IconSparkles size={13} />
                Live products I own
              </p>
              <div className="hero-products-list">
                {flagship.map((p) => (
                  <a
                    key={p.slug}
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-product-chip"
                  >
                    <span aria-hidden="true">{p.emoji}</span>
                    <span className="hero-product-name">{p.title}</span>
                    <span className="hero-product-tag">{p.type.split(" · ")[0]}</span>
                    <IconArrowUpRight size={14} className="opacity-60" />
                  </a>
                ))}
                <Link href="/projects" className="hero-product-chip hero-product-chip--all">
                  All projects
                  <IconArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ---------- Stats band ---------- */}
      <div className="stats-band-wrap">
        <div className="stats-band">
          {[
            { icon: "⚡", value: yearsExp, label: "Experience" },
            { icon: "🚀", value: "17+", label: "Products Shipped" },
            { icon: "🏢", value: "7+", label: "Companies" },
            { icon: "🛠️", value: "25+", label: "Technologies" },
          ].map((stat) => (
            <article key={stat.label} className="stat-tile">
              <span className="stat-tile-icon" aria-hidden="true">
                {stat.icon}
              </span>
              <p className="stat-tile-value font-display">{stat.value}</p>
              <p className="stat-tile-label">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>

      {/* ---------- Current company highlight ---------- */}
      <div className="current-band-wrap">
        <article
          className="current-band"
          itemScope
          itemType="https://schema.org/OrganizationRole"
        >
          <span className="current-band-accent" aria-hidden="true" />

          <div className="current-band-top">
            <a
              href={cw.url}
              target="_blank"
              rel="noopener noreferrer"
              className="current-band-logo"
              aria-label={`Visit ${cw.company}`}
            >
              <Image
                src={cw.logo}
                alt={`${cw.company} — where Deepak Kumar currently works`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </a>

            <div className="min-w-0 flex-1">
              <p className="current-band-label">
                <span className="current-band-dot" aria-hidden="true" />
                Currently building at
              </p>

              <h2 className="current-band-company font-display">
                <a
                  href={cw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  itemProp="url"
                >
                  <span itemProp="name">{cw.company}</span>
                  <IconArrowUpRight size={17} className="current-band-arrow" />
                </a>
              </h2>

              <p className="current-band-role" itemProp="roleName">
                {cw.role}
                <span className="current-band-sep" aria-hidden="true">·</span>
                <span className="current-band-focus">
                  {cw.focus.join(" & ")}
                </span>
              </p>
            </div>

            <span className="current-band-badge">Present</span>
          </div>

          <ul className="current-band-list" role="list">
            {cw.highlights.map((h, i) => (
              <li key={i} className="current-band-item">
                <span className="current-band-item-icon" aria-hidden="true">
                  {i === 0 ? <IconTerminal2 size={13} /> : i === 1 ? <IconBrain size={13} /> : <IconApi size={13} />}
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};

export default About;
