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
} from "@tabler/icons-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "/": <IconHome2 size={18} />,
  "/about": <IconUserScan size={18} />,
  "/experience": <IconBuildingBank size={18} />,
  "/education": <IconBallpen size={18} />,
  "/skills": <IconChartBubble size={18} />,
  "/reviews": <IconMessageStar size={18} />,
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
    <header
      className={`nav-header sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "nav-header--scrolled" : ""
      }`}
      id="header"
      role="banner"
    >
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-2.5 lg:py-0 flex items-center justify-between">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 py-1" aria-label="Go to homepage">
          <div className="nav-avatar">
            <Image
              src={PERSONAL_INFO.profileImage}
              alt={`${PERSONAL_INFO.fullName} avatar`}
              title={PERSONAL_INFO.fullName}
              width={56}
              height={56}
              loading="eager"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-bold text-slate-900 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {PERSONAL_INFO.fullName}
            </p>
            <p className="text-[11px] font-semibold text-blue-600 tracking-wide">
              My Professional Software Saga
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "nav-link--active" : ""}`}
              >
                {ICON_MAP[link.href]}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-1.5">
          <a
            href={FOOTER.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-action-btn"
            title="Download Resume"
            aria-label="Download CV Summary"
          >
            <IconFileDownload size={18} />
          </a>
          <button
            onClick={openContactModal}
            className="nav-action-btn"
            title="Contact me"
            aria-label="Open contact modal"
          >
            <IconMessage size={18} />
          </button>
          <Link href="/joinme" className={`nav-action-btn ${pathname === "/joinme" ? "nav-action-btn--active" : ""}`} title="Hire me">
            <IconMoodDollar size={18} />
          </Link>
        </div>

        {/* Mobile right side */}
        <div className="flex lg:hidden items-center gap-1">
          <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="nav-action-btn" aria-label="Download Resume">
            <IconFileDownload size={18} />
          </a>
          <button onClick={openContactModal} className="nav-action-btn" aria-label="Contact me">
            <IconMessage size={18} />
          </button>
          <button
            onClick={() => setOpenNav(!openNav)}
            className="nav-hamburger"
            aria-label="Toggle navigation menu"
            aria-expanded={openNav}
          >
            {openNav ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`nav-overlay ${openNav ? "nav-overlay--visible" : ""}`}
        onClick={() => setOpenNav(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <nav className={`nav-drawer ${openNav ? "nav-drawer--open" : ""}`} aria-label="Mobile navigation">
        <div className="p-6 pt-4">
          {/* Close button inside drawer */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Menu</span>
            <button
              onClick={() => setOpenNav(false)}
              className="nav-drawer-close"
              aria-label="Close navigation menu"
            >
              <IconX size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="nav-avatar">
              <Image
                src={PERSONAL_INFO.profileImage}
                alt={PERSONAL_INFO.fullName}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                {PERSONAL_INFO.fullName}
              </p>
              <p className="text-xs text-blue-600 font-medium">{PERSONAL_INFO.title}</p>
            </div>
          </div>

          <ul className="space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpenNav(false)}
                    className={`nav-drawer-link ${isActive ? "nav-drawer-link--active" : ""}`}
                  >
                    {ICON_MAP[link.href]}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/joinme"
                onClick={() => setOpenNav(false)}
                className={`nav-drawer-link ${pathname === "/joinme" ? "nav-drawer-link--active" : ""}`}
              >
                <IconMoodDollar size={18} />
                <span>Join / Hire Me</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Nav;