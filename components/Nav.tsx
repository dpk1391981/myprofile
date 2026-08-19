"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconMenu2, IconX, IconDownload, IconArrowRight,
  IconBrandGithub, IconBrandLinkedin, IconBrandX,
} from "@tabler/icons-react";
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
          {/* The footer's social row repeated here: on mobile the footer is a
              long scroll away, while the drawer is one tap. Closing on tap so
              the menu is not left open behind the new tab. */}
          <div className="bs-drawer-social">
            <p className="bs-eyebrow">Elsewhere</p>
            <div className="bs-socials">
              <a
                href={PERSONAL_INFO.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                onClick={() => setOpen(false)}
              >
                <IconBrandGithub size={22} />
              </a>
              <a
                href={PERSONAL_INFO.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                onClick={() => setOpen(false)}
              >
                <IconBrandLinkedin size={22} />
              </a>
              <a
                href={PERSONAL_INFO.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                onClick={() => setOpen(false)}
              >
                <IconBrandX size={22} />
              </a>
            </div>
          </div>

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
