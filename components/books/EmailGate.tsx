"use client";

/**
 * The email gate.
 *
 * The deal is stated plainly above the field, because the conversion killer on
 * a form like this is not friction — it is suspicion about what the address is
 * for. Saying "one email, the book, nothing else" converts better than any
 * amount of styling, and it is also true, which is the part that matters when
 * the same person gets a mail from this list six months later.
 *
 * The response is deliberately identical for a new and an existing address (see
 * the subscribe route): an endpoint that says "you are already subscribed" is
 * an email-enumeration oracle. So the success copy says "check your inbox",
 * which is correct either way.
 */

import { useState } from "react";
import { IconLoader2, IconMailCheck, IconAlertTriangle, IconLock } from "@tabler/icons-react";

export default function EmailGate({
  slug,
  bookTitle,
  pages,
}: {
  slug: string;
  bookTitle: string;
  pages: number;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const res = await fetch(`/api/books/${encodeURIComponent(slug)}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || data?.detail || "Something went wrong.");
      }
      setState("sent");
      setMessage(data.message || "Check your inbox and confirm.");
    } catch (err: any) {
      setState("error");
      setMessage(err.message || "Could not sign you up. Try again in a moment.");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <IconMailCheck size={32} className="mx-auto text-emerald-600" />
        <h3 className="mt-3 text-lg font-semibold text-emerald-900">Check your inbox</h3>
        <p className="mt-1.5 text-sm text-emerald-800">{message}</p>
        <p className="mt-3 text-xs text-emerald-700">
          Nothing arrives until you click that link. If it is not there in a few minutes,
          look in spam — and mark it "not spam" so the book itself lands properly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900">
        <IconLock size={18} />
        <h3 className="text-lg font-semibold">Read all {pages} pages, free</h3>
      </div>
      <p className="mt-1.5 text-sm text-slate-600">
        Confirm an email address and the whole book opens. One email with the link,
        and occasional notes when there is a new one. No other mail, and one-click
        unsubscribe in every message.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="gate-name" className="sr-only">Your name</label>
          <input
            id="gate-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            autoComplete="name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <div>
          <label htmlFor="gate-email" className="sr-only">Email address</label>
          <input
            id="gate-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {state === "error" && (
          <p className="flex items-start gap-2 text-sm text-red-600">
            <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {state === "sending" && <IconLoader2 size={16} className="animate-spin" />}
          {state === "sending" ? "Sending…" : `Send me ${bookTitle}`}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-slate-500">
        Double opt-in. Your address is never sold, shared, or used for anything else.
      </p>
    </div>
  );
}
