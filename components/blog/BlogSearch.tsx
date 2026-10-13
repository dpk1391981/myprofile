"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";
import { MAX_QUERY_LENGTH } from "@/components/utils/blog-search";
import BlogSearchSheet from "@/components/blog/BlogSearchSheet";

/**
 * The index search box.
 *
 * It is a plain GET form to /blog, so it works with JavaScript off and every
 * search is a real, shareable URL. With JavaScript, typing updates the results
 * in place: the URL is replaced after a pause in typing, and the server
 * re-renders the list from its cached copy of the posts — no extra request
 * reaches the agent service, however fast someone types.
 *
 *   DEBOUNCE_MS   Long enough that a word typed at normal speed is one render,
 *                 short enough to still feel live.
 *   router.replace, not push: forty keystrokes should not be forty Back presses.
 */
const DEBOUNCE_MS = 300;

export default function BlogSearch({
  initialQuery = "", topic = "", suggestions = [],
}: {
  initialQuery?: string;
  topic?: string;
  /** Topic names the mobile sheet offers before anything is typed. */
  suggestions?: string[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const lastSent = useRef(initialQuery.trim());
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Back/forward or a topic link changes the query under us — follow it. The
  // echo of our own replace() is skipped: by the time the server answers, the
  // reader may have typed more, and resetting the box would eat those keys.
  useEffect(() => {
    if (initialQuery.trim() === lastSent.current) return;
    setValue(initialQuery);
    lastSent.current = initialQuery.trim();
  }, [initialQuery]);

  function navigate(q: string) {
    const trimmed = q.trim();
    if (trimmed === lastSent.current) return;
    lastSent.current = trimmed;

    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    // Always back to page 1: page 4 of the old results is not page 4 of these.
    startTransition(() => {
      router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    });
  }

  useEffect(() => {
    const t = setTimeout(() => navigate(value), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // "/" focuses the box from anywhere on the page, as on most search-heavy
  // sites — unless the reader is already typing into something.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <form
      ref={formRef}
      action="/blog"
      method="get"
      role="search"
      className="blog-search"
      data-pending={pending || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(value);
      }}
    >
      <label htmlFor="blog-search-input" className="bs-eyebrow">Search the archive</label>
      <div className="blog-search-field">
        <IconSearch size={16} aria-hidden="true" className="blog-search-icon" />
        <input
          ref={inputRef}
          id="blog-search-input"
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) { e.preventDefault(); setValue(""); }
          }}
          placeholder="React, RAG, Kubernetes, system design…"
          maxLength={MAX_QUERY_LENGTH}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {topic && <input type="hidden" name="topic" value={topic} />}
        {value && (
          <button type="button" className="blog-search-clear" aria-label="Clear search"
            onClick={() => setValue("")}>
            <IconX size={15} />
          </button>
        )}
      </div>
      {/* Announces the result change to screen readers; the count itself is
          rendered by the server alongside the list. */}
      <span className="sr-only" aria-live="polite">{pending ? "Searching…" : ""}</span>
    </form>
    <BlogSearchSheet anchor={formRef} suggestions={suggestions} />
    </>
  );
}
