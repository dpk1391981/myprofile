import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — Blog Manager",
  robots: "noindex, nofollow",
};

/**
 * Admin pages are rendered per request, never prerendered.
 *
 * A statically prerendered page carries Next's own long `s-maxage` header,
 * which overrides the no-store set in next.config.js and middleware — that would
 * leave admin HTML sitting in a shared CDN cache. Nothing here is worth caching
 * anyway; every panel loads its data client-side.
 */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
