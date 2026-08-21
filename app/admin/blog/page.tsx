"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
  IconStarFilled,
  IconInbox,
} from "@tabler/icons-react";
import PageHeader from "@/components/admin/PageHeader";
import { istStamp, formatISTDate, formatISTTime } from "@/components/utils/date";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  date: string;
  featured: boolean;
  coverEmoji: string;
  tags: string[];
  readTime: string;
  createdAt: string;
  /** Unique visitors, and of those the ones who crossed the read thresholds
   *  (30s active + 60% scroll). See api/portfolio_routes.record_view. */
  views?: number;
  reads?: number;
  /** Release instant. A value in the future means the post is written and
   *  marked published but the public API still answers 404 for it. */
  publishedAt?: string | null;
}

type LiveState = "live" | "scheduled" | "draft";

/**
 * What the public site would say about this post right now.
 *
 * The upstream read filters on `published_at <= NOW()`, so "published" in the
 * database is not the same as "reachable at its URL" — which is exactly the
 * gap that made a freshly generated post look like a broken 404.
 */
function liveState(b: Blog): LiveState {
  if (b.status !== "published") return "draft";
  if (!b.publishedAt) return "scheduled";
  // istStamp() before comparing: `publishedAt` is an IST instant, and parsing
  // it without its offset compared the release time against the wrong clock —
  // a post scheduled minutes out read as "live" hours early.
  return new Date(istStamp(b.publishedAt)).getTime() <= Date.now() ? "live" : "scheduled";
}

function goLiveLabel(iso?: string | null) {
  if (!iso) return "waiting for a release time";
  const at = new Date(istStamp(iso));
  const mins = Math.max(1, Math.round((at.getTime() - Date.now()) / 60000));
  // Spelled out as IST rather than left to the browser's zone: this is the
  // clock the generator schedules on, so it is the clock to publish against.
  return `goes live in ~${mins} min (${formatISTTime(iso)})`;
}

