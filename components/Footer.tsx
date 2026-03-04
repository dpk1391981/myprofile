"use client";
import React from "react";
import SocialLinks from "./utils/SocialLinks";
import { PERSONAL_INFO, FOOTER } from "./utils/portfolio-data";

const Footer = () => {
  return (
    <footer className="footer-section" role="contentinfo">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 text-center">
        {/* Tagline */}
        <p
          className="text-base md:text-lg font-semibold text-slate-700 mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {FOOTER.tagline}
        </p>
        <p className="text-sm text-slate-500 mb-6">
          {PERSONAL_INFO.fullName} — {PERSONAL_INFO.title}
        </p>

        {/* Social */}
        <nav aria-label="Footer social links" className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <SocialLinks />
          </div>
        </nav>

        {/* Divider */}
        <div className="w-16 h-px bg-slate-200 mx-auto mb-5" aria-hidden="true" />

        {/* Copyright */}
        <p className="text-xs text-slate-400">
          {FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;