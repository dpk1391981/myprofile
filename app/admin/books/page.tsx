"use client";

/** Every book, any status. */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconPlus, IconBook, IconLoader2, IconAlertTriangle, IconWorld, IconPencil,
} from "@tabler/icons-react";
import PageHeader from "@/components/admin/PageHeader";
import { usePolling } from "@/components/books/usePolling";
import { formatISTDate } from "@/components/utils/date";

type BookRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  status: string;
  chapters: number;
  targetChapters: number;
  wordCount: number;
  pages: number;
  coverEmoji: string;
  errorText: string;
  runStale: boolean;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string | null;
};

/** Colour carries the state, so the list is scannable without reading it. */
const STATUS: Record<string, { label: string; cls: string }> = {
  draft:      { label: "Draft",      cls: "bg-slate-100 text-slate-700" },
  outlining:  { label: "Outlining",  cls: "bg-blue-100 text-blue-700" },
  generating: { label: "Generating", cls: "bg-amber-100 text-amber-800" },
  paused:     { label: "Paused",     cls: "bg-slate-200 text-slate-700" },
  ready:      { label: "Ready",      cls: "bg-emerald-100 text-emerald-700" },
  published:  { label: "Published",  cls: "bg-blue-600 text-white" },
  failed:     { label: "Failed",     cls: "bg-red-100 text-red-700" },
};

export default function AdminBooksList() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);

  /** Live / inactive. Optimistic: the switch moves at once, and snaps back
   *  with an error if the server refuses. */
  async function setActive(b: BookRow, active: boolean) {
    setToggling(b.id); setError("");
    setBooks((all) => all.map((x) => (x.id === b.id ? { ...x, isActive: active } : x)));
    try {
      const res = await fetch(`/api/admin/books/${b.id}/active?active=${active}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change visibility");
    } catch (err: any) {
      setBooks((all) => all.map((x) => (x.id === b.id ? { ...x, isActive: !active } : x)));
      setError(err.message);
    } finally {
      setToggling(null);
    }
  }

  async function load() {
    try {
      const res = await fetch("/api/admin/books", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load books");
      setBooks(data.books || []);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // A run commits after every chapter, so polling shows real progress. Only
  // while something is actually moving, and only while the tab is visible — an
  // idle or backgrounded list must not sit there hitting the API forever.
  const active = books.some(
    (b) => (b.status === "generating" || b.status === "outlining") && !b.runStale);
  usePolling(load, active, 8000);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Books"
        description="Long-form books written by the book_author agent."
        actions={
          <Link href="/admin/books/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <IconPlus size={16} /> New book
          </Link>
        }
      />

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlertTriangle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <IconLoader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <IconBook size={32} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm text-slate-600">No books yet.</p>
          <Link href="/admin/books/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <IconPlus size={16} /> Write the first brief
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((b) => {
            const s = STATUS[b.status] || STATUS.draft;
            const pct = b.targetChapters
              ? Math.round((b.chapters / b.targetChapters) * 100)
              : 0;
            return (
              <div key={b.id}
                   className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-2xl">
                    {b.coverEmoji || "📘"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/books/${b.id}`}
                            className="truncate font-semibold text-slate-900 hover:text-blue-700">
                        {b.title}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        b.runStale ? "bg-red-100 text-red-700"
                        : b.status === "published" && !b.isActive ? "bg-slate-200 text-slate-600"
                        : s.cls}`}>
                        {b.runStale ? "Run stopped"
                          : b.status === "published" && !b.isActive ? "Inactive — hidden from site"
                          : s.label}
                      </span>
                    </div>
                    {b.subtitle && (
                      <p className="mt-0.5 truncate text-sm text-slate-500">{b.subtitle}</p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{b.chapters}/{b.targetChapters} chapters</span>
                      <span>{b.wordCount.toLocaleString()} words</span>
                      <span>≈{b.pages} pages</span>
                      {b.publishedAt && <span>Live {formatISTDate(b.publishedAt)}</span>}
                    </div>

                    {b.status === "generating" && !b.runStale && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-amber-500 transition-all"
                             style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    {b.errorText && (
                      <p className="mt-2 text-xs text-red-600">{b.errorText}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {b.status === "published" && (
                      <label className="mr-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600"
                             title={b.isActive ? "Live on the site — click to hide it" : "Hidden from the site — click to show it"}>
                        <span className={b.isActive ? "text-emerald-700" : "text-slate-500"}>
                          {b.isActive ? "Live" : "Inactive"}
                        </span>
                        <button type="button" role="switch" aria-checked={b.isActive}
                                aria-label={`${b.title}: ${b.isActive ? "live" : "inactive"}`}
                                disabled={toggling === b.id}
                                onClick={() => setActive(b, !b.isActive)}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
                                  b.isActive ? "bg-emerald-500" : "bg-slate-300"}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            b.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </label>
                    )}
                    {b.status === "published" && b.isActive && (
                      <Link href={`/books/${b.slug}`} target="_blank"
                            title="View public page"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        <IconWorld size={18} />
                      </Link>
                    )}
                    <Link href={`/admin/books/${b.id}`} title="Open"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                      <IconPencil size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
