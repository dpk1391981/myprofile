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
 *
 * Two halves, and the readiness card says which is which:
 *   - WRITER fields (reader, angle, experience, sources…) go into every prompt.
 *   - STORE fields (keywords, categories, copyright, series…) go into the EPUB
 *     and the store listings. Their limits are the stores' own — KDP rejects a
 *     title+subtitle over 200 characters and a keyword over 50 at upload, so the
 *     counters stop that here instead.
 */

import { useEffect, useMemo, useState } from "react";
import {
  IconLoader2, IconAlertTriangle, IconCircleCheck, IconCircleDashed, IconDeviceFloppy,
} from "@tabler/icons-react";

export type BookBriefValues = {
  title: string;
  subtitle: string;
  description: string;
  topic: string;
  tech_version: string;
  audience: string;
  level: string;
  language: string;
  tone: string;
  code_language: string;
  outcomes: string[];
  prerequisites: string;
  angle: string;
  running_example: string;
  author_experience: string;
  must_cover: string;
  avoid: string;
  reference_urls: string;
  comparable_titles: string;
  author_name: string;
  author_bio: string;
  target_chapters: number;
  target_words: number;
  cover_emoji: string;
  access: string;
  list_price_paise: number;
  price_label: string;
  currency: string;
  seo_title: string;
  seo_description: string;
  ai_disclosure: string;
  kdp_description: string;
  kdp_keywords: string[];
  kdp_categories: string[];
  isbn: string;
  series_name: string;
  series_number: number;
  edition: string;
  publisher: string;
  publication_date: string;
  copyright_holder: string;
  trim_size: string;
};

export const EMPTY_BRIEF: BookBriefValues = {
  title: "",
  subtitle: "",
  description: "",
  topic: "",
  tech_version: "",
  audience: "",
  level: "intermediate",
  language: "en",
  tone: "clear, direct, practical",
  code_language: "javascript",
  outcomes: [],
  prerequisites: "",
  angle: "",
  running_example: "",
  author_experience: "",
  must_cover: "",
  avoid: "",
  reference_urls: "",
  comparable_titles: "",
  author_name: "Deepak Kumar",
  // From the public portfolio (components/utils/portfolio-data.ts) — the same
  // facts portfolio_content.AUTHOR_BACKGROUND gives the blog writer. Real and
  // checkable only: the agent is forbidden from adding to it. Edit per book.
  author_bio:
    "Deepak Kumar is a Senior Software Engineer at India Today Group (Aaj Tak), where he " +
    "builds MERN-stack and Generative AI features for the newsroom's digital and editorial " +
    "platforms: editorial tools, AI article summaries, intelligent search, election-results " +
    "dashboards and video CMS components. Before that he spent years at Instant Systems " +
    "building client products, including a patient relationship management system for Clove " +
    "Dental as module lead. He also runs his own products end to end, among them PlanToday.in " +
    "and TrendMeToday.com. He works across React, Next.js, Node.js, TypeScript, MongoDB and " +
    "AWS, and writes at officialdeepak.in.",
  target_chapters: 12,
  target_words: 35000,
  cover_emoji: "📘",
  access: "email",
  list_price_paise: 0,
  price_label: "",
  currency: "INR",
  seo_title: "",
  seo_description: "",
  ai_disclosure: "ai-generated",
  kdp_description: "",
  kdp_keywords: [],
  kdp_categories: [],
  isbn: "",
  series_name: "",
  series_number: 0,
  edition: "",
  publisher: "",
  publication_date: "",
  copyright_holder: "",
  trim_size: "6x9",
};

const WORDS_PER_PAGE = 350; // must match WORDS_PER_PAGE in agents/book_author.py

// Mirrors MIN_BOOK_PAGES / MAX_BOOK_PAGES in agents/book_author.py. The server
// enforces both — this is here so the number is visible while you type rather
// than arriving as a rejection after you press save.
const MIN_PAGES = 20;
const MAX_PAGES = 600;

