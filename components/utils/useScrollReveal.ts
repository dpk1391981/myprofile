"use client";
import { useEffect, useRef } from "react";

const REVEAL_CLASS = "is-visible";
// Safety net: never leave content hidden longer than this, even if the
// IntersectionObserver never fires (slow hydration, device quirks, etc.)
const FAILSAFE_MS = 1800;

/**
 * Adds "is-visible" when the element enters the viewport.
 * Pair with CSS class "animate-on-scroll".
 *
 * Hardened so content is NEVER permanently stuck at opacity:0:
 *  - reveals immediately if IntersectionObserver is unavailable
 *  - reveals immediately if the element is already in view on mount
 *  - a failsafe timer guarantees visibility regardless
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add(REVEAL_CLASS);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);

    const failsafe = window.setTimeout(reveal, FAILSAFE_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return ref;
}

/**
 * Observe all children with class "animate-on-scroll".
 * Same hardening as useScrollReveal.
 */
export function useScrollRevealChildren<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;

    const children = Array.from(parent.querySelectorAll<HTMLElement>(".animate-on-scroll"));
    if (children.length === 0) return;

    const revealAll = () => children.forEach((c) => c.classList.add(REVEAL_CLASS));

    if (typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(REVEAL_CLASS);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    children.forEach((child) => observer.observe(child));

    const failsafe = window.setTimeout(revealAll, FAILSAFE_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return ref;
}
