"use client";

import { useEffect, useState } from "react";
import {
  IconChevronDown,
  IconInbox,
  IconMailForward,
  IconTrash,
} from "@tabler/icons-react";
import PageHeader from "@/components/admin/PageHeader";

interface Contact {
  id: string;
  email: string;
  organisation?: string;
  subject: string;
  message?: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    setDeleting(id);
    await fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Contact Inquiries"
        description={
          loading
            ? "Loading…"
            : `${contacts.length} total inquir${contacts.length === 1 ? "y" : "ies"}`
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <IconInbox size={40} stroke={1.4} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-700">No inquiries yet</p>
          <p className="mt-1 text-sm text-slate-500">Messages from the contact form land here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => {
            const open = expanded === c.id;
            return (
              <div
                key={c.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 sm:px-5"
                  onClick={() => setExpanded(open ? null : c.id)}
                  aria-expanded={open}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold uppercase text-blue-600">
                    {c.email[0]}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-sm font-semibold text-slate-900">{c.email}</span>
                      {c.organisation && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {c.organisation}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm font-medium text-slate-700">{c.subject}</p>
                    {c.message && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{c.message}</p>
                    )}
                    {/* The timestamp moves inline on small screens instead of a second column */}
                    <p className="mt-1 text-xs text-slate-400 sm:hidden">{formatDate(c.createdAt)}</p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <span className="whitespace-nowrap text-xs text-slate-400">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <IconChevronDown
                    size={18}
                    stroke={2}
                    className={`mt-0.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                    <dl className="mb-4 grid gap-3 sm:grid-cols-2">
                      <Field label="Email">
                        <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">
                          {c.email}
                        </a>
                      </Field>
                      {c.organisation && <Field label="Organisation">{c.organisation}</Field>}
                      <Field label="Subject">{c.subject}</Field>
                      <Field label="Received">{formatDate(c.createdAt)}</Field>
                    </dl>

                    {c.message && (
                      <div className="mb-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Message
                        </p>
                        <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          {c.message}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        <IconMailForward size={15} stroke={1.9} /> Reply via Email
                      </a>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <IconTrash size={15} stroke={1.9} />
                        {deleting === c.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-700">{children}</dd>
    </div>
  );
}
