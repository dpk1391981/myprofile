"use client";
import React, { useState } from "react";

const LAYERS = [
  {
    id: "client",
    label: "Client Layer",
    color: "#3b82f6",
    items: [
      { name: "React.js", desc: "Component-based UI with hooks & RSC" },
      { name: "Next.js", desc: "SSR, ISR, App Router, Edge Functions" },
      { name: "Tailwind", desc: "Utility-first responsive styling" },
    ],
  },
  {
    id: "api",
    label: "API Layer",
    color: "#8b5cf6",
    items: [
      { name: "Node.js", desc: "Express/tRPC REST & GraphQL APIs" },
      { name: "WebSocket", desc: "Real-time data with Socket.io/SSE" },
      { name: "Auth", desc: "JWT, OAuth2, Session management" },
    ],
  },
  {
    id: "ai",
    label: "AI / ML Layer",
    color: "#f59e0b",
    items: [
      { name: "OpenAI", desc: "GPT-4 for content generation & summarization" },
      { name: "LangChain", desc: "RAG pipelines, embeddings, vector search" },
      { name: "ElevenLabs", desc: "AI voice synthesis for podcast generation" },
    ],
  },
  {
    id: "data",
    label: "Data Layer",
    color: "#22c55e",
    items: [
      { name: "MongoDB", desc: "Document store with Atlas Vector Search" },
      { name: "MySQL", desc: "Relational data for CMS & analytics" },
      { name: "Redis", desc: "Caching, pub/sub, session store" },
    ],
  },
  {
    id: "infra",
    label: "Infrastructure",
    color: "#ec4899",
    items: [
      { name: "AWS", desc: "EC2, S3, Lambda, CloudFront CDN" },
      { name: "Docker", desc: "Containerized microservices deployment" },
      { name: "CI/CD", desc: "GitHub Actions, automated testing & deploy" },
    ],
  },
];

const ArchDiagram = () => {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <section className="relative not-prose scroll-mt-[72px] py-2 md:py-5" id="architecture">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-4">
        <header className="section-header mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">How I Build</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Architecture & Tech Stack
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Tap any layer to explore. This is the production architecture I use across projects.
          </p>
        </header>

        <div className="arch-container">
          {/* Diagram */}
          <div className="arch-diagram">
            {LAYERS.map((layer, i) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                className={`arch-layer ${activeLayer === layer.id ? "arch-layer--active" : ""}`}
                style={{
                  borderColor: activeLayer === layer.id ? layer.color : undefined,
                  background: activeLayer === layer.id ? `${layer.color}08` : undefined,
                }}
              >
                {/* Connection line */}
                {i < LAYERS.length - 1 && (
                  <div className="arch-connector" aria-hidden="true">
                    <svg width="2" height="20" viewBox="0 0 2 20">
                      <line x1="1" y1="0" x2="1" y2="20" stroke={layer.color} strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
                    </svg>
                  </div>
                )}

                <div className="arch-layer-dot" style={{ background: layer.color }} />
                <div className="flex-1 min-w-0">
                  <p className="arch-layer-label" style={{ color: layer.color }}>{layer.label}</p>
                  <div className="arch-layer-items">
                    {layer.items.map((item) => (
                      <span key={item.name} className="arch-layer-chip">{item.name}</span>
                    ))}
                  </div>
                </div>
                <svg className="arch-layer-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {activeLayer && (
            <div className="arch-detail">
              {LAYERS.filter((l) => l.id === activeLayer).map((layer) => (
                <div key={layer.id}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: layer.color }}>{layer.label}</h3>
                  <div className="space-y-3">
                    {layer.items.map((item) => (
                      <div key={item.name} className="arch-detail-card">
                        <div className="arch-detail-dot" style={{ background: layer.color }} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArchDiagram;