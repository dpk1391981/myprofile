"use client";
import React, { useState } from "react";
import { IconChevronDown, IconChevronUp, IconTargetArrow, IconUsers, IconClock, IconServer } from "@tabler/icons-react";

interface CaseStudyData {
  emoji: string;
  title: string;
  subtitle: string;
  metrics: { icon: React.ReactNode; value: string; label: string }[];
  challenge: string;
  approach: string[];
  techDecisions: { decision: string; reason: string }[];
  result: string;
}

const CASE_STUDIES: CaseStudyData[] = [
  {
    emoji: "🗳️",
    title: "Election Dashboard at Scale",
    subtitle: "India Today Group · 2024",
    metrics: [
      { icon: <IconUsers size={16} />, value: "5M+", label: "Concurrent Users" },
      { icon: <IconClock size={16} />, value: "<500ms", label: "Update Latency" },
      { icon: <IconServer size={16} />, value: "99.99%", label: "Uptime" },
      { icon: <IconTargetArrow size={16} />, value: "543", label: "Constituencies" },
    ],
    challenge: "Display real-time results for 543 Lok Sabha constituencies to millions of concurrent viewers on election night, with sub-second updates and zero tolerance for downtime.",
    approach: [
      "Chose Server-Sent Events over WebSocket — one-way data, works through CDN, handles millions of connections",
      "Redis pub/sub for broadcasting — when a result arrives, all gateway instances push to clients within 200ms",
      "React + Canvas for India map — 543 constituency polygons rendered on Canvas, React handles controls",
      "Edge caching for static assets, dynamic SSE for live data — hybrid CDN strategy",
    ],
    techDecisions: [
      { decision: "SSE over WebSocket", reason: "Simpler, CDN-compatible, better for one-way broadcast to millions" },
      { decision: "Canvas over SVG/DOM", reason: "DOM chokes at 543 interactive polygons; Canvas renders smoothly" },
      { decision: "Redis pub/sub", reason: "Decouples data ingestion from client delivery, horizontally scalable" },
    ],
    result: "Handled election night traffic seamlessly — became one of India Today's most-visited features. Zero downtime during peak load.",
  },
  {
    emoji: "🤖",
    title: "AI Podcast Generation Platform",
    subtitle: "Enterprise Media · 2025",
    metrics: [
      { icon: <IconClock size={16} />, value: "80%", label: "Time Saved" },
      { icon: <IconServer size={16} />, value: "< 2min", label: "Article → Audio" },
      { icon: <IconTargetArrow size={16} />, value: "1000+", label: "Episodes Generated" },
      { icon: <IconUsers size={16} />, value: "3 APIs", label: "AI Services" },
    ],
    challenge: "Editorial teams spent hours manually recording and editing podcasts from written articles. Needed an automated pipeline that preserves journalistic quality.",
    approach: [
      "Article → GPT-4 prompt → structured podcast script with intro, body, transitions, and outro",
      "Script → ElevenLabs voice synthesis with multiple voice profiles for variety",
      "Editorial dashboard for review, approval, and metadata management before publishing",
      "Queue-based processing with retry logic for API rate limits and failures",
    ],
    techDecisions: [
      { decision: "GPT-4 for scripting", reason: "Best at converting journalistic prose into natural spoken-word format" },
      { decision: "ElevenLabs over AWS Polly", reason: "More natural voices, better emotional range for news content" },
      { decision: "Queue-based pipeline", reason: "Handles API rate limits gracefully, enables batch processing" },
    ],
    result: "Reduced podcast production from 3+ hours to under 2 minutes per article. Editorial teams now publish daily AI-generated podcast episodes.",
  },
];

const CaseStudyCard = ({ study }: { study: CaseStudyData }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="case-study-card">
      {/* Header with metrics */}
      <div className="case-study-header">
        <span className="text-3xl">{study.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900">{study.title}</h3>
          <p className="text-xs text-slate-500">{study.subtitle}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="case-study-metrics">
        {study.metrics.map((m, i) => (
          <div key={i} className="case-study-metric">
            <span className="case-study-metric-icon">{m.icon}</span>
            <p className="text-lg font-bold text-slate-900">{m.value}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Challenge */}
      <div className="case-study-section">
        <p className="case-study-section-label">The Challenge</p>
        <p className="text-sm text-slate-600 leading-relaxed">{study.challenge}</p>
      </div>

      {/* Expand for full details */}
      <button onClick={() => setExpanded(!expanded)} className="project-expand-btn mt-2">
        {expanded ? "Less" : "Full Case Study"}
        {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="case-study-expanded">
          {/* Approach */}
          <div className="case-study-section">
            <p className="case-study-section-label">My Approach</p>
            <ol className="case-study-steps">
              {study.approach.map((step, i) => (
                <li key={i}>
                  <span className="case-study-step-num">{i + 1}</span>
                  <span className="text-sm text-slate-600">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tech decisions */}
          <div className="case-study-section">
            <p className="case-study-section-label">Key Technical Decisions</p>
            <div className="space-y-2">
              {study.techDecisions.map((td, i) => (
                <div key={i} className="case-study-decision">
                  <p className="text-sm font-bold text-slate-900">{td.decision}</p>
                  <p className="text-xs text-slate-500">{td.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="case-study-section">
            <p className="case-study-section-label">Result</p>
            <p className="text-sm text-green-700 font-semibold bg-green-50 px-4 py-3 rounded-12 border border-green-200">
              {study.result}
            </p>
          </div>
        </div>
      )}
    </article>
  );
};

const CaseStudies = () => {
  return (
    <section className="relative not-prose scroll-mt-[72px] py-10 md:py-14 bg-slate-50/60" id="case-studies">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="section-header section-header-center text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Deep Dives</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Engineering Case Studies
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            How I solve real engineering challenges — the decisions, trade-offs, and results.
          </p>
        </header>

        <div className="space-y-5">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudyCard key={i} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;