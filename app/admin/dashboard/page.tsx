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
  createdAt: string;
}

export default function Dashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blogs")
      .then((r) => r.json())
      .then((d) => setBlogs(d.blogs || []))
      .finally(() => setLoading(false));
  }, []);

  const published = blogs.filter((b) => b.status === "published").length;
  const drafts = blogs.filter((b) => b.status === "draft").length;
  const featured = blogs.filter((b) => b.featured).length;
  const recent = [...blogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Deepak!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Posts", value: blogs.length, icon: "📝", color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Published", value: published, icon: "✅", color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Drafts", value: drafts, icon: "🗒️", color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Featured", value: featured, icon: "⭐", color: "bg-purple-50 border-purple-200 text-purple-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-5 ${stat.color}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold">{loading ? "—" : stat.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Recent Posts</h2>
            <Link href="/admin/blog" className="text-blue-600 text-xs font-medium hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <div className="text-3xl mb-2">📭</div>
              No posts yet.{" "}
              <Link href="/admin/blog/new" className="text-blue-600 hover:underline">
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((b) => (
                <Link
                  key={b._id}
                  href={`/admin/blog/${b._id}/edit`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-xl">{b.coverEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600">
                      {b.title}
                    </p>
                    <p className="text-xs text-slate-400">{b.category} · {b.date}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors"
            >
              <span className="text-2xl">✍️</span>
              <div>
                <p className="font-semibold text-sm">Write New Post</p>
                <p className="text-xs text-blue-100">Create from scratch with rich editor</p>
              </div>
            </Link>
            <Link
              href="/admin/blog/new?tab=extract"
              className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-colors"
            >
              <span className="text-2xl">🔗</span>
              <div>
                <p className="font-semibold text-sm">Extract from URL</p>
                <p className="text-xs text-purple-100">Paste URL — AI fills the form</p>
              </div>
            </Link>
            <Link
              href="/blog"
              target="_blank"
              className="flex items-center gap-3 p-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
            >
              <span className="text-2xl">🌐</span>
              <div>
                <p className="font-semibold text-sm">View Public Blog</p>
                <p className="text-xs text-slate-500">See how your blog looks</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
