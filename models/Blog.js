import { Schema, model, models } from "mongoose";

const BlogSchema = new Schema(
  {
    // ── Core content ──────────────────────────────────────────────────
    slug:        { type: String, required: true, unique: true, trim: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    content:     { type: String, required: true },
    tags:        { type: [String], default: [] },
    category:    { type: String, default: "JavaScript" },
    coverEmoji:  { type: String, default: "📝" },
    readTime:    { type: String, default: "5 min read" },
    featured:    { type: Boolean, default: false },
    status:      { type: String, enum: ["draft", "published"], default: "draft" },
    date:        { type: String },   // YYYY-MM-DD
    sourceUrl:   { type: String, default: "" },

    // ── Per-article SEO — all managed from admin ──────────────────────
    seoTitle:       { type: String, default: "" },   // overrides auto title in <head>
    seoDescription: { type: String, default: "" },   // meta description (~155 chars)
    focusKeyword:   { type: String, default: "" },   // primary target keyword
    seoKeywords:    { type: [String], default: [] },  // extra keyword list
    ogImage:        { type: String, default: "" },   // open graph image URL
    canonicalUrl:   { type: String, default: "" },   // canonical override
    robots:         { type: String, default: "index, follow" },
    noIndex:        { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Blog = models.Blog || model("Blog", BlogSchema);
export default Blog;
