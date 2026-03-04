"use client";
import React from "react";
import { PERSONAL_INFO } from "./portfolio-data";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";

const SocialLinks = () => {
  const links = [
    {
      href: PERSONAL_INFO.social.github,
      icon: <IconBrandGithub size={22} />,
      label: "GitHub",
    },
    {
      href: PERSONAL_INFO.social.linkedin,
      icon: <IconBrandLinkedin size={22} />,
      label: "LinkedIn",
    },
    {
      href: PERSONAL_INFO.social.twitter,
      icon: <IconBrandTwitter size={22} />,
      label: "Twitter",
    },
  ];

  return (
    <nav aria-label="Social media links" className="flex items-center gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${link.label} profile`}
          className="social-link"
        >
          {link.icon}
        </a>
      ))}
    </nav>
  );
};

export default SocialLinks;