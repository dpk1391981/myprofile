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

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconLoader2, IconMailCheck, IconAlertTriangle, IconLock, IconBookmark } from "@tabler/icons-react";

/**
 * Where a confirmed reader's token is remembered.
 *
 * Set on confirmation and read here so someone who already signed up is not
 * asked to sign up again every time they open a book page — being re-pitched
 * something you already own is the fastest way to feel like a lead rather than
 * a reader. localStorage rather than a cookie: it never needs to reach the
 * server, and the page must render correctly when it is missing (private
 * window, cleared data, a different device), which is why every read is
 * wrapped and falls back to showing the form.
 */
const TOKEN_KEY = "books.readToken";

export function rememberReadToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked — the emailed link still works, so this is not fatal */
  }
}

function readStoredToken(): string {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

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
  // Read after mount, never during render: localStorage does not exist on the
  // server, and reading it during render would desync the markup Next
  // prerendered from what the browser paints.
  const [savedToken, setSavedToken] = useState("");
  useEffect(() => setSavedToken(readStoredToken()), []);

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

  // Already confirmed on this device — offer the copy rather than the form.
  if (savedToken && state === "idle") {
    return (
      <div style={{ padding: "26px 24px", border: "1px solid var(--rule)", borderRadius: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconBookmark size={18} />
          <h3 className="bs-h4" style={{ margin: 0, fontSize: 19 }}>You already have this book</h3>
        </div>
        <p className="bs-small bs-quiet" style={{ marginTop: 10 }}>
          Your email is confirmed, so the printable copy is ready whenever you want it.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
          <Link href={`/books/${slug}/read?token=${encodeURIComponent(savedToken)}`}
                className="bs-btn bs-btn--solid bs-btn--sm">
            Open the printable copy
          </Link>
          <button type="button" onClick={() => setSavedToken("")}
                  className="bs-btn bs-btn--outline bs-btn--sm">
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div style={{ padding: "26px 24px", textAlign: "center", border: "1px solid var(--rule)", borderRadius: 2, background: "var(--surface)" }}>
        <IconMailCheck size={30} style={{ margin: "0 auto", color: "var(--spot)" }} />
        <h3 className="bs-h4" style={{ marginTop: 12, fontSize: 19 }}>Check your inbox</h3>
        <p className="bs-small" style={{ marginTop: 8 }}>{message}</p>
        <p className="bs-small bs-quiet" style={{ marginTop: 14, fontSize: 13 }}>
          Nothing arrives until you click that link. If it is not there in a few minutes,
          look in spam — and mark it "not spam" so the book itself lands properly.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "26px 24px", border: "1px solid var(--rule)", borderRadius: 2 }}>
      <div className="flex items-center gap-2 text-slate-900">
        <IconLock size={18} />
        <h3 className="bs-h4" style={{ margin: 0, fontSize: 19 }}>Keep a copy of all {pages} pages</h3>
      </div>
      <p className="bs-small bs-quiet" style={{ marginTop: 10 }}>
        The book is free to read above — this is for the printable single-file copy.
        One email with the link, and occasional notes when there is a new book. No
        other mail, and one-click unsubscribe in every message.
      </p>

      <form onSubmit={submit} style={{ marginTop: 18, display: "grid", gap: 12 }}>
        <div>
          <label htmlFor="gate-name" className="sr-only">Your name</label>
          <input
            id="gate-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            autoComplete="name"
            style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid var(--rule)", borderRadius: 2, background: "var(--paper)", color: "var(--ink)", fontFamily: "inherit" }}
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
            style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid var(--rule)", borderRadius: 2, background: "var(--paper)", color: "var(--ink)", fontFamily: "inherit" }}
          />
        </div>

        {state === "error" && (
          <p className="bs-small" style={{ display: "flex", gap: 8, color: "var(--mag)" }}>
            <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "sending"}
          className="bs-btn bs-btn--solid" style={{ width: "100%", justifyContent: "center" }}
        >
          {state === "sending" && <IconLoader2 size={16} className="animate-spin" />}
          {state === "sending" ? "Sending…" : `Send me ${bookTitle}`}
        </button>
      </form>

      <p className="bs-small bs-quiet" style={{ marginTop: 14, textAlign: "center", fontSize: 13 }}>
        Double opt-in. Your address is never sold, shared, or used for anything else.
      </p>
    </div>
  );
}
