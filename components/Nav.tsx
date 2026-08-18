"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX, IconDownload, IconArrowRight } from "@tabler/icons-react";
import { PRIMARY_NAV } from "./utils/site-data";
import { FOOTER, PERSONAL_INFO } from "./utils/portfolio-data";
import InkToggle from "./bs/InkToggle";

const Nav = () => {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={`bs-masthead ${scrolled ? "bs-masthead--scrolled" : ""}`} role="banner">
        <div className="bs-masthead-inner">
          <Link href="/" className="bs-brand" aria-label="Deepak Kumar — home">
            {PERSONAL_INFO.fullName}
            <span className="bs-desktop-only">Sr Software Engineer</span>
          </Link>

          <nav className="bs-nav" aria-label="Main navigation">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`bs-navlink ${isActive(link.href) ? "bs-navlink--active" : ""}`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="bs-masthead-actions">
            <InkToggle />
            <a
              href={FOOTER.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="bs-btn bs-btn--solid bs-btn--sm bs-desktop-only"
            >
              <IconDownload size={15} /> Résumé
            </a>
            <button
              type="button"
              className="bs-icon-btn bs-burger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <IconMenu2 size={19} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`bs-drawer-overlay ${open ? "bs-drawer-overlay--open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`bs-drawer ${open ? "bs-drawer--open" : ""}`}
        role="dialog"
        aria-modal={open}
        aria-label="Navigation"
        aria-hidden={!open}
      >
        <div className="bs-drawer-top">
          <span style={{ fontSize: 17, fontWeight: 600 }}>{PERSONAL_INFO.fullName}</span>
          <button type="button" className="bs-icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <IconX size={19} />
          </button>
        </div>

        <nav className="bs-drawer-links" aria-label="Mobile navigation">
          <Link href="/" className={`bs-drawer-link ${pathname === "/" ? "bs-drawer-link--active" : ""}`}>
            Home <IconArrowRight size={16} />
          </Link>
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`bs-drawer-link ${isActive(link.href) ? "bs-drawer-link--active" : ""}`}
            >
              {link.label} <IconArrowRight size={16} />
            </Link>
          ))}
          <Link href="/education" className={`bs-drawer-link ${isActive("/education") ? "bs-drawer-link--active" : ""}`}>
            Education <IconArrowRight size={16} />
          </Link>
          <Link href="/reviews" className={`bs-drawer-link ${isActive("/reviews") ? "bs-drawer-link--active" : ""}`}>
            Recommendations <IconArrowRight size={16} />
          </Link>
        </nav>

        <div className="bs-drawer-bottom">
          <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="bs-btn bs-btn--outline">
            <IconDownload size={16} /> Download résumé
          </a>
          <Link href="/contact" className="bs-btn bs-btn--solid">
            Start a conversation
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Nav;
