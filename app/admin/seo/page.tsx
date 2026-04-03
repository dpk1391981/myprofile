"use client";

import { useState, useEffect } from "react";

const TABS = [
  { key: "blog-index", label: "📋 Blog Listing Page", desc: "SEO for /blog" },
  { key: "blog-defaults", label: "📄 Article Defaults", desc: "Applied to all articles" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface SeoFormData {
  key: string;
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterCreator: string;
  robots: string;
  canonicalUrl: string;
  titleSuffix: string;
  defaultKeywords: string[];
}

const EMPTY = (key: string): SeoFormData => ({
  key,
  pageTitle: "",
  metaDescription: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterCreator: "@deepakkutniyal",
  robots: "index, follow",
  canonicalUrl: "",
  titleSuffix: " | Deepak Kumar",
  defaultKeywords: [],
});

function CharCount({ value, max, warn }: { value: string; max: number; warn: number }) {
  const len = value.length;
  const color =
    len === 0 ? "text-slate-400" :
    len <= warn ? "text-green-600" :
    len <= max ? "text-amber-600" :
    "text-red-600";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {len}/{max}
    </span>
  );
}

function KeywordInput({
  label, values, onChange,
}: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  function add(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const kw = input.trim().replace(/,$/, "");
      if (kw && !values.includes(kw)) onChange([...values, kw]);
      setInput("");
    }
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {values.map((kw) => (
          <span key={kw} className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {kw}
            <button type="button" onClick={() => onChange(values.filter((k) => k !== kw))} className="text-blue-400 hover:text-blue-700 leading-none">×</button>
          </span>
        ))}
      </div>
      <input
        type="text" value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={add}
        placeholder="Type keyword + Enter to add"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function SeoAdminPage() {
  const [tab, setTab] = useState<TabKey>("blog-index");
  const [forms, setForms] = useState<Record<TabKey, SeoFormData>>({
    "blog-index": EMPTY("blog-index"),
    "blog-defaults": EMPTY("blog-defaults"),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const map: any = {
          "blog-index":    EMPTY("blog-index"),
          "blog-defaults": EMPTY("blog-defaults"),
        };
        for (const c of data.configs || []) {
          if (c.key in map) map[c.key] = { ...map[c.key], ...c };
        }
        setForms(map);
      })
      .catch(() => {
        // Keep default empty forms; user will see blank fields they can fill in
      })
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof SeoFormData, val: any) {
    setForms((f) => ({ ...f, [tab]: { ...f[tab], [field]: val } }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forms[tab]),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const form = forms[tab];
  const siteUrl = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

  // Google preview values
  const previewTitle = tab === "blog-index"
    ? (form.pageTitle || "Blog | Deepak Kumar — React, AI/ML Engineering")
    : `Article Title${form.titleSuffix || " | Deepak Kumar"}`;
  const previewDesc = form.metaDescription || "Your meta description will appear here...";
  const previewUrl = tab === "blog-index" ? `${siteUrl}/blog` : `${siteUrl}/blog/article-slug`;

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SEO Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage titles, descriptions, keywords and Open Graph for all blog pages.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />}
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSaved(false); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="block">{t.label}</span>
            <span className="text-xs font-normal opacity-60">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Google SERP Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Google Search Preview</p>
        <div className="space-y-0.5">
          <p className="text-xs text-slate-500 truncate">{previewUrl}</p>
          <p className="text-[17px] text-blue-700 font-medium leading-snug line-clamp-1 cursor-pointer hover:underline">
            {previewTitle.length > 60 ? previewTitle.slice(0, 60) + "..." : previewTitle}
          </p>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {previewDesc.length > 160 ? previewDesc.slice(0, 160) + "..." : previewDesc}
          </p>
        </div>
        {/* Char indicators */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Title length: </span>
            <span className={`font-semibold ${previewTitle.length <= 60 ? "text-green-600" : previewTitle.length <= 70 ? "text-amber-600" : "text-red-600"}`}>
              {previewTitle.length} chars {previewTitle.length <= 60 ? "✓" : previewTitle.length <= 70 ? "⚠ slightly long" : "✗ too long"}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Desc length: </span>
            <span className={`font-semibold ${previewDesc.length >= 120 && previewDesc.length <= 160 ? "text-green-600" : previewDesc.length < 120 ? "text-amber-600" : "text-red-600"}`}>
              {previewDesc.length} chars {previewDesc.length >= 120 && previewDesc.length <= 160 ? "✓" : previewDesc.length < 120 ? "⚠ too short" : "✗ too long"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Page Title / Title Suffix */}
        {tab === "blog-index" ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">Page Title (H1 + &lt;title&gt;)</label>
              <CharCount value={form.pageTitle} max={70} warn={60} />
            </div>
            <input
              type="text" value={form.pageTitle}
              onChange={(e) => set("pageTitle", e.target.value)}
              placeholder="Blog | Deepak Kumar — React, AI/ML Engineering"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Target: 50–60 chars. Used as &lt;title&gt; and og:title if OG title is empty.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">Article Title Suffix</label>
            </div>
            <input
              type="text" value={form.titleSuffix}
              onChange={(e) => set("titleSuffix", e.target.value)}
              placeholder=" | Deepak Kumar"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Appended after every article title. e.g. "How I Built X <em>| Deepak Kumar</em>"</p>
          </div>
        )}

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-600">Meta Description</label>
            <CharCount value={form.metaDescription} max={165} warn={160} />
          </div>
          <textarea
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            rows={3}
            placeholder={tab === "blog-index"
              ? "Technical blog by Deepak Kumar — React.js, AI/ML, MERN stack. Deep dives into performance, architecture, and production lessons."
              : "Default description used when article has no custom description set."}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">Target: 130–160 chars. Include primary keywords naturally.</p>
        </div>

        {/* Keywords */}
        {tab === "blog-index" ? (
          <KeywordInput label="Meta Keywords" values={form.keywords} onChange={(v) => set("keywords", v)} />
        ) : (
          <KeywordInput label="Default Keywords (added to every article)" values={form.defaultKeywords} onChange={(v) => set("defaultKeywords", v)} />
        )}

        {/* OG Section */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Open Graph (Facebook / LinkedIn)</p>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">OG Title</label>
              <CharCount value={form.ogTitle} max={95} warn={85} />
            </div>
            <input
              type="text" value={form.ogTitle}
              onChange={(e) => set("ogTitle", e.target.value)}
              placeholder="Leave blank to use Page Title"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">OG Description</label>
              <CharCount value={form.ogDescription} max={200} warn={185} />
            </div>
            <textarea
              value={form.ogDescription}
              onChange={(e) => set("ogDescription", e.target.value)}
              rows={2}
              placeholder="Leave blank to use Meta Description"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">OG Image URL</label>
            <input
              type="url" value={form.ogImage}
              onChange={(e) => set("ogImage", e.target.value)}
              placeholder="https://your-site.com/og-blog.png (1200×630px recommended)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Twitter Section */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Twitter / X Card</p>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">Twitter Title</label>
              <CharCount value={form.twitterTitle} max={70} warn={60} />
            </div>
            <input
              type="text" value={form.twitterTitle}
              onChange={(e) => set("twitterTitle", e.target.value)}
              placeholder="Leave blank to use OG/Page Title"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Twitter Description</label>
            <textarea
              value={form.twitterDescription}
              onChange={(e) => set("twitterDescription", e.target.value)}
              rows={2}
              placeholder="Leave blank to use Meta Description"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Twitter Creator Handle</label>
            <input
              type="text" value={form.twitterCreator}
              onChange={(e) => set("twitterCreator", e.target.value)}
              placeholder="@deepakkutniyal"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Robots + Canonical */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Robots</label>
            <select
              value={form.robots}
              onChange={(e) => set("robots", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="index, follow">index, follow (default)</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Canonical URL Override</label>
            <input
              type="url" value={form.canonicalUrl}
              onChange={(e) => set("canonicalUrl", e.target.value)}
              placeholder={`${siteUrl}/blog`}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Save */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-green-600 text-sm font-semibold">✓ Saved successfully!</span>}
        </div>
      </div>
    </div>
  );
}
