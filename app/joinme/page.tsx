"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconArrowLeft, IconSend, IconLoader2 } from "@tabler/icons-react";

const JoinMePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organisation: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/hire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          router.push("/success");
          setFormData({ organisation: "", email: "", subject: "", message: "" });
        }
      } else {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] py-12 md:py-20 px-5 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="joinme-back-btn mb-8"
          aria-label="Go back to home"
        >
          <IconArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Header */}
        <header className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Join with me!
          </h1>
          <p className="text-base text-blue-600 font-medium">
            To Elevate Your Tech Vision
          </p>
        </header>

        {/* Form */}
        <div className="joinme-form-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <IconLoader2 size={36} className="animate-spin text-blue-500" />
              <p className="text-sm text-slate-500 font-medium">Sending your query...</p>
            </div>
          ) : (
            <div className="space-y-5" role="form">
              {/* Email */}
              <div>
                <label htmlFor="email" className="joinme-label">
                  Your email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="joinme-input"
                  autoComplete="email"
                />
              </div>

              {/* Organisation */}
              <div>
                <label htmlFor="organisation" className="joinme-label">
                  Your organisation <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="organisation"
                  name="organisation"
                  value={formData.organisation}
                  onChange={handleChange}
                  required
                  placeholder="Acme Inc."
                  className="joinme-input"
                  autoComplete="organization"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="joinme-label">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                  className="joinme-input"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="joinme-label">
                  Your message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Please detail your requirement..."
                  className="joinme-input joinme-textarea"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!formData.email || !formData.organisation || !formData.subject}
                className="joinme-submit-btn"
              >
                <IconSend size={18} />
                <span>Send Query</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JoinMePage;