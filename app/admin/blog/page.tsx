"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Blog {
  _id: string;
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
    await fetch(`/api/admin/blogs/${blog._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBlogs((prev) =>
      prev.map((b) => (b._id === blog._id ? { ...b, status: newStatus } : b))
    );
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    setDeleting(id);
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    setBlogs((prev) => prev.filter((b) => b._id !== id));
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Posts</h1>
          <p className="text-slate-500 text-sm mt-1">{blogs.length} total posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1.5">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-50 animate-pulse border-b border-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium text-slate-600">No posts found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term." : "Create your first post!"}
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
            >
              + New Post
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl flex-shrink-0">{blog.coverEmoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          /{blog.slug} · {blog.readTime}
                          {blog.featured && (
                            <span className="ml-2 text-amber-500">⭐ Featured</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs hidden lg:table-cell">
                    {blog.date || new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => togglePublish(blog)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                        blog.status === "published"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                    >
                      {blog.status === "published" ? "✓ Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded"
                        title="View"
                      >
                        👁️
                      </a>
                      <Link
                        href={`/admin/blog/${blog._id}/edit`}
                        className="text-xs bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteBlog(blog._id)}
                        disabled={deleting === blog._id}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {deleting === blog._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
