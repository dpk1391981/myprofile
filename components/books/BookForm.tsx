"use client";

/**
 * The brief.
 *
 * This form IS the instruction the agent writes from — there is no other input.
 * Field order follows how much each one changes the output, not how obvious it
 * is: `audience`, `level` and `mustCover` move the result far more than the
 * title does, so they are not buried at the bottom.
 *
 * The hint text under each field is doing real work. A brief that says
 * "developers" produces a book for nobody; one that says "backend developers
 * who use JS daily but have never read the spec" produces a book with a point
 * of view. The hints exist to push toward the second kind.
 */

import { useState } from "react";
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

export type BookBriefValues = {
  title: string;
  subtitle: string;
  description: string;
  topic: string;
  audience: string;
  level: string;
  language: string;
  tone: string;
  code_language: string;
  outcomes: string[];
  prerequisites: string;
  must_cover: string;
  avoid: string;
  author_name: string;
  target_chapters: number;
  target_words: number;
  cover_emoji: string;
  access: string;
  seo_title: string;
  seo_description: string;
  ai_disclosure: string;
};

export const EMPTY_BRIEF: BookBriefValues = {
  title: "",
  subtitle: "",
  description: "",
  topic: "",
  audience: "",
  level: "intermediate",
  language: "en",
  tone: "clear, direct, practical",
  code_language: "javascript",
  outcomes: [],
  prerequisites: "",
  must_cover: "",
  avoid: "",
  author_name: "Deepak Kumar",
  target_chapters: 12,
  target_words: 35000,
  cover_emoji: "📘",
  access: "email",
  seo_title: "",
  seo_description: "",
  ai_disclosure: "ai-generated",
};

const WORDS_PER_PAGE = 350; // must match WORDS_PER_PAGE in agents/book_author.py

// Mirrors MIN_BOOK_PAGES / MAX_BOOK_PAGES in agents/book_author.py. The server
// enforces both — this is here so the number is visible while you type rather
// than arriving as a rejection after you press save.
const MIN_PAGES = 20;
const MAX_PAGES = 600;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 " +
  "focus:ring-blue-500";

