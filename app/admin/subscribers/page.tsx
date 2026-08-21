"use client";

/**
 * The email list.
 *
 * Confirmed vs unconfirmed is the number that matters: an unconfirmed row is a
 * person who typed an address and never clicked the link, and mailing them is
 * how a sending domain gets burned. Only the confirmed count is a list.
 */

import { useEffect, useState } from "react";
import { IconLoader2, IconMailCheck, IconMailX, IconDownload } from "@tabler/icons-react";
import PageHeader from "@/components/admin/PageHeader";
import { formatISTDate } from "@/components/utils/date";

type Row = {
  id: number; email: string; name: string; bookTitle: string;
  confirmedAt: string | null; unsubscribedAt: string | null; createdAt: string | null;
};

export default function SubscribersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/subscribers", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load subscribers");
        setRows(data.subscribers || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const confirmed = rows.filter((r) => r.confirmedAt && !r.unsubscribedAt);

  function exportCsv() {
    // Confirmed and not unsubscribed only. Exporting the raw table would hand
    // you a file whose obvious use — pasting into a mail tool — is the one
    // thing that must not happen with unconfirmed addresses.
    const csv = [
      "email,name,book,confirmed_at",
      ...confirmed.map((r) =>
        [r.email, r.name, r.bookTitle, r.confirmedAt ?? ""]
          .map((f) => `"${String(f).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Subscribers"
        description={`${confirmed.length} confirmed of ${rows.length} signups`}
        actions={
          confirmed.length > 0 && (
            <button onClick={exportCsv}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm hover:bg-slate-50">
              <IconDownload size={16} /> Export confirmed
            </button>
          )
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <IconLoader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">
          No signups yet. Publish a book with the email gate on.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Signed up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.email}</p>
                    {r.name && <p className="text-xs text-slate-500">{r.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.bookTitle || "—"}</td>
                  <td className="px-4 py-3">
                    {r.unsubscribedAt ? (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <IconMailX size={14} /> Unsubscribed
                      </span>
                    ) : r.confirmedAt ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <IconMailCheck size={14} /> Confirmed
                      </span>
                    ) : (
                      <span className="text-amber-600">Awaiting confirmation</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.createdAt ? formatISTDate(r.createdAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