// Store limits. KDP: title + subtitle 200 combined, description 4000,
// 7 keyword boxes of 50 characters each, 3 categories.
const TITLE_SUBTITLE_MAX = 200;
const STORE_DESC_MAX = 4000;
const KEYWORD_SLOTS = 7;
const KEYWORD_MAX = 50;
const CATEGORY_SLOTS = 3;
const MAX_REFERENCE_URLS = 12; // MAX_REFERENCE_URLS in agents/book_author.py

const TONE_PRESETS = [
  "clear, direct, practical",
  "opinionated senior engineer — states trade-offs and picks one",
  "patient mentor — explains why before how",
  "dense reference — minimal narrative, maximum precision",
];

const STEPS = [
  { id: "book", label: "The book" },
  { id: "reader", label: "Reader" },
  { id: "substance", label: "Substance & accuracy" },
  { id: "length", label: "Length" },
  { id: "author", label: "Author" },
  { id: "store", label: "Store listing" },
  { id: "website", label: "Website" },
] as const;

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const wordsIn = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  counter?: { value: number; max: number; min?: number; unit?: string };
  children: React.ReactNode;
}) {
  const over = counter && counter.value > counter.max;
  const under = counter?.min !== undefined && counter.value > 0 && counter.value < counter.min;
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {counter && (
          <span className={`text-[11px] tabular-nums ${over ? "font-semibold text-red-600" : under ? "text-amber-600" : "text-slate-400"}`}>
            {counter.value.toLocaleString()} / {counter.max.toLocaleString()} {counter.unit ?? "chars"}
          </span>
        )}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs leading-relaxed text-slate-500">{hint}</span>}
    </label>
  );
}

