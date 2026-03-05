"use client";
import React, { useState, useRef } from "react";
import { IconSend, IconLoader2, IconSparkles, IconCode, IconArticle, IconBulb } from "@tabler/icons-react";

const DEMO_PROMPTS = [
  { icon: <IconCode size={16} />, label: "Explain React Server Components", prompt: "Explain React Server Components in 3 sentences for a frontend developer." },
  { icon: <IconArticle size={16} />, label: "Write a tech blog intro", prompt: "Write a compelling 2-sentence intro for a blog post about building RAG applications with LangChain and Node.js." },
  { icon: <IconBulb size={16} />, label: "Architecture advice", prompt: "What's the best architecture for a real-time election dashboard serving 5 million concurrent users? Give 3 key decisions in bullet points." },
];

const AIPlayground = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (promptText?: string) => {
    const query = promptText || input;
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/ai-playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      if (!res.ok) throw new Error("AI service unavailable");

      const data = await res.json();
      setOutput(data.response || "No response generated.");
    } catch {
      setError("AI playground is currently offline. This demo requires an API route at /api/ai-playground.");
      // Fallback demo response
      setOutput(
        `💡 **Demo Mode** — The AI playground needs a backend API route.\n\nTo enable it, create \`app/api/ai-playground/route.ts\` with your OpenAI key.\n\nYour query was: "${query}"\n\nThis demonstrates how I integrate AI into production applications — from content generation at India Today to RAG-powered search systems.`
      );
    } finally {
      setLoading(false);
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="relative not-prose scroll-mt-[72px] py-10 md:py-14" id="ai-playground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="section-header section-header-center text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
            <IconSparkles size={14} className="inline mr-1" />
            Live Demo
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            AI Engineering Playground
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Try it — ask anything about React, architecture, or AI. This is the kind of AI integration I build in production.
          </p>
        </header>

        <div className="ai-playground-card">
          {/* Quick prompts */}
          <div className="ai-quick-prompts">
            {DEMO_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => { setInput(p.prompt); handleSubmit(p.prompt); }}
                className="ai-quick-btn"
                disabled={loading}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="ai-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ask about React, AI, architecture..."
              className="ai-input"
              disabled={loading}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !input.trim()}
              className="ai-send-btn"
              aria-label="Send"
            >
              {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconSend size={18} />}
            </button>
          </div>

          {/* Output */}
          {(output || error) && (
            <div ref={outputRef} className="ai-output">
              {error && <p className="text-xs text-amber-600 mb-2">{error}</p>}
              <div className="ai-output-text" dangerouslySetInnerHTML={{
                __html: output
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/`(.*?)`/g, "<code>$1</code>")
                  .replace(/\n/g, "<br/>")
              }} />
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center mt-3">
            Powered by the same AI stack I use at India Today Group — OpenAI + LangChain + Node.js
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIPlayground;