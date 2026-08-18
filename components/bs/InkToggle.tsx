"use client";
import { useEffect, useState } from "react";
import { IconMoonStars, IconSun } from "@tabler/icons-react";

/** Light / dark switch — writes the choice to localStorage. */
export default function InkToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-ink") === "dark");
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.setAttribute("data-ink", "dark");
    else root.removeAttribute("data-ink");
    try {
      localStorage.setItem("bs-ink", next ? "dark" : "light");
    } catch {
      /* storage blocked — the toggle still works for this session */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`bs-icon-btn ${className}`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {ready && dark ? <IconSun size={17} /> : <IconMoonStars size={17} />}
    </button>
  );
}
