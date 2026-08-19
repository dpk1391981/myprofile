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
}

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(blog: Blog) {
    const newStatus = blog.status === "published" ? "draft" : "published";
    await fetch(`/api/admin/blogs/${blog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b)));
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    setDeleting(id);
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    setDeleting(null);
  }

  const filtered = blogs.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusPill = (status: string) =>
    status === "published"
      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : "bg-amber-50 text-amber-700 hover:bg-amber-100";

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="All Posts"
        description={loading ? "Loading…" : `${blogs.length} total ${blogs.length === 1 ? "post" : "posts"}`}
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
            placeholder="Search by title or category…"
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
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <IconInbox size={40} stroke={1.4} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-700">No posts found</p>
            <p className="mt-1 text-sm text-slate-500">
              {search || filter !== "all" ? "Try a different search or filter." : "Create your first post."}
            </p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <IconPlus size={16} stroke={2.2} /> New Post
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
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
                      {blog.date || new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => togglePublish(blog)}
                        title="Toggle published / draft"
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${statusPill(blog.status)}`}
                      >
                        {blog.status}
                      </button>
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

            {/* Mobile cards — a five-column table is unusable under 768px */}
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
                        <span>{blog.date || new Date(blog.createdAt).toLocaleDateString()}</span>
                        {blog.featured && (
                          <span className="inline-flex items-center gap-0.5 text-amber-500">
                            <IconStarFilled size={11} /> Featured
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => togglePublish(blog)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${statusPill(blog.status)}`}
                    >
                      {blog.status}
                    </button>
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
          </>
        )}
      </div>
    </div>
  );
}