export default function BookForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: BookBriefValues;
  submitLabel: string;
  onSubmit: (values: BookBriefValues) => Promise<void>;
}) {
  const [v, setV] = useState<BookBriefValues>(initial);
  const [outcomesText, setOutcomesText] = useState(initial.outcomes.join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof BookBriefValues>(k: K, val: BookBriefValues[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const pages = Math.round(v.target_words / WORDS_PER_PAGE);
  const wordsPerChapter = Math.round(v.target_words / Math.max(1, v.target_chapters));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (v.title.trim().length < 3) {
      setError("Give the book a title first.");
      return;
    }
    if (pages < MIN_PAGES) {
      setError(
        `A book needs at least ${MIN_PAGES} pages (${(MIN_PAGES * WORDS_PER_PAGE).toLocaleString()} words). ` +
        `${pages} pages is a long article, and it will be refused at publish.`
      );
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...v,
        outcomes: outcomesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── What the book is ─────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          What the book is
        </h2>

        <Field label="Title" hint="Specific beats broad. “JavaScript Core” competes with every free resource; “JavaScript Core: What the Spec Actually Says” does not.">
          <input className={input} value={v.title} onChange={(e) => set("title", e.target.value)}
                 placeholder="JavaScript Core" required />
        </Field>

        <Field label="Subtitle">
          <input className={input} value={v.subtitle} onChange={(e) => set("subtitle", e.target.value)}
                 placeholder="The mechanisms behind the language you use every day" />
        </Field>

        <Field label="Topic" hint="What the book actually covers, in a sentence. Leave blank to use the title.">
          <input className={input} value={v.topic} onChange={(e) => set("topic", e.target.value)} />
        </Field>

        <Field label="Description" hint="Shown on the public book page.">
          <textarea className={input} rows={3} value={v.description}
                    onChange={(e) => set("description", e.target.value)} />
        </Field>
      </section>

      {/* ── Who it is for — the highest-leverage section ──────────────────── */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Who it is for
        </h2>
        <p className="-mt-2 text-xs text-slate-500">
          These three fields change the output more than everything else on this page combined.
        </p>

        <Field label="Reader" hint="Be uncomfortably specific. “Developers” produces a book for nobody.">
          <input className={input} value={v.audience} onChange={(e) => set("audience", e.target.value)}
                 placeholder="Backend developers who write JS daily but have never read the spec" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Level" hint="Decides how much the writer may assume.">
            <select className={input} value={v.level} onChange={(e) => set("level", e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="mixed">Mixed</option>
            </select>
          </Field>

          <Field label="Code examples" hint="Empty = not a programming book; the code checker is skipped.">
            <select className={input} value={v.code_language}
                    onChange={(e) => set("code_language", e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="">None — not a programming book</option>
            </select>
          </Field>
        </div>

        <Field label="Reader already knows" hint="What you will not re-teach. Everything here is assumed.">
          <textarea className={input} rows={2} value={v.prerequisites}
                    onChange={(e) => set("prerequisites", e.target.value)}
                    placeholder="Variables, functions, basic DOM. Has shipped something." />
        </Field>

        <Field label="After finishing, the reader can…" hint="One per line. Every chapter gets mapped onto one of these — it is what stops a table of contents that wanders.">
          <textarea className={input} rows={4} value={outcomesText}
                    onChange={(e) => setOutcomesText(e.target.value)}
                    placeholder={"Predict what `this` resolves to without running the code\nDebug a closure leak from a heap snapshot"} />
        </Field>
      </section>

      {/* ── Content control ──────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Content control
        </h2>

        <Field label="Must cover" hint="One per line. These become required chapters in the outline.">
          <textarea className={input} rows={4} value={v.must_cover}
                    onChange={(e) => set("must_cover", e.target.value)}
                    placeholder={"The event loop, microtasks vs macrotasks\nPrototype chain and how class desugars"} />
        </Field>

        <Field label="Do not cover" hint="One per line. Injected into every chapter prompt as a hard exclusion.">
          <textarea className={input} rows={3} value={v.avoid}
                    onChange={(e) => set("avoid", e.target.value)}
                    placeholder={"Framework-specific advice\nAnything about jQuery"} />
        </Field>

        <Field label="Tone">
          <input className={input} value={v.tone} onChange={(e) => set("tone", e.target.value)} />
        </Field>
      </section>

      {/* ── Length ───────────────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Length</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Chapters">
            <input type="number" min={1} max={40} className={input} value={v.target_chapters}
                   onChange={(e) => set("target_chapters", Number(e.target.value) || 1)} />
          </Field>
          <Field label="Total words">
            <input type="number" min={MIN_PAGES * WORDS_PER_PAGE} max={MAX_PAGES * WORDS_PER_PAGE}
                   step={1000} className={input}
                   value={v.target_words}
                   onChange={(e) => set("target_words", Number(e.target.value) || 2000)} />
          </Field>
        </div>

        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          ≈ <strong className="text-slate-900">{pages} printed pages</strong>, about{" "}
          <strong className="text-slate-900">{wordsPerChapter.toLocaleString()} words</strong> per
          chapter.
          {wordsPerChapter > 5000 && (
            <span className="mt-1 block text-amber-700">
              Chapters over ~5,000 words tend to get truncated. Add more chapters instead.
            </span>
          )}
          {wordsPerChapter < 900 && (
            <span className="mt-1 block text-amber-700">
              Under ~900 words a chapter reads as a blog post. Use fewer chapters.
            </span>
          )}
          {pages < MIN_PAGES && (
            <span className="mt-1 block font-medium text-red-700">
              Below the {MIN_PAGES}-page minimum. A book this short cannot be published —
              it reads as an article, and stores pull titles for it.
            </span>
          )}
          {pages > MAX_PAGES && (
            <span className="mt-1 block font-medium text-red-700">
              Over the {MAX_PAGES}-page ceiling. If that was not a typo, raise
              BOOKS_MAX_PAGES on the server.
            </span>
          )}
        </p>
      </section>

      {/* ── Publishing ───────────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Publishing
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Author name">
            <input className={input} value={v.author_name}
                   onChange={(e) => set("author_name", e.target.value)} />
          </Field>
          <Field label="Cover emoji">
            <input className={input} value={v.cover_emoji} maxLength={8}
                   onChange={(e) => set("cover_emoji", e.target.value)} />
          </Field>
        </div>

        <Field label="Access" hint="Email gate builds the list. That list is the actual asset — the book is what buys it.">
          <select className={input} value={v.access} onChange={(e) => set("access", e.target.value)}>
            <option value="email">Free, email required</option>
            <option value="public">Free, no email</option>
          </select>
        </Field>

        {/* Compliance, not preference — see the column note in books_schema.sql */}
        <Field
          label="AI disclosure"
          hint="Amazon KDP requires this at upload. A book this agent writes is “AI-generated”, and stays that way after you edit it — editing changes quality, not authorship. Declaring otherwise risks the whole publishing account."
        >
          <select className={input} value={v.ai_disclosure}
                  onChange={(e) => set("ai_disclosure", e.target.value)}>
            <option value="ai-generated">AI-generated (correct for this agent)</option>
            <option value="ai-assisted">AI-assisted — only if a human wrote the draft</option>
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO title" hint="Leave blank to use the book title.">
            <input className={input} value={v.seo_title}
                   onChange={(e) => set("seo_title", e.target.value)} />
          </Field>
          <Field label="SEO description">
            <input className={input} value={v.seo_description}
                   onChange={(e) => set("seo_description", e.target.value)} />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {saving && <IconLoader2 size={16} className="animate-spin" />}
          {saving ? "Saving…" : submitLabel}
        </button>
        <span className="text-xs text-slate-500">
          Saving only stores the brief. Nothing is generated until you say so.
        </span>
      </div>
    </form>
  );
}
