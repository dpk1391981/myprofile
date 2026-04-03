"use client";

import { useEffect, useState } from "react";

interface Contact {
  _id: string;
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
    setContacts((prev) => prev.filter((c) => c._id !== id));
    setDeleting(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Contact Inquiries</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loading ? "Loading…" : `${contacts.length} total inquir${contacts.length === 1 ? "y" : "ies"}`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-base font-medium">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Row */}
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === c._id ? null : c._id)}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                  {c.email[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{c.email}</span>
                    {c.organisation && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {c.organisation}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5 font-medium line-clamp-1">{c.subject}</p>
                  {c.message && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.message}</p>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-slate-400 whitespace-nowrap">{formatDate(c.createdAt)}</p>
                  <span className="text-xs text-blue-500 mt-1 block">
                    {expanded === c._id ? "▲ collapse" : "▼ expand"}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === c._id && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</p>
                      <a href={`mailto:${c.email}`} className="text-sm text-blue-600 hover:underline">
                        {c.email}
                      </a>
                    </div>
                    {c.organisation && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Organisation</p>
                        <p className="text-sm text-slate-700">{c.organisation}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Subject</p>
                      <p className="text-sm text-slate-700">{c.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Received</p>
                      <p className="text-sm text-slate-700">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>

                  {c.message && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Message</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Reply via Email
                    </a>
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deleting === c._id}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === c._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
