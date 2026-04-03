"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogEditor from "./BlogEditor";
import UrlExtractor from "./UrlExtractor";

const CATEGORIES = [
  "React.js", "JavaScript", "TypeScript", "Node.js", "Next.js",
  "AI/ML", "System Design", "Career", "DevOps", "Database",
  "Performance", "Tools", "CSS", "Security",
];

const EMOJIS = [
  "📝", "⚛️", "🟨", "🔷", "🟢", "🤖", "🏗️", "💼", "🚀", "🗄️",
  "⚡", "🔧", "🎨", "🔐", "🌐", "📦", "🔍", "💡", "🧩", "🎯",
  "🛠️", "📊", "🔮", "🌟",
];

interface BlogData {
  _id?: string;
  // Content
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  coverEmoji: string;
  readTime: string;
  featured: boolean;
  status: "draft" | "published";
  date: string;
  sourceUrl?: string;
  // SEO
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  seoKeywords: string[];
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  noIndex: boolean;
}

const EMPTY: BlogData = {
  title: "", slug: "", description: "", content: "",
  tags: [], category: "JavaScript", coverEmoji: "📝",
  readTime: "5 min read", featured: false, status: "draft",
  date: new Date().toISOString().split("T")[0], sourceUrl: "",
  seoTitle: "", seoDescription: "", focusKeyword: "",
  seoKeywords: [], ogImage: "", canonicalUrl: "",
  robots: "index, follow", noIndex: false,
};

interface BlogFormProps { initial?: Partial<BlogData>; isEdit?: boolean; }