/** Rows per page. Matches the `limit` the API route defaults to. */
const PER_PAGE = 10;

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  /** `search` drives the input; this drives the query, one debounce behind. */
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // Typing "javascript" should be one request, not ten. 300ms is below the
  // point a keystroke feels laggy and above a normal inter-key interval.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Any change to what is being asked for resets to the first page. Without
  // this, filtering while on page 5 of an unfiltered list asks for page 5 of a
  // two-page result and renders an empty table that looks like a failure.
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch]);

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, debouncedSearch]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  async function loadBlogs() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        limit: String(PER_PAGE),
        offset: String((page - 1) * PER_PAGE),
      });
      if (filter !== "all") qs.set("status", filter);
      if (debouncedSearch) qs.set("q", debouncedSearch);

      const res = await fetch(`/api/admin/blogs?${qs}`);
      const data = await res.json();
      setBlogs(data.blogs || []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Publish / unpublish, and — for a post still inside its release window —
   * "publish now": the API pulls a future published_at back to the present, so
   * the post is reachable the moment this returns rather than whenever the
   * generator had scheduled it.
   */
  async function togglePublish(blog: Blog) {
    const state = liveState(blog);
    const newStatus = state === "live" ? "draft" : "published";
    setToggling(blog.id);
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id
            ? { ...b, status: newStatus, publishedAt: data?.blog?.publishedAt ?? b.publishedAt }
            : b
        )
      );
    } finally {
      setToggling(null);
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    setDeleting(id);
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    setDeleting(null);

    // Refetch rather than splice the row out locally: with server-side paging,
    // removing one row leaves a nine-row page and silently hides whatever got
    // pulled up from the next one. Stepping back a page when the last row on
    // it was the one deleted keeps the view from landing on an empty page.
    if (blogs.length === 1 && page > 1) setPage((p) => p - 1);
    else loadBlogs();
  }

  // Filtering and searching happen in SQL — see list_blogs_admin upstream. A
  // second pass here would re-filter one page of an already-filtered result and
  // could only ever remove rows the server meant to show.
  const filtered = blogs;

  const PILL: Record<LiveState, string> = {
    live: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    scheduled: "bg-sky-50 text-sky-700 hover:bg-sky-100",
    draft: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  };

  function StatusButton({ blog }: { blog: Blog }) {
    const state = liveState(blog);
    return (
      <button
        onClick={() => togglePublish(blog)}
        disabled={toggling === blog.id}
        title={
          state === "scheduled"
            ? `Not on the site yet — ${goLiveLabel(blog.publishedAt)}. Click to publish now.`
            : state === "live"
              ? "Live on the site. Click to unpublish."
              : "Draft. Click to publish now."
        }
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors disabled:opacity-50 ${PILL[state]}`}
      >
        {toggling === blog.id ? "…" : state === "live" ? "published" : state}
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="All Posts"
        // `total`, not `blogs.length` — the latter is one page's worth, and
        // reporting "10 total posts" on an archive of 200 would be a lie the
        // pager immediately contradicts. Says "matching" while a filter is on,
        // because the number is then a subset and not the archive size.
        description={
          loading && blogs.length === 0
            ? "Loading…"
            : `${total} ${filter !== "all" || debouncedSearch ? "matching " : "total "}${total === 1 ? "post" : "posts"}`
        }
        actions={
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <IconPlus size={16} stroke={2.2} /> New Post
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch
            size={16}
            stroke={2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search by title, category or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors sm:flex-none ${
                filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && blogs.length === 0 ? (
          <div className="divide-y divide-slate-100">
            {[...Array(PER_PAGE)].map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <IconInbox size={40} stroke={1.4} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-700">No posts found</p>
            <p className="mt-1 text-sm text-slate-500">
              {debouncedSearch || filter !== "all" ? "Try a different search or filter." : "Create your first post."}
            </p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <IconPlus size={16} stroke={2.2} /> New Post
            </Link>
          </div>
        ) : (
          <div className={loading ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Engagement</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((blog) => (
                  <tr key={blog.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                          {blog.coverEmoji}
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-slate-900">{blog.title}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-400">
                            /{blog.slug} · {blog.readTime}
                            {blog.featured && (
                              <span className="inline-flex items-center gap-0.5 text-amber-500">
                                <IconStarFilled size={11} /> Featured
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {blog.category}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-xs text-slate-500 lg:table-cell">
                      {formatISTDate(blog.date || blog.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusButton blog={blog} />
                      {liveState(blog) === "scheduled" && (
                        <p className="mt-1 text-[11px] text-sky-600">{goLiveLabel(blog.publishedAt)}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      <Engagement views={blog.views} reads={blog.reads} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View post"
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <IconEye size={17} stroke={1.8} />
                        </a>
                        <Link
                          href={`/admin/blog/${blog.id}/edit`}
                          title="Edit post"
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <IconPencil size={17} stroke={1.8} />
                        </Link>
                        <button
                          onClick={() => deleteBlog(blog.id)}
                          disabled={deleting === blog.id}
                          title="Delete post"
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <IconTrash size={17} stroke={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards — a six-column table is unusable under 768px */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {filtered.map((blog) => (
                <li key={blog.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                      {blog.coverEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">{blog.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                          {blog.category}
                        </span>
                        <span>{formatISTDate(blog.date || blog.createdAt)}</span>
                        {!!blog.views && (
                          <span className="tabular-nums">
                            {blog.views.toLocaleString("en-IN")} views ·{" "}
                            {Math.round(((blog.reads || 0) / blog.views) * 100)}% read
                          </span>
                        )}
                        {blog.featured && (
                          <span className="inline-flex items-center gap-0.5 text-amber-500">
                            <IconStarFilled size={11} /> Featured
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StatusButton blog={blog} />
                    <div className="flex items-center gap-1">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View post"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <IconEye size={18} stroke={1.8} />
                      </a>
                      <Link
                        href={`/admin/blog/${blog.id}/edit`}
                        aria-label="Edit post"
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <IconPencil size={18} stroke={1.8} />
                      </Link>
                      <button
                        onClick={() => deleteBlog(blog.id)}
                        disabled={deleting === blog.id}
                        aria-label="Delete post"
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <IconTrash size={18} stroke={1.8} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Pager
              page={page}
              pageCount={pageCount}
              total={total}
              perPage={PER_PAGE}
              shown={blogs.length}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Page controls for the admin list.
 *
 * Shows the range rather than only the page number — "11–20 of 47" answers
 * "how much is there and where am I" in one line, which a bare "Page 2 of 5"
 * does not. Hidden entirely at one page: a pager under a five-row table is
 * furniture.
 */
function Pager({
  page, pageCount, total, perPage, shown, onChange,
}: {
  page: number; pageCount: number; total: number;
  perPage: number; shown: number; onChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = first + shown - 1;

  // A window around the current page. Every page number is unusable past a
  // couple of dozen pages, and the ends matter more than the middle — so first
  // and last are always reachable, with an ellipsis standing in for the gap.
  const window = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const pages = Array.from(window)
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const btn =
    "min-w-[34px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3"
    >
      <p className="text-xs text-slate-500 tabular-nums">
        {first}–{last} of {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50`}
        >
          Prev
        </button>

        {pages.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {/* A gap in the sequence means pages were skipped. */}
            {i > 0 && p - pages[i - 1] > 1 && (
              <span className="px-1 text-xs text-slate-400" aria-hidden="true">…</span>
            )}
            <button
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${btn} ${
                p === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          </span>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50`}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

/**
 * Views, reads, and the ratio between them.
 *
 * The ratio is the number worth looking at. A post with 4,000 views and a 9%
 * read rate has a headline that works and a body that does not, and that is a
 * completely different problem from a post with 200 views and a 70% read rate —
 * which is a good article nobody has found yet. Two raw counts side by side
 * make that comparison possible at a glance; either one alone hides it.
 */
function Engagement({ views = 0, reads = 0 }: { views?: number; reads?: number }) {
  if (!views) {
    return <span className="text-xs text-slate-300">—</span>;
  }
  const rate = Math.round((reads / views) * 100);
  // Colour only once the sample is big enough to mean anything. Painting a post
  // red off three visitors would be reading noise as signal.
  const tone =
    views < 25 ? "text-slate-400"
      : rate >= 50 ? "text-emerald-600"
      : rate >= 25 ? "text-amber-600"
      : "text-rose-500";

  return (
    <div className="text-xs leading-tight">
      <p className="font-medium tabular-nums text-slate-700">
        {views.toLocaleString("en-IN")} views
      </p>
      <p className={`mt-0.5 tabular-nums ${tone}`}>
        {reads.toLocaleString("en-IN")} reads · {rate}%
      </p>
    </div>
  );
}
