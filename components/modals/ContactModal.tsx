"use client";
import React from "react";
import { PERSONAL_INFO } from "../utils/portfolio-data";
import { IconX, IconMail, IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";

const ContactModal = () => {
  const closeModal = () => {
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  return (
    <dialog id="my_modal_1" className="contact-modal">
      <div className="contact-modal-content">
        {/* Close */}
        <button
          onClick={closeModal}
          className="contact-modal-close"
          aria-label="Close contact dialog"
        >
          <IconX size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
            aria-hidden="true"
          >
            {PERSONAL_INFO.avatarInitials}
          </div>
          <h3
            className="text-xl font-bold text-slate-900 font-display"
           
          >
            Get in Touch
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Let&apos;s discuss your next project
          </p>
        </div>

        {/* Contact options */}
        <div className="space-y-3 mb-6">
          {PERSONAL_INFO.email && (
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="contact-option-card"
            >
              <div className="contact-option-icon" style={{ background: "#fef2f2", color: "#ef4444" }}>
                <IconMail size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Email</p>
                <p className="text-xs text-slate-500">{PERSONAL_INFO.email}</p>
              </div>
            </a>
          )}
          <a
            href={PERSONAL_INFO.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-option-card"
          >
            <div className="contact-option-icon" style={{ background: "#eff6ff", color: "#0077b5" }}>
              <IconBrandLinkedin size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">LinkedIn</p>
              <p className="text-xs text-slate-500">Connect on LinkedIn</p>
            </div>
          </a>
          <a
            href={PERSONAL_INFO.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-option-card"
          >
            <div className="contact-option-icon" style={{ background: "#f8fafc", color: "#333" }}>
              <IconBrandGithub size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">GitHub</p>
              <p className="text-xs text-slate-500">View my repositories</p>
            </div>
          </a>
        </div>

        {/* Or hire CTA */}
        <a
          href="/joinme"
          onClick={closeModal}
          className="contact-hire-btn"
        >
          Send a detailed inquiry →
        </a>
      </div>
    </dialog>
  );
};

export default ContactModal;