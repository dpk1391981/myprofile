"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { PERSONAL_INFO } from "../utils/portfolio-data";
import { IconX, IconMail, IconBrandLinkedin, IconBrandGithub, IconPhone, IconChevronRight } from "@tabler/icons-react";

const ContactModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeModal = () => {
    const modal = dialogRef.current;
    if (modal) {
      modal.classList.add("contact-modal--closing");
      setTimeout(() => {
        modal.close();
        modal.classList.remove("contact-modal--closing");
      }, 250);
    }
  };

  // Close on backdrop click
  useEffect(() => {
    const modal = dialogRef.current;
    if (!modal) return;
    const handler = (e: MouseEvent) => {
      const rect = modal.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) {
        closeModal();
      }
    };
    modal.addEventListener("click", handler);
    return () => modal.removeEventListener("click", handler);
  }, []);

  const contacts = [
    ...(PERSONAL_INFO.email ? [{
      href: `mailto:${PERSONAL_INFO.email}`,
      icon: <IconMail size={22} />,
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
      title: "Email",
      subtitle: PERSONAL_INFO.email,
      external: false,
    }] : []),
    ...(PERSONAL_INFO.phone ? [{
      href: `tel:${PERSONAL_INFO.phone}`,
      icon: <IconPhone size={22} />,
      iconBg: "#f0fdf4",
      iconColor: "#22c55e",
      title: "Phone",
      subtitle: PERSONAL_INFO.phone,
      external: false,
    }] : []),
    {
      href: PERSONAL_INFO.social.linkedin,
      icon: <IconBrandLinkedin size={22} />,
      iconBg: "#eff6ff",
      iconColor: "#0077b5",
      title: "LinkedIn",
      subtitle: "Connect professionally",
      external: true,
    },
    {
      href: PERSONAL_INFO.social.github,
      icon: <IconBrandGithub size={22} />,
      iconBg: "#f8fafc",
      iconColor: "#24292e",
      title: "GitHub",
      subtitle: "View repositories",
      external: true,
    },
  ];

  return (
    <dialog id="my_modal_1" ref={dialogRef} className="contact-modal">
      <div className="contact-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle (mobile) */}
        <div className="contact-modal-handle" aria-hidden="true">
          <div className="contact-modal-handle-bar" />
        </div>

        {/* Close button */}
        <button onClick={closeModal} className="contact-modal-close" aria-label="Close">
          <IconX size={20} />
        </button>

        {/* Header */}
        <div className="contact-modal-header">
          <div className="contact-modal-avatar">
            <Image
              src={PERSONAL_INFO.profileImage}
              alt={PERSONAL_INFO.fullName}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-3">
            Get in Touch
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Let&apos;s discuss your next project
          </p>
        </div>

        {/* Contact options — native list style */}
        <div className="contact-modal-list">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              className="contact-modal-item"
            >
              <div className="contact-modal-item-icon" style={{ background: c.iconBg, color: c.iconColor }}>
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500 truncate">{c.subtitle}</p>
              </div>
              <IconChevronRight size={16} className="text-slate-300 flex-shrink-0" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="contact-modal-footer">
          <a href="/joinme" onClick={closeModal} className="contact-modal-cta">
            Send a detailed inquiry →
          </a>
        </div>
      </div>
    </dialog>
  );
};

export default ContactModal;