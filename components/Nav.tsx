"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PERSONAL_INFO, NAV_LINKS, FOOTER } from "./utils/portfolio-data";
import {
  IconMenu2,
  IconX,
  IconMessage,
  IconFileDownload,
  IconMoodDollar,
  IconHome2,
  IconUserScan,
  IconBuildingBank,
  IconBallpen,
  IconChartBubble,
  IconMessageStar,
  IconChevronRight,
  IconArticle,
} from "@tabler/icons-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "/": <IconHome2 size={20} />,
  "/about": <IconUserScan size={20} />,
  "/experience": <IconBuildingBank size={20} />,
  "/education": <IconBallpen size={20} />,
  "/skills": <IconChartBubble size={20} />,
  "/reviews": <IconMessageStar size={20} />,
  "/blog": <IconArticle size={20} />,
};

const openContactModal = () => {
  const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const Nav = () => {
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpenNav(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openNav ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openNav]);

  return (
    <>
      <header
        className={`nav-header ${scrolled ? "nav-header--scrolled" : ""}`}
        id="header"
        role="banner"
      >
        <div className="nav-inner">
          {/* Logo + Name */}
          <Link href="/" className="nav-brand" aria-label="Go to homepage">
            <div className="nav-avatar">
              <Image
                src={PERSONAL_INFO.profileImage}
                alt={PERSONAL_INFO.fullName}
                width={44}
                height={44}
                loading="eager"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="nav-brand-text">
              <p className="nav-brand-name font-display">{PERSONAL_INFO.fullName}</p>
              <p className="nav-brand-tagline">My Professional Software Saga</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-desktop" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "nav-link--active" : ""}`}
              >
                {ICON_MAP[link.href]}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="nav-desktop-actions">
            <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="nav-action-btn" title="Download Resume" aria-label="Download CV">
              <IconFileDownload size={18} />
            </a>
            <button onClick={openContactModal} className="nav-action-btn" title="Contact" aria-label="Open contact">
              <IconMessage size={18} />
            </button>
            <Link href="/joinme" className={`nav-action-btn ${pathname === "/joinme" ? "nav-action-btn--active" : ""}`} title="Hire me">
              <IconMoodDollar size={18} />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="nav-mobile-actions">
            <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="nav-action-btn" aria-label="Resume">
              <IconFileDownload size={18} />
            </a>
            <button onClick={openContactModal} className="nav-action-btn" aria-label="Contact">
              <IconMessage size={18} />
            </button>
            <button onClick={() => setOpenNav(true)} className="nav-hamburger" aria-label="Open menu" aria-expanded={openNav}>
              <IconMenu2 size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ====== MOBILE FULL-SCREEN MENU ====== */}
      {/* Overlay */}
      <div className={`nav-m-overlay ${openNav ? "nav-m-overlay--open" : ""}`} onClick={() => setOpenNav(false)} aria-hidden="true" />

      {/* Full screen menu panel */}
      <div className={`nav-m-panel ${openNav ? "nav-m-panel--open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        {/* Top bar with close */}
        <div className="nav-m-topbar">
          <div className="flex items-center gap-3">
            <div className="nav-avatar nav-avatar--sm">
              <Image src={PERSONAL_INFO.profileImage} alt={PERSONAL_INFO.fullName} width={36} height={36} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 font-display">{PERSONAL_INFO.fullName}</p>
              <p className="text-[11px] text-blue-600 font-medium">{PERSONAL_INFO.title}</p>
            </div>
          </div>
          <button onClick={() => setOpenNav(false)} className="nav-m-close" aria-label="Close menu">
            <IconX size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="nav-m-links" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpenNav(false)} className={`nav-m-link ${active ? "nav-m-link--active" : ""}`}>
                <span className={`nav-m-link-icon ${active ? "nav-m-link-icon--active" : ""}`}>
                  {ICON_MAP[link.href]}
                </span>
                <span className="flex-1">{link.label}</span>
                <IconChevronRight size={16} className="text-slate-300" />
              </Link>
            );
          })}
          <Link href="/joinme" onClick={() => setOpenNav(false)} className={`nav-m-link ${pathname === "/joinme" ? "nav-m-link--active" : ""}`}>
            <span className={`nav-m-link-icon ${pathname === "/joinme" ? "nav-m-link-icon--active" : ""}`}>
              <IconMoodDollar size={20} />
            </span>
            <span className="flex-1">Join / Hire Me</span>
            <IconChevronRight size={16} className="text-slate-300" />
          </Link>
        </nav>

        {/* Bottom actions */}
        <div className="nav-m-bottom">
          <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="nav-m-bottom-btn">
            <IconFileDownload size={18} />
            <span>Download Resume</span>
          </a>
          <button onClick={() => { setOpenNav(false); setTimeout(openContactModal, 300); }} className="nav-m-bottom-btn nav-m-bottom-btn--primary">
            <IconMessage size={18} />
            <span>Contact Me</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Nav;