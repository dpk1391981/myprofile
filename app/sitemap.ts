import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/components/utils/portfolio-data";
import { connectToDB } from "@/utils/database";
import BlogModel from "@/models/Blog";

const SITE_URL = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

// Static routes with crawl priorities tuned for a portfolio.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "",            priority: 1.0,  changeFrequency: "weekly" },
  { path: "/about",      priority: 0.9,  changeFrequency: "monthly" },
  { path: "/experience", priority: 0.9,  changeFrequency: "monthly" },
  { path: "/projects",   priority: 0.95, changeFrequency: "monthly" },
  { path: "/skills",     priority: 0.8,  changeFrequency: "monthly" },
  { path: "/education",  priority: 0.7,  changeFrequency: "monthly" },
  { path: "/reviews",    priority: 0.6,  changeFrequency: "monthly" },
  { path: "/joinme",     priority: 0.7,  changeFrequency: "monthly" },
  { path: "/blog",       priority: 0.9,  changeFrequency: "weekly" },
];

// Pull published blog posts from the DB (gracefully degrade if unavailable).
async function getDbBlogSlugs(): Promise<{ slug: string; date?: string }[]> {
  try {
    await connectToDB();
    const posts = await BlogModel.find({ status: "published" })
      .select({ slug: 1, date: 1, updatedAt: 1, createdAt: 1 })
      .lean();
    return posts.map((p: any) => ({
      slug: p.slug,
      date: p.updatedAt || p.date || p.createdAt,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Merge DB posts with static BLOG_POSTS (DB wins on slug collision).
  const dbPosts = await getDbBlogSlugs();
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  const staticPosts = BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug)).map((p) => ({
    slug: p.slug,
    date: p.date,
  }));

  const blogEntries: MetadataRoute.Sitemap = [...dbPosts, ...staticPosts].map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries];
}