function Section({
  id, step, title, intro, children,
}: {
  id: string; step: number; title: string; intro?: string; children: React.ReactNode;
}) {
  return (
    <section id={`brief-${id}`} className="scroll-mt-20 space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-600">
            {step}
          </span>
          {title}
        </h2>
        {intro && <p className="mt-1 text-xs leading-relaxed text-slate-500">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

/** N fixed slots, for lists where the store has a fixed number of boxes. */
function Slots({
  values, count, max, placeholder, onChange,
}: {
  values: string[]; count: number; max?: number; placeholder: (i: number) => string;
  onChange: (next: string[]) => void;
}) {
  const padded = Array.from({ length: count }, (_, i) => values[i] ?? "");
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {padded.map((val, i) => (
        <div key={i} className="relative">
          <input
            className={`${input} pr-12 ${max && val.length > max ? "border-red-400" : ""}`}
            value={val}
            placeholder={placeholder(i)}
            onChange={(e) => {
              const next = [...padded];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          {max && (
            <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums ${val.length > max ? "text-red-600" : "text-slate-400"}`}>
              {val.length}/{max}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 " +
  "focus:ring-blue-500";

type Check = { label: string; ok: boolean; step: string; required?: boolean };

export default function BookForm({
  initial,
  submitLabel,
  onSubmit,
  hasCover,
  coverSlot,
}: {
  initial: BookBriefValues;
  submitLabel: string;
  onSubmit: (values: BookBriefValues) => Promise<void>;
  /** undefined on the new-book page, where no cover can exist yet. */
  hasCover?: boolean;
  /** The uploader, rendered inside the store section (needs a saved book). */
  coverSlot?: React.ReactNode;
}) {
  const [v, setV] = useState<BookBriefValues>(initial);
  const [outcomesText, setOutcomesText] = useState(initial.outcomes.join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({ ...initial, outcomes: initial.outcomes.join("\n") }));

  const set = <K extends keyof BookBriefValues>(k: K, val: BookBriefValues[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const dirty = JSON.stringify({ ...v, outcomes: outcomesText }) !== savedSnapshot;

  // Losing a half-written brief to a stray tab close is the one thing on this
  // page that cannot be recovered, so warn while there are unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pages = Math.round(v.target_words / WORDS_PER_PAGE);
  const wordsPerChapter = Math.round(v.target_words / Math.max(1, v.target_chapters));
  const titleLen = v.title.trim().length + (v.subtitle.trim() ? v.subtitle.trim().length + 2 : 0);
  const refCount = lines(v.reference_urls).length;
  const badRefs = lines(v.reference_urls).filter((u) => !/^https?:\/\/\S+$/i.test(u));
  const keywords = v.kdp_keywords.map((k) => k.trim()).filter(Boolean);
  const categories = v.kdp_categories.map((c) => c.trim()).filter(Boolean);
  const outcomes = lines(outcomesText);

  const checks: { writer: Check[]; store: Check[] } = useMemo(() => ({
    writer: [
      { label: "Specific reader (not just “developers”)", ok: wordsIn(v.audience) >= 6, step: "reader", required: true },
      { label: "3+ outcomes the reader can do afterwards", ok: outcomes.length >= 3, step: "reader", required: true },
      { label: "The book's angle vs. free docs", ok: wordsIn(v.angle) >= 12, step: "substance" },
      { label: "Reference sources for accuracy", ok: refCount > 0 && badRefs.length === 0, step: "substance" },
      { label: "Version pinned", ok: !!v.tech_version.trim() || !v.code_language, step: "book" },
      { label: "Your own experience (real anecdotes)", ok: lines(v.author_experience).length >= 2, step: "substance" },
      { label: "Must-cover topics", ok: lines(v.must_cover).length >= 3, step: "substance" },
    ],
    store: [
      { label: `Title + subtitle ≤ ${TITLE_SUBTITLE_MAX} chars`, ok: titleLen > 2 && titleLen <= TITLE_SUBTITLE_MAX, step: "book", required: true },
      { label: "Author bio (facts only)", ok: wordsIn(v.author_bio) >= 25, step: "author" },
      { label: "Store description 150+ words", ok: wordsIn(v.kdp_description) >= 150 && v.kdp_description.length <= STORE_DESC_MAX, step: "store" },
      { label: `${KEYWORD_SLOTS} keywords, ≤ ${KEYWORD_MAX} chars each`, ok: keywords.length === KEYWORD_SLOTS && keywords.every((k) => k.length <= KEYWORD_MAX), step: "store" },
      { label: `${CATEGORY_SLOTS} categories`, ok: categories.length === CATEGORY_SLOTS, step: "store" },
      { label: "Copyright holder + publication date", ok: !!v.publication_date && !!(v.copyright_holder.trim() || v.author_name.trim()), step: "store" },
      ...(hasCover === undefined ? [] : [{ label: "Cover uploaded (1600×2560)", ok: hasCover, step: "store" }]),
      { label: "AI disclosure set", ok: !!v.ai_disclosure, step: "store", required: true },
    ],
  }), [v, outcomes.length, refCount, badRefs.length, titleLen, keywords, categories, hasCover]);

  const allChecks = [...checks.writer, ...checks.store];
  const done = allChecks.filter((c) => c.ok).length;
  const stepOk = (step: string) => allChecks.filter((c) => c.step === step).every((c) => c.ok);

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
    if (badRefs.length) {
      setError(`Reference URLs must be full links, one per line. Not a URL: “${badRefs[0]}”`);
      return;
    }
    if (refCount > MAX_REFERENCE_URLS) {
      setError(`At most ${MAX_REFERENCE_URLS} reference URLs — keep the ones closest to the book.`);
      return;
    }
    if (keywords.some((k) => k.length > KEYWORD_MAX)) {
      setError(`Each store keyword must be ${KEYWORD_MAX} characters or fewer.`);
      return;
    }
    if (v.kdp_description.length > STORE_DESC_MAX) {
      setError(`Store description is over ${STORE_DESC_MAX.toLocaleString()} characters.`);
      return;
    }
    setSaving(true);
    try {
      const values: BookBriefValues = {
        ...v,
        outcomes,
        kdp_keywords: keywords,
        kdp_categories: categories,
      };
      await onSubmit(values);
      setSavedSnapshot(JSON.stringify({ ...v, outcomes: outcomesText }));
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}
          className="xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start xl:gap-6">
      {/* ── Readiness rail — right on wide screens, a collapsible card above ── */}
      <aside className="mb-6 xl:order-2 xl:mb-0 xl:sticky xl:top-4">
        <details open className="group rounded-xl border border-slate-200 bg-white xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 xl:cursor-default">
            <span className="text-sm font-semibold text-slate-900">Readiness</span>
            <span className="text-xs tabular-nums text-slate-500">{done}/{allChecks.length}</span>
          </summary>
          <div className="px-4 pb-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all"
                   style={{ width: `${Math.round((done / allChecks.length) * 100)}%` }} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {([["Ready to write", checks.writer, "Changes what the agent writes."],
                 ["Ready to sell", checks.store, "KDP, Google Play, Gumroad."]] as const).map(
                ([title, list, sub]) => (
                  <div key={title}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {title}{" "}
                      <span className="font-normal normal-case tabular-nums text-slate-400">
                        {list.filter((c) => c.ok).length}/{list.length}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">{sub}</p>
                    <ul className="mt-1.5 space-y-1">
                      {list.map((c) => (
                        <li key={c.label}>
                          <a href={`#brief-${c.step}`}
                             className="flex items-start gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-slate-50">
                            {c.ok
                              ? <IconCircleCheck size={14} className="mt-px shrink-0 text-emerald-600" />
                              : <IconCircleDashed size={14} className={`mt-px shrink-0 ${c.required ? "text-red-500" : "text-amber-500"}`} />}
                            <span className={c.ok ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"}>
                              {c.label}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

            <nav className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</p>
              <ol className="grid grid-cols-2 gap-x-2 xl:grid-cols-1">
                {STEPS.map((st, i) => (
                  <li key={st.id}>
                    <a href={`#brief-${st.id}`}
                       className="flex items-center gap-1.5 rounded px-1 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      {stepOk(st.id)
                        ? <IconCircleCheck size={14} className="shrink-0 text-emerald-600" />
                        : <IconCircleDashed size={14} className="shrink-0 text-slate-300" />}
                      {i + 1}. {st.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </details>
      </aside>

      <div className="min-w-0 space-y-6 xl:order-1">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── 1. The book ───────────────────────────────────────────────── */}
        <Section id="book" step={1} title="The book">
          <Field label="Title"
                 counter={{ value: titleLen, max: TITLE_SUBTITLE_MAX, unit: "chars with subtitle" }}
                 hint="Specific beats broad. “JavaScript Core” competes with every free resource; “JavaScript Core: What the Spec Actually Says” does not. Stores reject a title stuffed with keywords — say what the book is.">
            <input className={input} value={v.title} onChange={(e) => set("title", e.target.value)}
                   placeholder="JavaScript Core" required />
          </Field>

          <Field label="Subtitle" hint="Where the search words go, naturally phrased. Counts toward the 200.">
            <input className={input} value={v.subtitle} onChange={(e) => set("subtitle", e.target.value)}
                   placeholder="The mechanisms behind the language you use every day" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Topic" hint="What the book actually covers, in a sentence. Blank = the title.">
              <input className={input} value={v.topic} onChange={(e) => set("topic", e.target.value)} />
            </Field>
            <Field label="Version it is written against"
                   hint="Every statement must be true of exactly this. Printed on the copyright page.">
              <input className={input} value={v.tech_version}
                     onChange={(e) => set("tech_version", e.target.value)}
                     placeholder="Next.js 16.4, React 19.3" />
            </Field>
          </div>

          <Field label="Description" counter={{ value: v.description.length, max: 4000 }}
                 hint="Shown on the public book page on this site.">
            <textarea className={input} rows={4} value={v.description}
                      onChange={(e) => set("description", e.target.value)} />
          </Field>
        </Section>

        {/* ── 2. Reader — the highest-leverage section ─────────────────── */}
        <Section id="reader" step={2} title="Who it is for"
                 intro="These fields change the output more than everything else on this page combined.">
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

            <Field label="Code examples" hint="None = not a programming book; the code checker is skipped.">
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

          <Field label="After finishing, the reader can…"
                 hint={<>One per line, aim for 4–8. Every chapter gets mapped onto one of these — it is what stops a table of contents that wanders. <span className="tabular-nums">({outcomes.length} so far)</span></>}>
            <textarea className={input} rows={4} value={outcomesText}
                      onChange={(e) => setOutcomesText(e.target.value)}
                      placeholder={"Predict what `this` resolves to without running the code\nDebug a closure leak from a heap snapshot"} />
          </Field>
        </Section>

        {/* ── 3. Substance & accuracy ──────────────────────────────────── */}
        <Section id="substance" step={3} title="Substance & accuracy"
                 intro="What separates a book worth paying for from a summary of the docs — and what keeps it from saying things that are not true.">
          <Field label="The angle — why this book and not the free docs?"
                 hint="One or two sentences. Every chapter is told to earn this.">
            <textarea className={input} rows={2} value={v.angle}
                      onChange={(e) => set("angle", e.target.value)}
                      placeholder="The docs say what each API does; this book says which one to reach for, what it costs in production, and how it fails." />
          </Field>

          <Field label="Running example"
                 hint="One project built up across the book instead of a new toy example every chapter. Readers finish with something real.">
            <textarea className={input} rows={2} value={v.running_example}
                      onChange={(e) => set("running_example", e.target.value)}
                      placeholder="A multi-tenant SaaS dashboard: auth, per-tenant caching, streaming reports, background revalidation." />
          </Field>

          <Field label="Your real experience"
                 hint="One per line: incidents, numbers, decisions you actually made. The writer may use ONLY these as first-person stories and is told never to invent others — this is what makes it read like an author, honestly.">
            <textarea className={input} rows={4} value={v.author_experience}
                      onChange={(e) => set("author_experience", e.target.value)}
                      placeholder={"Moved a 40-route app to the App Router; TTFB went from 900ms to 220ms\nA stale cache served the wrong tenant's data for 6 minutes — why tag scoping matters"} />
          </Field>

          <Field label="Reference URLs"
                 counter={{ value: refCount, max: MAX_REFERENCE_URLS, unit: "URLs" }}
                 hint="One per line: release notes, docs pages, RFCs. The agent fetches each, writes every section from the passages that match it, then fact-checks each chapter against them — a chapter that contradicts a source is flagged and cannot be exported until you review it. Essential for anything newer than the model.">
            <textarea className={`${input} font-mono text-xs`} rows={4} value={v.reference_urls}
                      onChange={(e) => set("reference_urls", e.target.value)}
                      placeholder={"https://nextjs.org/blog/next-16-4\nhttps://nextjs.org/docs/app/api-reference/directives/use-cache"} />
          </Field>
          {badRefs.length > 0 && (
            <p className="-mt-2 text-xs text-red-600">Not a URL: {badRefs.join(", ")}</p>
          )}

          <Field label="Must cover" hint="One per line. These become required chapters in the outline.">
            <textarea className={input} rows={4} value={v.must_cover}
                      onChange={(e) => set("must_cover", e.target.value)}
                      placeholder={"The event loop, microtasks vs macrotasks\nPrototype chain and how class desugars"} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Do not cover" hint="One per line. A hard exclusion in every chapter prompt.">
              <textarea className={input} rows={3} value={v.avoid}
                        onChange={(e) => set("avoid", e.target.value)}
                        placeholder={"Framework-specific advice\nAnything about jQuery"} />
            </Field>
            <Field label="Competing books" hint="One per line. The writer is told to cover what these skip.">
              <textarea className={input} rows={3} value={v.comparable_titles}
                        onChange={(e) => set("comparable_titles", e.target.value)}
                        placeholder={"Real-World Next.js (2022)\nThe Road to Next"} />
            </Field>
          </div>

          <Field label="Tone">
            <input className={input} value={v.tone} onChange={(e) => set("tone", e.target.value)} />
            <span className="mt-2 flex flex-wrap gap-1.5">
              {TONE_PRESETS.map((t) => (
                <button key={t} type="button" onClick={() => set("tone", t)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${v.tone === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {t}
                </button>
              ))}
            </span>
          </Field>
        </Section>

        {/* ── 4. Length ────────────────────────────────────────────────── */}
        <Section id="length" step={4} title="Length">
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
            {pages >= MIN_PAGES && pages < 80 && (
              <span className="mt-1 block text-slate-500">
                Paid technical books on the stores mostly run 150–350 pages. Under ~80 reviewers
                tend to call a paid title thin.
              </span>
            )}
          </p>
        </Section>

        {/* ── 5. Author ────────────────────────────────────────────────── */}
        <Section id="author" step={5} title="Author">
          <Field label="Author name" hint="Exactly as it should appear on the cover and every store.">
            <input className={input} value={v.author_name}
                   onChange={(e) => set("author_name", e.target.value)} />
          </Field>
          <Field label="Author bio" counter={{ value: wordsIn(v.author_bio), max: 150, min: 25, unit: "words" }}
                 hint="Third person, facts only. “About the Author” is written from this and nothing else — the agent is forbidden from inventing credentials, so a blank bio gives a near-empty page.">
            <textarea className={input} rows={4} value={v.author_bio}
                      onChange={(e) => set("author_bio", e.target.value)}
                      placeholder="Deepak Kumar is a full-stack engineer who has built and run production Next.js applications since…" />
          </Field>
        </Section>

        {/* ── 6. Store listing ─────────────────────────────────────────── */}
        <Section id="store" step={6} title="Store listing"
                 intro="KDP, Google Play Books and Gumroad. Description, keywords and categories are drafted by the agent at the end of a run when blank — edit them here; once filled, a re-run will not overwrite them.">
          {coverSlot ?? (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-500">
              Save the brief first — the cover upload appears here once the book exists.
            </p>
          )}

          <Field label="Store description"
                 counter={{ value: v.kdp_description.length, max: STORE_DESC_MAX }}
                 hint="Lead with the reader's problem, then what they can do after. Plain text; no claims of “bestseller”, reviews or prices — stores reject listings for those.">
            <textarea className={input} rows={7} value={v.kdp_description}
                      onChange={(e) => set("kdp_description", e.target.value)} />
          </Field>

          <Field label="Search keywords"
                 hint={`${KEYWORD_SLOTS} phrases a buyer would type, up to ${KEYWORD_MAX} characters each. Not words already in the title, no other authors' names or trademarks — KDP removes listings for that.`}>
            <Slots values={v.kdp_keywords} count={KEYWORD_SLOTS} max={KEYWORD_MAX}
                   placeholder={(i) => ["next.js caching guide", "react server components production", "app router performance"][i] ?? `Keyword ${i + 1}`}
                   onChange={(next) => set("kdp_keywords", next)} />
          </Field>

          <Field label="Categories"
                 hint="BISAC style. Google Play uses these directly; on KDP pick the nearest match in its category browser.">
            <Slots values={v.kdp_categories} count={CATEGORY_SLOTS}
                   placeholder={(i) => ["COMPUTERS / Programming / Open Source", "COMPUTERS / Web / Web Programming", "COMPUTERS / Languages / JavaScript"][i]}
                   onChange={(next) => set("kdp_categories", next)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Publication date">
              <input type="date" className={input} value={v.publication_date}
                     onChange={(e) => set("publication_date", e.target.value)} />
            </Field>
            <Field label="Copyright holder" hint="Blank = author name.">
              <input className={input} value={v.copyright_holder}
                     onChange={(e) => set("copyright_holder", e.target.value)}
                     placeholder={v.author_name} />
            </Field>
            <Field label="Edition">
              <input className={input} value={v.edition}
                     onChange={(e) => set("edition", e.target.value)} placeholder="First edition" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Series name" hint="Optional. Links titles on the store page.">
              <input className={input} value={v.series_name}
                     onChange={(e) => set("series_name", e.target.value)} />
            </Field>
            <Field label="Number in series">
              <input type="number" min={0} max={999} className={input} value={v.series_number || ""}
                     onChange={(e) => set("series_number", Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <Field label="Publisher / imprint" hint="Blank = independently published.">
              <input className={input} value={v.publisher}
                     onChange={(e) => set("publisher", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ISBN" hint="Optional for ebooks (KDP gives an ASIN, Google a GGKEY). One ISBN per format — never reuse the paperback's.">
              <input className={input} value={v.isbn} onChange={(e) => set("isbn", e.target.value)}
                     placeholder="978-…" />
            </Field>
            <Field label="Paperback trim size" hint="6×9 in is the standard for technical books.">
              <select className={input} value={v.trim_size} onChange={(e) => set("trim_size", e.target.value)}>
                <option value="5x8">5 × 8 in</option>
                <option value="5.5x8.5">5.5 × 8.5 in</option>
                <option value="6x9">6 × 9 in (recommended)</option>
                <option value="7x10">7 × 10 in</option>
                <option value="8.5x11">8.5 × 11 in</option>
              </select>
            </Field>
          </div>

          {/* Compliance, not preference — see the column note in books_schema.sql */}
          <Field
            label="AI disclosure"
            hint="KDP asks at upload. A book this agent writes is “AI-generated”, and stays that way after you edit it — editing changes quality, not authorship. Declaring otherwise risks the whole publishing account."
          >
            <select className={input} value={v.ai_disclosure}
                    onChange={(e) => set("ai_disclosure", e.target.value)}>
              <option value="ai-generated">AI-generated (correct for this agent)</option>
              <option value="ai-assisted">AI-assisted — only if a human wrote the draft</option>
            </select>
          </Field>
        </Section>

        {/* ── 7. Website ───────────────────────────────────────────────── */}
        <Section id="website" step={7} title="Website"
                 intro="How the book appears on officialdeepak.in.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Access" hint="Email gate builds the list. That list is the actual asset — the book is what buys it.">
              <select className={input} value={v.access} onChange={(e) => set("access", e.target.value)}>
                <option value="email">Free, email required</option>
                <option value="public">Free, no email</option>
              </select>
            </Field>
            <Field label="Cover emoji" hint="Fallback when no cover image is uploaded.">
              <input className={input} value={v.cover_emoji} maxLength={8}
                     onChange={(e) => set("cover_emoji", e.target.value)} />
            </Field>
          </div>

          {/* ── Price anchoring ──────────────────────────────────────────
              Entered in rupees, stored in paise. The hint is doing compliance
              work, not decoration: a struck-through price the book was never
              offered at is a misleading price representation under India's CCPA
              dark-pattern guidelines and breaches Amazon's list-price policy. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="List price (₹)"
              hint="Shown struck through beside “Free”. Leave 0 until the paid edition genuinely exists — an invented price is a misleading claim, and a checkable one converts better anyway."
            >
              <input
                type="number" min={0} step={10} className={input}
                value={v.list_price_paise ? v.list_price_paise / 100 : ""}
                placeholder="0"
                onChange={(e) =>
                  set("list_price_paise", Math.max(0, Math.round(Number(e.target.value) * 100) || 0))
                }
              />
            </Field>
            <Field label="Where that price applies" hint="Names the claim so a reader can check it. Blank shows the price with no context.">
              <input className={input} value={v.price_label}
                     onChange={(e) => set("price_label", e.target.value)}
                     placeholder="on Amazon Kindle" />
            </Field>
          </div>

          {v.list_price_paise > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Readers will see
              </p>
              <p className="mt-1.5 text-slate-900">
                <s className="text-slate-400">₹{(v.list_price_paise / 100).toLocaleString("en-IN")}</s>{" "}
                <strong className="text-emerald-700">Free</strong>{" "}
                {v.price_label && <span className="text-sm text-slate-500">{v.price_label}</span>}
              </p>
              {!v.price_label && (
                <p className="mt-1.5 text-xs text-amber-700">
                  Add where the price applies. An unlabelled struck-through price reads as a
                  marketing trick and is harder to defend if anyone asks.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO title" counter={{ value: v.seo_title.length, max: 60 }}
                   hint="Blank = the book title. Google truncates past ~60.">
              <input className={input} value={v.seo_title}
                     onChange={(e) => set("seo_title", e.target.value)} />
            </Field>
            <Field label="SEO description" counter={{ value: v.seo_description.length, max: 160 }}
                   hint="Google truncates past ~160.">
              <input className={input} value={v.seo_description}
                     onChange={(e) => set("seo_description", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── Save bar — sticky, so saving never needs a scroll to the end ── */}
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? <IconLoader2 size={16} className="animate-spin" /> : <IconDeviceFloppy size={16} />}
            {saving ? "Saving…" : submitLabel}
          </button>
          <span className={`min-w-0 flex-1 text-xs ${dirty ? "font-medium text-amber-700" : "text-slate-500"}`}>
            {dirty ? "Unsaved changes" : "Saving only stores the brief. Nothing is generated until you say so."}
          </span>
        </div>
      </div>
    </form>
  );
}
