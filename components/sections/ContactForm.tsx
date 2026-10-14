"use client";
import { useState } from "react";
import { IconLoader2, IconSend } from "@tabler/icons-react";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";

type Status = "idle" | "sending" | "sent" | "error";

/** "work" is the original hire/project enquiry. "sponsored" is a request for a
 *  sponsored post — same endpoint and inbox; the server labels it. */
export type EnquiryKind = "work" | "sponsored";

const EMPTY = { organisation: "", email: "", subject: "", message: "", website: "" };

const COPY: Record<EnquiryKind, { subject: string; message: string; button: string }> = {
  work: {
    subject: "Senior React role, MVP build, AI feature…",
    message: "Scope, timeline, stack, budget range — whatever you already know. Rough is fine.",
    button: "Send message",
  },
  sponsored: {
    subject: "Review of our vector database, launch post…",
    message:
      "What the product does, who it is for, what you want the post to cover, any deadline. I only write about things I can try myself.",
    button: "Send sponsorship request",
  },
};

/** The upstream contact route rejects anything shorter. Enforced here too so a
 *  two-word message is caught before a round trip. */
const MIN_MESSAGE = 10;

/** The enquiry form — posts to the existing /api/hire/submit handler.
 *  `kind` sets the starting tab; `lockKind` hides the switch (the /sponsor
 *  page only ever takes sponsorship requests). */
export default function ContactForm({
  kind: initialKind = "work",
  lockKind = false,
}: { kind?: EnquiryKind; lockKind?: boolean } = {}) {
  const [kind, setKind] = useState<EnquiryKind>(initialKind);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  // Per-field messages from the API — the API writes them for a human to read,
  // so they are rendered verbatim rather than remapped here.
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => {
      if (!prev[e.target.name]) return prev;
      const { [e.target.name]: _dropped, ...rest } = prev;
      return rest;
    });
  };

  // `kind` and `website` are sent as-is; /api/hire/submit labels the subject
  // and folds the link into the message, so the admin email and inbox row are
  // marked by the server rather than by whatever the browser sends.
  const payload = () => ({ ...form, kind });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/hire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        // A rejected enquiry is not an outage: show what needs fixing rather
        // than the generic "that did not send".
        const fields = (body?.errors ?? null) as Record<string, string> | null;
        if (fields && Object.keys(fields).length) {
          setErrors(fields);
          setStatus("idle");
          return;
        }
        throw new Error(body?.msg || "Request failed");
      }

      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? (
      <span className="bs-form-note" role="alert" style={{ color: "var(--bs-danger, #c0392b)" }}>
        {errors[name]}
      </span>
    ) : null;

  if (status === "sent") {
    return (
      <div className="bs-alert" role="status">
        <p style={{ fontWeight: 600 }}>
          {kind === "sponsored" ? "Sponsorship request received." : "Message received."}
        </p>
        <p className="bs-mt-1">
          {kind === "sponsored"
            ? "I will read the brief, try the product if I can, and reply within 24 hours on working days with a yes and a quote, or an honest no."
            : "It is in my inbox — I reply within 24 hours on working days. If it is urgent, call or WhatsApp +91 82852 57636."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {lockKind ? null : (
        <div className="bs-kind" role="radiogroup" aria-label="What kind of enquiry">
          <button
            type="button"
            role="radio"
            aria-checked={kind === "work"}
            className="bs-kind__opt"
            onClick={() => setKind("work")}
          >
            Hiring or a project
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={kind === "sponsored"}
            className="bs-kind__opt bs-kind__opt--new"
            onClick={() => setKind("sponsored")}
          >
            Sponsored post <span className="bs-new-badge">New</span>
          </button>
        </div>
      )}

      <div className="bs-field">
        <label className="bs-label" htmlFor="organisation">Your name or company</label>
        <input
          id="organisation"
          name="organisation"
          className="bs-input"
          value={form.organisation}
          onChange={update}
          placeholder="Acme Ltd, or your own name"
          required
          aria-invalid={errors.organisation ? true : undefined}
        />
        {fieldError("organisation")}
      </div>

      <div className="bs-field">
        <label className="bs-label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="bs-input"
          value={form.email}
          onChange={update}
          placeholder="you@company.com"
          required
          aria-invalid={errors.email ? true : undefined}
        />
        {fieldError("email")}
      </div>

      {kind === "sponsored" ? (
        <div className="bs-field">
          <label className="bs-label" htmlFor="website">Product or website link</label>
          <input
            id="website"
            name="website"
            type="url"
            className="bs-input"
            value={form.website}
            onChange={update}
            placeholder="https://yourproduct.com"
            required
          />
        </div>
      ) : null}

      <div className="bs-field">
        <label className="bs-label" htmlFor="subject">What is this about</label>
        <input
          id="subject"
          name="subject"
          className="bs-input"
          value={form.subject}
          onChange={update}
          placeholder={COPY[kind].subject}
          required
          aria-invalid={errors.subject ? true : undefined}
        />
        {fieldError("subject")}
      </div>

      <div className="bs-field">
        <label className="bs-label" htmlFor="message">The details</label>
        <textarea
          id="message"
          name="message"
          className="bs-textarea"
          value={form.message}
          onChange={update}
          placeholder={COPY[kind].message}
          required
          minLength={MIN_MESSAGE}
          aria-invalid={errors.message ? true : undefined}
        />
        {fieldError("message")}
      </div>

      {status === "error" ? (
        <div className="bs-alert bs-alert--error" role="alert">
          {PERSONAL_INFO.email
            ? `That did not send. Email me directly at ${PERSONAL_INFO.email} and it will reach me.`
            : "That did not send. Please try again in a moment."}
        </div>
      ) : null}

      <div className="bs-actions" style={{ alignItems: "center" }}>
        <button type="submit" className="bs-btn bs-btn--solid" disabled={status === "sending"}>
          {status === "sending" ? <IconLoader2 size={17} className="bs-spin" /> : <IconSend size={17} />}
          {status === "sending" ? "Sending…" : COPY[kind].button}
        </button>
        <span className="bs-form-note">Reply within 24 hours. No newsletter, no follow-up spam.</span>
      </div>
    </form>
  );
}
