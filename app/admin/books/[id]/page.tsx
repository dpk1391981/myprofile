"use client";

/**
 * One book: brief → outline → generate → review → publish.
 *
 * The four stages are deliberately separate buttons rather than one "make me a
 * book". Each one costs money and the outline is the cheap place to catch a
 * brief that was wrong — approving a table of contents takes thirty seconds and
 * saves the price of fifteen chapters written to the wrong plan.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconLoader2, IconAlertTriangle, IconListNumbers, IconWand, IconWorld,
  IconTrash, IconCheck, IconCode, IconPencil, IconChevronDown, IconArrowLeft,
} from "@tabler/icons-react";
import PageHeader from "@/components/admin/PageHeader";
import BookForm, { type BookBriefValues } from "@/components/books/BookForm";
import { usePolling } from "@/components/books/usePolling";
import { formatISTDate } from "@/components/utils/date";

const WORDS_PER_PAGE = 350; // matches WORDS_PER_PAGE in agents/book_author.py

type Chapter = {
  ordinal: number; heading: string; summary: string; bodyHtml: string;
  concepts: string[]; wordCount: number; codeBlocks: number; codeVerified: boolean;
  codeErrors: string[]; editorScore: number;
  editorNotes: {
    fixes?: string[]; suspect_claims?: string[]; scores?: Record<string, number>;
    specificity?: { score: number; numbers: number; identifiers: number;
                    contingency: number; failure: number; judgement: number };
    sections?: { heading: string; words: number; specificity: number; repetition: number }[];
  };
  revised: boolean; status: string; attempts: number; errorText: string;
};

/** The API answers in camelCase (see components/utils/books-api.ts). The brief
 *  form works in snake_case because those are the column names the agent reads,
 *  so `toBriefValues` below is the one place the two shapes meet. Mixing them in
 *  this type is how fields silently render as undefined. */
type Book = {
  id: number; slug: string; title: string; subtitle: string; status: string;
  errorText: string; chapters: number; targetChapters: number; targetWords: number;
  wordCount: number; pages: number; coverEmoji: string; publishedAt: string | null;
  outline: { ordinal: number; heading: string; summary: string; sections: string[];
             concepts: string[]; target_words: number }[];
  chapterDetail?: Chapter[];
  kdpDescription: string; kdpKeywords: string[]; kdpCategories: string[];
  introHtml: string; prefaceHtml: string;
};

