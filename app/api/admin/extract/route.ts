import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import axios from "axios";
import OpenAI from "openai";

function requireAuth() {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const CATEGORIES = [
  "React.js", "JavaScript", "TypeScript", "Node.js", "Next.js",
  "AI/ML", "System Design", "Career", "DevOps", "Database",
  "Performance", "Tools", "CSS", "Security",
];

export async function POST(req: Request) {
  const authError = requireAuth();
  if (authError) return authError;

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Fetch the page content
  let rawHtml = "";
  try {
    const resp = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; blog-extractor/1.0)" },
    });
    rawHtml = resp.data as string;
  } catch {
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 422 });
  }

  // Strip scripts, styles, nav, header, footer — keep article body text
  const stripped = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 12000); // Limit to 12k chars for OpenAI

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are a technical blog content extractor, writer, and SEO specialist.
Given raw text from a web page, extract and restructure it into a polished, SEO-optimised tech blog post.

Return ONLY valid JSON with these fields:
- title: string (clear article title, naturally includes primary keyword)
- description: string (compelling 1-2 sentence summary, max 200 chars, includes primary keyword)
- content: string (full article content as clean semantic HTML — use h2, h3, p, ul, li, ol, code, pre, strong, em, blockquote. Format code in <pre><code> blocks. Make it well-structured, readable, minimum 600 words.)
- tags: string[] (4-6 relevant technical tags e.g. "React", "JavaScript", "Node.js", "API")
- category: string (pick ONE from: ${CATEGORIES.join(", ")})
- coverEmoji: string (single emoji representing the topic)
- readTime: string (estimate like "8 min read" based on content length)
- slug: string (URL-friendly slug, lowercase, hyphens only, includes primary keyword)
- seoTitle: string (60-char SEO-optimised title — primary keyword near the start, brand name at end omitted — Google will add it)
- seoDescription: string (exactly 140-155 chars — compelling, includes primary keyword and a benefit/hook, ends with a period)
- focusKeyword: string (the single most important keyword phrase this article should rank for)
- seoKeywords: string[] (6-10 additional long-tail keyword phrases related to the topic)`;

  const userPrompt = `Extract and write a comprehensive blog post from this web page content:\n\nSource URL: ${url}\n\nPage content:\n${stripped}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const extracted = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ data: extracted });
  } catch (err: any) {
    return NextResponse.json({ error: `OpenAI error: ${err.message}` }, { status: 500 });
  }
}
