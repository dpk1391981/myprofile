"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArticle,
  IconCircleCheck,
  IconNote,
  IconStar,
  IconPencilPlus,
  IconLink,
  IconWorld,
  IconArrowRight,
  IconInbox,
  type TablerIconsProps,
} from "@tabler/icons-react";
import GenerateContentCta from "@/components/admin/GenerateContentCta";
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
  createdAt: string;
}

type Stat = {
  label: string;
  value: number;
  icon: (p: TablerIconsProps) => JSX.Element;
  tone: string;
};

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
  const recent = [...blogs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats: Stat[] = [
    { label: "Total Posts", value: blogs.length, icon: IconArticle, tone: "bg-blue-50 text-blue-600" },
    { label: "Published", value: published, icon: IconCircleCheck, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Drafts", value: drafts, icon: IconNote, tone: "bg-amber-50 text-amber-600" },
    { label: "Featured", value: featured, icon: IconStar, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="Dashboard" description="Welcome back, Deepak — here's your content at a glance." />

      <GenerateContentCta />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <Icon size={18} stroke={1.8} />
            </div>
            <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {loading ? <span className="text-slate-300">—</span> : value}
            </div>
            <div className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
        {/* Recent posts */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">Recent Posts</h2>
            <Link
              href="/admin/blog"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all <IconArrowRight size={14} stroke={2} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2 p-4 sm:p-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <IconInbox size={32} stroke={1.5} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">
                No posts yet.{" "}
                <Link href="/admin/blog/new" className="font-medium text-blue-600 hover:underline">
                  Create your first post
                </Link>
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/blog/${b.id}/edit`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                      {b.coverEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-slate-900 group-hover:text-blue-600">
                        {b.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {b.category} · {b.date}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        b.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="space-y-2 p-4 sm:p-5">
            <QuickAction
              href="/admin/blog/new"
              icon={IconPencilPlus}
              title="Write New Post"
              hint="Create from scratch with the rich editor"
            />
            <QuickAction
              href="/admin/blog/new?tab=extract"
              icon={IconLink}
              title="Extract from URL"
              hint="Paste a URL — AI fills the form"
            />
            <QuickAction
              href="/blog"
              icon={IconWorld}
              title="View Public Blog"
              hint="See how your blog looks"
              external
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  hint,
  external,
}: {
  href: string;
  icon: (p: TablerIconsProps) => JSX.Element;
  title: string;
  hint: string;
  external?: boolean;
}) {
  const className =
    "group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/60";
  const body = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={18} stroke={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block truncate text-xs text-slate-500">{hint}</span>
      </span>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