export default function AdminBookDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = Number(params.id);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  // Whether the current error is one a human may override. Flagged chapters are
  // a judgement call; a book under the page floor is not, and offering "publish
  // anyway" there would undo the check. Held as state rather than sniffed out
  // of the message text, which breaks the moment the wording changes.
  const [canOverride, setCanOverride] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"outline" | "chapters" | "brief" | "kdp">("outline");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/books/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load the book");
      setBook(data.book);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Poll only while a run is moving, and only while this tab is visible. The
  // agent commits after every chapter, so these numbers are the real state of
  // the book rather than a progress animation — and a chapter takes ~2 minutes,
  // so 8s is well inside the resolution anyone can perceive.
  const running = book?.status === "generating" || book?.status === "outlining";
  usePolling(load, running, 8000);

  async function call(label: string, url: string, init?: RequestInit) {
    setBusy(label); setError(""); setNotice(""); setCanOverride(false);
    try {
      const res = await fetch(url, { method: "POST", ...init });
      const data = await res.json();
      if (!res.ok) {
        const err: any = new Error(data.error || "Request failed");
        err.needsAcknowledgement = data.needsAcknowledgement;
        throw err;
      }
      await load();
      return data;
    } catch (err: any) {
      setError(err.message);
      if (err.needsAcknowledgement) {
        setCanOverride(true);
        return { needsAcknowledgement: true };
      }
      return null;
    } finally {
      setBusy("");
    }
  }

  async function buildOutline() {
    const r = await call("outline", `/api/admin/books/${id}/outline`);
    if (r?.ok) { setNotice(`Outline built — ${r.chapters} chapters. Read it before generating.`); setTab("outline"); }
  }

  async function generate() {
    const r = await call("generate", `/api/admin/books/${id}/generate`);
    // "started", never "done" — the run outlives this request by a long way.
    if (r?.triggered) { setNotice("Generation started. This takes a while; progress updates below."); setTab("chapters"); }
  }

  async function publish(allowFlagged = false) {
    const r = await call("publish",
      `/api/admin/books/${id}/publish?publish=true&allow_flagged=${allowFlagged}`);
    if (r?.needsAcknowledgement) return;      // error box already shows why
    if (r?.book) setNotice("Published.");
  }

  async function unpublish() {
    const r = await call("publish", `/api/admin/books/${id}/publish?publish=false`);
    if (r?.book) setNotice("Unpublished — back to ready.");
  }

  async function remove() {
    if (!confirm(`Delete “${book?.title}” and every chapter? Subscribers are kept.`)) return;
    setBusy("delete");
    const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/books");
    else { setError("Could not delete the book"); setBusy(""); }
  }

  async function saveBrief(values: BookBriefValues) {
    const res = await fetch(`/api/admin/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save");
    setBook(data.book);
    setNotice("Brief saved. Rebuild the outline for it to take effect.");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
        <IconLoader2 size={18} className="animate-spin" /> Loading…
      </div>
    );
  }
  if (!book) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">{error || "Book not found"}</p>
        <Link href="/admin/books" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
          Back to books
        </Link>
      </div>
    );
  }

  const chapters = book.chapterDetail || [];
  const flagged = chapters.filter((c) => c.status === "flagged").length;
  const hasOutline = (book.outline || []).length > 0;
  const estCost = estimateCost(book.targetWords, book.targetChapters);

  return (
    <div>
      <Link href="/admin/books"
            className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <IconArrowLeft size={16} /> Books
      </Link>

      <PageHeader
        title={book.title}
        description={
          <>
            {book.chapters}/{book.targetChapters} chapters · {book.wordCount.toLocaleString()} words ·
            ≈{book.pages} pages
            {book.publishedAt && <> · live {formatISTDate(book.publishedAt)}</>}
          </>
        }
        actions={
          <>
            {book.status === "published" ? (
              <>
                <Link href={`/books/${book.slug}`} target="_blank"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm hover:bg-slate-50">
                  <IconWorld size={16} /> View
                </Link>
                <button onClick={unpublish} disabled={!!busy}
                        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-60">
                  Unpublish
                </button>
              </>
            ) : (
              <button onClick={() => publish(false)}
                      disabled={!!busy || book.chapters === 0}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                {busy === "publish" ? <IconLoader2 size={16} className="animate-spin" /> : <IconCheck size={16} />}
                Publish
              </button>
            )}
            <button onClick={remove} disabled={!!busy} title="Delete"
                    className="rounded-lg border border-slate-300 p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-60">
              <IconTrash size={16} />
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>{error}</p>
              {canOverride && (
                <button onClick={() => publish(true)}
                        className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                  I have read them — publish anyway
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {notice}
        </div>
      )}

      {/* ── The two generation actions ──────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <button onClick={buildOutline} disabled={!!busy}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60">
          {busy === "outline" ? <IconLoader2 size={16} className="animate-spin" /> : <IconListNumbers size={16} />}
          {hasOutline ? "Rebuild outline" : "1. Build outline"}
        </button>

        <button onClick={generate} disabled={!!busy || !hasOutline || book.status === "generating"}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {busy === "generate" || book.status === "generating"
            ? <IconLoader2 size={16} className="animate-spin" /> : <IconWand size={16} />}
          {book.status === "generating" ? "Generating…" : "2. Generate book"}
        </button>

        <p className="text-xs text-slate-500">
          {!hasOutline
            ? "Build the outline first — it is cheap, and it is where a wrong brief gets caught."
            : book.status === "generating"
              ? "Running in the background. Safe to leave this page; progress is saved after every chapter."
              : <>Resumes from the last finished chapter. Roughly <strong>${estCost.lo}–${estCost.hi}</strong> and <strong>{estCost.mins} min</strong> for a full run.</>}
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {([["outline", `Outline${hasOutline ? ` (${book.outline.length})` : ""}`],
           ["chapters", `Chapters${chapters.length ? ` (${chapters.length})` : ""}`],
           ["kdp", "Store metadata"],
           ["brief", "Brief"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    tab === key
                      ? "border-b-2 border-blue-600 text-blue-700"
                      : "text-slate-500 hover:text-slate-900"}`}>
            {label}
            {key === "chapters" && flagged > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
                {flagged}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "outline" && (
        hasOutline ? (
          <ol className="space-y-2">
            {book.outline.map((c) => (
              <li key={c.ordinal} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-slate-400">{c.ordinal}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{c.heading}</p>
                    {c.summary && <p className="mt-1 text-sm text-slate-600">{c.summary}</p>}
                    {c.sections?.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                        {c.sections.map((s, i) => <li key={i}>· {s}</li>)}
                      </ul>
                    )}
                    {c.concepts?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.concepts.map((k) => (
                          <span key={k} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">~{c.target_words}w</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
            No outline yet. Build it above.
          </p>
        )
      )}

      {tab === "chapters" && (
        chapters.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
            Nothing generated yet.
          </p>
        ) : (
          <div className="space-y-2">
            {chapters.map((c) => (
              <ChapterCard key={c.ordinal} bookId={id} chapter={c}
                           open={open === c.ordinal}
                           onToggle={() => setOpen(open === c.ordinal ? null : c.ordinal)}
                           onSaved={load} />
            ))}
          </div>
        )
      )}

      {tab === "kdp" && <KdpPanel book={book} />}

      {tab === "brief" && (
        <BookForm initial={toBriefValues(book)} submitLabel="Save brief" onSubmit={saveBrief} />
      )}
    </div>
  );
}

/* ── Chapter review card ────────────────────────────────────────────────── */

function ChapterCard({
  bookId, chapter: c, open, onToggle, onSaved,
}: {
  bookId: number; chapter: Chapter; open: boolean;
  onToggle: () => void; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(c.bodyHtml);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/books/${bookId}/chapters/${c.ordinal}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // A hand-edited chapter is no longer flagged — a human just read it,
      // which is exactly what the flag was asking for.
      body: JSON.stringify({ body_html: body, status: "ok" }),
    });
    setSaving(false); setEditing(false); onSaved();
  }

  const scoreCls = c.editorScore >= 18 ? "text-emerald-700 bg-emerald-50"
    : c.editorScore >= 13 ? "text-amber-700 bg-amber-50"
    : "text-red-700 bg-red-50";

  return (
    <div className={`rounded-xl border bg-white ${c.status === "flagged" ? "border-amber-300" : "border-slate-200"}`}>
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="mt-0.5 text-sm font-semibold text-slate-400">{c.ordinal}</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">{c.heading}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>{c.wordCount.toLocaleString()} words</span>
            {c.editorScore > 0 && (
              <span className={`rounded px-1.5 py-0.5 font-medium ${scoreCls}`}>
                editor {c.editorScore}/25
              </span>
            )}
            {typeof c.editorNotes?.specificity?.score === "number" && (
              <span className={`rounded px-1.5 py-0.5 font-medium ${
                c.editorNotes.specificity.score >= 3 ? "bg-emerald-50 text-emerald-700"
                : c.editorNotes.specificity.score >= 2.2 ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"}`}>
                specifics {c.editorNotes.specificity.score}/5
              </span>
            )}
            {c.codeBlocks > 0 && (
              <span className={`inline-flex items-center gap-1 ${
                c.codeErrors.length ? "text-red-600" : c.codeVerified ? "text-emerald-600" : "text-slate-500"}`}>
                <IconCode size={13} />
                {c.codeBlocks} block{c.codeBlocks > 1 ? "s" : ""}
                {c.codeErrors.length ? " — failing" : c.codeVerified ? " — checked" : " — unverified"}
              </span>
            )}
            {c.revised && <span className="text-slate-400">revised</span>}
            {c.status === "flagged" && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">needs review</span>
            )}
          </div>
          {c.errorText && <p className="mt-1.5 text-xs text-amber-700">{c.errorText}</p>}
        </div>
        <IconChevronDown size={18}
          className={`mt-1 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          {c.editorNotes?.specificity && (
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">
                Concrete detail — {c.editorNotes.specificity.score}/5
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Counted per 1,000 words. This is the deterministic half of the grade: a
                chapter can read well and still score low, which is exactly the failure
                worth catching.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>{c.editorNotes.specificity.numbers} numbers</span>
                <span>{c.editorNotes.specificity.identifiers} named APIs</span>
                <span>{c.editorNotes.specificity.contingency} conditions</span>
                <span>{c.editorNotes.specificity.failure} failure mentions</span>
                <span>{c.editorNotes.specificity.judgement} stated opinions</span>
              </div>
              {!!c.editorNotes.sections?.length && (
                <table className="mt-3 w-full text-xs">
                  <thead className="text-left text-slate-400">
                    <tr><th className="font-normal">Section</th>
                        <th className="font-normal">Words</th>
                        <th className="font-normal">Specifics</th>
                        <th className="font-normal">Repeat</th></tr>
                  </thead>
                  <tbody>
                    {c.editorNotes.sections.map((sec, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        <td className="py-1 pr-2 text-slate-600">{sec.heading}</td>
                        <td className="py-1 pr-2 tabular-nums">{sec.words}</td>
                        <td className="py-1 pr-2 tabular-nums">{sec.specificity}</td>
                        <td className="py-1 tabular-nums">{Math.round(sec.repetition * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {(c.editorNotes?.fixes?.length || c.editorNotes?.suspect_claims?.length) && (
            <div className="mb-4 space-y-3 rounded-lg bg-slate-50 p-3 text-sm">
              {!!c.editorNotes.suspect_claims?.length && (
                <div>
                  <p className="font-medium text-red-700">Claims the editor could not verify</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                    {c.editorNotes.suspect_claims.map((s, i) => <li key={i}>· {s}</li>)}
                  </ul>
                </div>
              )}
              {!!c.editorNotes.fixes?.length && (
                <div>
                  <p className="font-medium text-slate-700">Editor notes</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                    {c.editorNotes.fixes.map((s, i) => <li key={i}>· {s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!!c.codeErrors.length && (
            <div className="mb-4 rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">Code that does not compile</p>
              <ul className="mt-1 space-y-0.5 font-mono text-xs text-red-600">
                {c.codeErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {editing ? (
            <>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={22}
                        className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs" />
              <div className="mt-2 flex gap-2">
                <button onClick={save} disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving && <IconLoader2 size={14} className="animate-spin" />} Save chapter
                </button>
                <button onClick={() => { setEditing(false); setBody(c.bodyHtml); }}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="prose prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100"
                   dangerouslySetInnerHTML={{ __html: c.bodyHtml }} />
              <button onClick={() => setEditing(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                <IconPencil size={14} /> Edit this chapter
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Store metadata ─────────────────────────────────────────────────────── */

function KdpPanel({ book }: { book: Book }) {
  if (!book.kdpDescription && !book.kdpKeywords?.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Store metadata is written at the end of a generation run, after the chapters exist.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Before uploading to KDP</p>
        <p className="mt-1">
          Declare this book as <strong>AI-generated</strong>. That is what it is, and it stays
          that way after you edit it — KDP asks about authorship, not quality. A false
          declaration risks the whole publishing account.
        </p>
      </div>

      <Panel title="Description" hint="Max 4000 characters on KDP.">
        <p className="whitespace-pre-wrap text-sm text-slate-700">{book.kdpDescription}</p>
      </Panel>

      <Panel title="Keywords" hint="KDP takes exactly 7.">
        <div className="flex flex-wrap gap-2">
          {(book.kdpKeywords || []).map((k) => (
            <span key={k} className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700">{k}</span>
          ))}
        </div>
      </Panel>

      <Panel title="Categories" hint="KDP takes 3.">
        <ul className="space-y-1 text-sm text-slate-700">
          {(book.kdpCategories || []).map((c) => <li key={c}>· {c}</li>)}
        </ul>
      </Panel>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── helpers ────────────────────────────────────────────────────────────── */

function toBriefValues(b: any): BookBriefValues {
  return {
    title: b.title ?? "", subtitle: b.subtitle ?? "", description: b.description ?? "",
    topic: b.topic ?? "", audience: b.audience ?? "", level: b.level || "intermediate",
    language: b.language || "en", tone: b.tone ?? "", code_language: b.codeLanguage ?? "",
    outcomes: b.outcomes ?? [], prerequisites: b.prerequisites ?? "",
    must_cover: b.mustCover ?? "", avoid: b.avoid ?? "", author_name: b.authorName ?? "",
    target_chapters: b.targetChapters || 12, target_words: b.targetWords || 35000,
    cover_emoji: b.coverEmoji ?? "", access: b.access || "email",
    list_price_paise: b.listPricePaise ?? 0,
    price_label: b.priceLabel ?? "",
    currency: b.currency || "INR",
    seo_title: b.seoTitle ?? "", seo_description: b.seoDescription ?? "",
    ai_disclosure: b.aiDisclosure || "ai-generated",
  };
}

/**
 * Rough run cost and wall time, modelled on what the agent actually does.
 *
 * Shown because "Generate" is the button that spends money, and a number on the
 * button is the difference between a considered click and a surprised one.
 *
 * The model must match agents/book_author.py's structure or it lies: generation
 * is one call per SECTION (~4 per chapter), not one per chapter, plus an
 * expansion pass over the short ones, one mini critique per chapter, and one
 * call for the front/back matter. A per-chapter estimate understates a 100-page
 * book by about 4x.
 *
 * Deliberately a range — how many sections need expanding is the variable.
 */
function estimateCost(targetWords: number, chapters: number) {
  // Section COUNT is derived from the chapter target, exactly as
  // _plan_sections does it — one call produces ~600 words (measured), so the
  // number of calls, not the per-call target, is what scales a chapter. A fixed
  // sections-per-chapter here would understate a long book.
  const SECTION_WORDS = 600;          // SECTION_TARGET_WORDS in book_author.py
  const perChapter = Math.max(1, Math.round(targetWords / Math.max(1, chapters)));
  const sectionsPerChapter = Math.max(3, Math.min(9, Math.ceil(perChapter / SECTION_WORDS)));
  const sections = Math.max(1, chapters) * sectionsPerChapter;

  // gpt-4o: $2.50/M in, $10/M out. gpt-4o-mini: $0.15/M in, $0.60/M out.
  const outTokens = targetWords * 1.35;             // words -> tokens, incl. markup
  const inPerSection = 1500;                        // brief + continuity digest

  // Prose: every section once, plus a rewrite for the ~45% that trip a gate
  // (length, specificity floor, repetition ceiling, banned phrases) on the
  // first attempt. That rewrite rate is the price of the quality bar and it is
  // most of the difference between this estimate and a naive one.
  // Down from 0.45: per-section targets now sit inside the range a model
  // actually delivers, so the length gate rarely fires. Specificity is what
  // still sends sections back.
  const REWRITE_RATE = 0.35;
  const proseOut = outTokens * (1 + REWRITE_RATE);
  const proseIn = sections * inPerSection * (1 + REWRITE_RATE);
  const prose = proseIn * 2.5e-6 + proseOut * 10e-6;

  // Critic reads each finished chapter back on the mini model.
  const critic = (chapters * 4000) * 0.15e-6 + (chapters * 900) * 0.6e-6;

  // Front matter, back matter and store metadata: one premium call.
  const matter = 3000 * 2.5e-6 + 4000 * 10e-6;

  const total = prose + critic + matter;

  // ~21s per prose call including the pause, ~9s per chapter critique.
  const seconds = sections * (1 + REWRITE_RATE) * 21 + chapters * 9 + 40;

  return {
    lo: total.toFixed(2),
    hi: (total * 1.6).toFixed(2),
    mins: Math.max(3, Math.round(seconds / 60)),
  };
}
