"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconLayoutDashboard,
  IconArticle,
  IconSquareRoundedPlus,
  IconMail,
  IconSearch,
  IconBook,
  IconUsers,
  IconExternalLink,
  IconLogout,
  IconMenu2,
  IconX,
  type TablerIconsProps,
} from "@tabler/icons-react";

const NAV: {
  href: string;
  label: string;
  icon: (p: TablerIconsProps) => JSX.Element;
  exact?: boolean;
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/admin/blog", label: "All Posts", icon: IconArticle, exact: true },
  { href: "/admin/blog/new", label: "New Post", icon: IconSquareRoundedPlus },
  { href: "/admin/books", label: "Books", icon: IconBook, exact: true },
  { href: "/admin/books/new", label: "New Book", icon: IconSquareRoundedPlus },
  { href: "/admin/subscribers", label: "Subscribers", icon: IconUsers },
  { href: "/admin/contacts", label: "Contacts", icon: IconMail },
  { href: "/admin/seo", label: "SEO Settings", icon: IconSearch },
];

/** Label shown in the top bar for the route currently open. */
function sectionLabel(pathname: string) {
  if (pathname.startsWith("/admin/blog/") && pathname.endsWith("/edit")) return "Edit Post";
  // /admin/books/{id} is a detail screen, not "New Book" — the longest-prefix
  // match below would otherwise land on whichever NAV entry shares the stem.
  if (/^\/admin\/books\/\d+$/.test(pathname)) return "Book";
  const match = NAV.filter((n) => pathname === n.href || pathname.startsWith(n.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Admin";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const isLogin = pathname === "/admin";

  // Navigating from inside the drawer should close it.
  useEffect(() => setDrawer(false), [pathname]);

  // The drawer is modal on small screens: lock the page behind it and let Esc out.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.body.classList.add("admin-scroll-lock");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("admin-scroll-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  // The login screen is its own full-bleed layout — no shell around it.
  if (isLogin) return <div className="admin-scope min-h-screen bg-slate-900">{children}</div>;

  return (
    <div className="admin-scope min-h-screen">
      {/* ---------- Sidebar (fixed on lg, off-canvas drawer below it) ---------- */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-slate-900 transition-transform duration-200 ease-out lg:translate-x-0 ${
          drawer ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        {/* Top-left: the way back to the public site. */}
        <div className="flex items-center gap-2 px-4 pt-4">
          <Link
            href="/"
            className="group flex flex-1 items-center gap-2 rounded-lg border border-slate-700/80 px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <IconArrowLeft size={16} stroke={2} className="transition-transform group-hover:-translate-x-0.5" />
            Back to home page
          </Link>
          <button
            type="button"
            onClick={() => setDrawer(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <IconX size={18} stroke={2} />
          </button>
        </div>

        {/* Identity */}
        <div className="mx-4 mt-4 flex items-center gap-3 border-b border-slate-800 pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            DK
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">Blog Admin</p>
            <p className="truncate text-xs text-slate-400">dpk1391981</p>
          </div>
        </div>

        {/* Sections */}
        <nav className="admin-nav-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Manage
          </p>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-900/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} stroke={1.8} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Foot of the rail */}
        <div className="space-y-1 border-t border-slate-800 px-3 py-3">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <IconExternalLink size={18} stroke={1.8} className="shrink-0" />
            View Blog
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-red-950/60 hover:text-red-300 disabled:opacity-60"
          >
            <IconLogout size={18} stroke={1.8} className="shrink-0" />
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Drawer backdrop */}
      {drawer && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setDrawer(false)}
          aria-hidden
        />
      )}

      {/* ---------- Content column ---------- */}
      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        {/* Slim admin bar: the mobile menu handle plus where you are. */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Open menu"
            aria-controls="admin-sidebar"
            aria-expanded={drawer}
          >
            <IconMenu2 size={20} stroke={2} />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-400">
              <span className="hidden sm:inline">Blog Admin </span>
              <span className="hidden sm:inline">/ </span>
              <span className="font-semibold text-slate-800">{sectionLabel(pathname)}</span>
            </p>
          </nav>

          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex lg:hidden"
          >
            <IconArrowLeft size={16} stroke={2} />
            Home
          </Link>
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <IconExternalLink size={16} stroke={2} />
            <span className="hidden sm:inline">View blog</span>
          </a>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
