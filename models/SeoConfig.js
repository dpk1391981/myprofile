import { Schema, model, models } from "mongoose";

/**
 * Stores page-level SEO configuration managed from the admin panel.
 * Key "blog-index"    → /blog listing page
 * Key "blog-defaults" → default values applied to all article pages
 */
const SeoConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },

    // Core meta
    pageTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords:        { type: [String], default: [] },

    // Open Graph
    ogTitle:       { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage:       { type: String, default: "" },

    // Twitter
    twitterTitle:       { type: String, default: "" },
    twitterDescription: { type: String, default: "" },
    twitterCreator:     { type: String, default: "@deepakkutniyal" },

    // Robots / canonical
    robots:       { type: String, default: "index, follow" },
    canonicalUrl: { type: String, default: "" },

    // Article-defaults only fields
    titleSuffix:     { type: String, default: " | Deepak Kumar" },
    defaultKeywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

const SeoConfig = models.SeoConfig || model("SeoConfig", SeoConfigSchema);
export default SeoConfig;
