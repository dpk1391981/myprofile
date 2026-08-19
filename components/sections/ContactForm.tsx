"use client";
import { useState } from "react";
import { IconLoader2, IconSend } from "@tabler/icons-react";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";

type Status = "idle" | "sending" | "sent" | "error";

/** The enquiry form — posts to the existing /api/hire/submit handler. */
export default function ContactForm() {
  const [form, setForm] = useState({ organisation: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/hire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      setForm({ organisation: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="bs-alert" role="status">
        <p style={{ fontWeight: 600 }}>Message received.</p>
        <p className="bs-mt-1">
          It is in my inbox — I reply within 24 hours on working days. If it is urgent,
          call or WhatsApp +91 82852 57636.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
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
        />
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
        />
      </div>

      <div className="bs-field">
        <label className="bs-label" htmlFor="subject">What is this about</label>
        <input
          id="subject"
          name="subject"
          className="bs-input"
          value={form.subject}
          onChange={update}
          placeholder="Senior React role, MVP build, AI feature…"
          required
        />
      </div>

      <div className="bs-field">
        <label className="bs-label" htmlFor="message">The details</label>
        <textarea
          id="message"
          name="message"
          className="bs-textarea"
          value={form.message}
          onChange={update}
          placeholder="Scope, timeline, stack, budget range — whatever you already know. Rough is fine."
          required
        />
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
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <span className="bs-form-note">Reply within 24 hours. No newsletter, no follow-up spam.</span>
      </div>
    </form>
  );
}