function slugify(t: string) {
  return t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

function CharBar({ len, max, warn }: { len: number; max: number; warn: number }) {
  const pct = Math.min((len / max) * 100, 100);
  const color = len === 0 ? "bg-slate-200" : len <= warn ? "bg-green-500" : len <= max ? "bg-amber-400" : "bg-red-500";
  const label = len === 0 ? "—" : len <= warn ? "✓ Good" : len <= max ? "⚠ OK" : "✗ Too long";
  const labelColor = len === 0 ? "text-slate-400" : len <= warn ? "text-green-600" : len <= max ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-semibold whitespace-nowrap ${labelColor}`}>{len}/{max} {label}</span>
    </div>
  );
}

function KeywordAnalyzer({ focusKeyword, title, description, content, slug }: {
  focusKeyword: string; title: string; description: string; content: string; slug: string;
}) {
  if (!focusKeyword) return (
    <p className="text-xs text-slate-400 italic">Set a focus keyword above to see analysis.</p>
  );
  const kw = focusKeyword.toLowerCase();
  const checks = [
    { label: "In SEO title / post title", ok: title.toLowerCase().includes(kw) },
    { label: "In meta description", ok: description.toLowerCase().includes(kw) },
    { label: "In URL slug", ok: slug.toLowerCase().includes(kw.replace(/\s+/g, "-")) },
    { label: "In article content", ok: content.toLowerCase().includes(kw) },
  ];
  const score = checks.filter((c) => c.ok).length;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          score === 4 ? "bg-green-100 text-green-700" :
          score >= 2 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
        }`}>
          {score}/4 {score === 4 ? "Excellent" : score >= 2 ? "Good" : "Needs work"}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            <span className={c.ok ? "text-green-500" : "text-slate-300"}>
              {c.ok ? "✓" : "○"}
            </span>
            <span className={c.ok ? "text-slate-700" : "text-slate-400"}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogForm({ initial, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BlogData>({ ...EMPTY, ...(initial || {}) });
  const [activeTab, setActiveTab] = useState<"content" | "seo">(
    searchParams?.get("tab") === "seo" ? "seo" : "content"
  );
  const [tagInput, setTagInput] = useState("");
  const [seoKwInput, setSeoKwInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showExtractor, setShowExtractor] = useState(searchParams?.get("tab") === "extract");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const slugEdited = useRef(isEdit);

  const siteUrl = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

  useEffect(() => {
    if (!slugEdited.current && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title) }));
    }
  }, [form.title]);

  function set<K extends keyof BlogData>(key: K, val: BlogData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !form.tags.includes(tag)) set("tags", [...form.tags, tag]);
      setTagInput("");
    }
  }

  function addSeoKw(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && seoKwInput.trim()) {
      e.preventDefault();
      const kw = seoKwInput.trim().replace(/,$/, "");
      if (kw && !form.seoKeywords.includes(kw)) set("seoKeywords", [...form.seoKeywords, kw]);
      setSeoKwInput("");
    }
  }

  function handleExtracted(data: any) {
    setForm((f) => ({
      ...f,
      title: data.title || f.title,
      slug: data.slug || slugify(data.title || f.title),
      description: data.description || f.description,
      content: data.content || f.content,
      tags: data.tags || f.tags,
      category: data.category || f.category,
      coverEmoji: data.coverEmoji || f.coverEmoji,
      readTime: data.readTime || f.readTime,
      // SEO fields from extraction
      seoTitle: data.seoTitle || f.seoTitle,
      seoDescription: data.seoDescription || data.description || f.seoDescription,
      focusKeyword: data.focusKeyword || f.focusKeyword,
      seoKeywords: data.seoKeywords || f.seoKeywords,
    }));
    slugEdited.current = true;
    setShowExtractor(false);
  }

  async function save(publishOverride?: "draft" | "published") {
    setSaving(true);
    setError("");
    const payload = { ...form, status: publishOverride ?? form.status };
    try {
      const url = isEdit ? `/api/admin/blogs/${form._id}` : "/api/admin/blogs";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      router.push("/admin/blog");
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  // SEO preview values
  const previewTitle = form.seoTitle || form.title || "Post title";
  const previewDesc  = form.seoDescription || form.description || "Meta description will appear here...";
  const previewUrl   = `${siteUrl}/blog/${form.slug || "post-slug"}`;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Post" : "New Post"}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEdit ? `Editing: ${initial?.title}` : "Create a new blog post"}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.push("/admin/blog")}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => save("draft")} disabled={saving}
            className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 font-semibold transition-colors disabled:opacity-50">
            Save Draft
          </button>
          <button type="button" onClick={() => save("published")} disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />}
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* ── Main Tabs: Content | SEO ─────────────────────────────────── */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        {(["content", "seo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "content" ? "✏️ Content & Settings" : "🔍 SEO"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB 1 — CONTENT & SETTINGS
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "content" && (
        <>
          {/* AI extractor */}
          <div className="mb-5">
            <button type="button" onClick={() => setShowExtractor((s) => !s)}
              className="text-sm text-purple-700 font-semibold hover:text-purple-500 flex items-center gap-1.5">
              <span>{showExtractor ? "▲" : "▼"}</span>
              🤖 {showExtractor ? "Hide" : "Show"} AI URL Extractor
            </button>
            {showExtractor && <div className="mt-3"><UrlExtractor onExtracted={handleExtracted} /></div>}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: editor */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. How I Built a Real-Time Dashboard with React and WebSockets"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description / Summary
                </label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Short summary shown on the blog list page (1-2 sentences)"
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Content <span className="text-red-500">*</span>
                </label>
                <BlogEditor value={form.content} onChange={(html) => set("content", html)} />
              </div>
            </div>

            {/* Right: settings sidebar */}
            <div className="space-y-4">
              {/* Publishing */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Publishing</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                    <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-xs font-medium text-slate-700">⭐ Featured post</span>
                  </label>
                </div>
              </div>

              {/* Slug */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL Slug</h3>
                <p className="text-[11px] text-slate-400 mb-1.5">/blog/</p>
                <input type="text" value={form.slug}
                  onChange={(e) => { slugEdited.current = true; set("slug", e.target.value); }}
                  placeholder="my-post-slug"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1">Auto-generated from title</p>
              </div>

              {/* Category */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Category</h3>
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Cover Emoji */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cover Emoji</h3>
                <button type="button" onClick={() => setShowEmojiPicker((s) => !s)}
                  className="text-4xl mb-1 hover:scale-110 transition-transform">{form.coverEmoji}</button>
                {showEmojiPicker && (
                  <div className="grid grid-cols-6 gap-1 mt-2">
                    {EMOJIS.map((e) => (
                      <button key={e} type="button"
                        onClick={() => { set("coverEmoji", e); setShowEmojiPicker(false); }}
                        className={`text-lg p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${form.coverEmoji === e ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">Click to change</p>
              </div>

              {/* Tags */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {tag}
                      <button type="button" onClick={() => set("tags", form.tags.filter((t) => t !== tag))}
                        className="text-blue-400 hover:text-blue-700">×</button>
                    </span>
                  ))}
                </div>
                <input type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Type tag + Enter"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add</p>
              </div>

              {/* Read time + Source */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Read Time</h3>
                  <input type="text" value={form.readTime} onChange={(e) => set("readTime", e.target.value)}
                    placeholder="5 min read"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Source URL</h3>
                  <input type="url" value={form.sourceUrl || ""} onChange={(e) => set("sourceUrl", e.target.value)}
                    placeholder="https://original-article.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 2 — SEO
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "seo" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: SEO fields */}
          <div className="space-y-5">

            {/* SEO Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                SEO Title
              </label>
              <input type="text" value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder={form.title || "Article title (auto-used if blank)"}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1.5">
                <CharBar len={form.seoTitle.length || form.title.length} max={70} warn={60} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Leave blank to use article title. Target: <strong>50–60 chars</strong>. Include your primary keyword.
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                rows={3}
                placeholder={form.description || "Compelling description with primary keyword (130–160 chars)"}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="mt-1.5">
                <CharBar len={form.seoDescription.length || form.description.length} max={165} warn={160} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Leave blank to use article description. Shown in Google search results.
              </p>
            </div>

            {/* Focus Keyword */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Focus Keyword
              </label>
              <input type="text" value={form.focusKeyword}
                onChange={(e) => set("focusKeyword", e.target.value)}
                placeholder="e.g. React performance optimization"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Primary keyword you want to rank for.</p>
            </div>

            {/* Keyword analysis */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Keyword Analysis</p>
              <KeywordAnalyzer
                focusKeyword={form.focusKeyword}
                title={form.seoTitle || form.title}
                description={form.seoDescription || form.description}
                content={form.content.replace(/<[^>]+>/g, " ")}
                slug={form.slug}
              />
            </div>

            {/* Extra keywords */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Additional Keywords
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.seoKeywords.map((kw) => (
                  <span key={kw} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {kw}
                    <button type="button"
                      onClick={() => set("seoKeywords", form.seoKeywords.filter((k) => k !== kw))}
                      className="text-green-400 hover:text-green-700">×</button>
                  </span>
                ))}
              </div>
              <input type="text" value={seoKwInput}
                onChange={(e) => setSeoKwInput(e.target.value)}
                onKeyDown={addSeoKw}
                placeholder="Type keyword + Enter"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">These are added to the &lt;meta keywords&gt; tag alongside post tags.</p>
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">OG Image URL</label>
              <input type="url" value={form.ogImage}
                onChange={(e) => set("ogImage", e.target.value)}
                placeholder="https://your-site.com/og-images/post.png (1200×630)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Shown when shared on Twitter, LinkedIn, Facebook. Recommended: 1200×630px.
              </p>
            </div>

            {/* Canonical + Robots */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Robots</label>
                <select value={form.robots} onChange={(e) => set("robots", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Canonical URL</label>
                <input type="url" value={form.canonicalUrl}
                  onChange={(e) => set("canonicalUrl", e.target.value)}
                  placeholder={`${siteUrl}/blog/${form.slug}`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Preview panel */}
          <div className="space-y-5">
            {/* Google preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-24">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Google Search Preview
              </p>
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">G</div>
                  <p className="text-xs text-slate-500 truncate">{previewUrl}</p>
                </div>
                <p className="text-[17px] text-blue-700 leading-snug line-clamp-2 cursor-pointer hover:underline font-medium">
                  {(previewTitle + " | Deepak Kumar").length > 63
                    ? (previewTitle + " | Deepak Kumar").slice(0, 60) + "..."
                    : previewTitle + " | Deepak Kumar"}
                </p>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {previewDesc.length > 160 ? previewDesc.slice(0, 157) + "..." : previewDesc}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Indicators</p>
                {[
                  { label: "SEO Title", len: previewTitle.length + " | Deepak Kumar".length, max: 70, warn: 60 },
                  { label: "Meta Description", len: previewDesc.length, max: 165, warn: 160 },
                ].map((i) => (
                  <div key={i.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-500">{i.label}</span>
                      <span className="text-slate-400">{i.len} chars</span>
                    </div>
                    <CharBar len={Number(i.len)} max={i.max} warn={i.warn} />
                  </div>
                ))}
              </div>

              {/* Twitter preview */}
              <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Twitter / X Card</p>
                </div>
                <div className="p-3">
                  {form.ogImage && (
                    <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 overflow-hidden">
                      <img src={form.ogImage} alt="OG" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                  {!form.ogImage && (
                    <div className="w-full h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-2 flex items-center justify-center text-slate-400 text-xs">
                      No OG image set
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">{siteUrl.replace("https://", "")}</p>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{previewTitle}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{previewDesc}</p>
                </div>
              </div>

              {/* SEO tips */}
              <div className="mt-4 bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-2">SEO Tips</p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                  <li>Title: 50–60 chars, keyword near the start</li>
                  <li>Description: 130–160 chars, include keyword</li>
                  <li>Use focus keyword in first paragraph</li>
                  <li>Use H2/H3 headings with keyword variations</li>
                  <li>Minimum 800 words for good ranking</li>
                  <li>Link to 2-3 related internal articles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
