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
  "React.js",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Next.js",
  "AI/ML",
  "System Design",
  "Career",
  "DevOps",
  "Database",
  "Performance",
  "Tools",
  "CSS",
  "Security",
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

  const systemPrompt = `
You are an expert technical editor, news writer, and SEO specialist.

Your task is to transform raw, unstructured web content into a polished, SEO-optimised article suitable for a professional tech blog or newsroom.

STRICT RULES:
- Return ONLY valid JSON. No explanation, no markdown.
- Do NOT hallucinate facts. Stay true to the source.
- Use British English.
- Maintain a clean, modern, professional tone.
- Avoid fluff. Focus on clarity and value.

CONTENT INTELLIGENCE:
- First, detect content type:
  1. NEWS
  2. TUTORIAL
  3. ANALYSIS

- Then adapt structure accordingly:

IF NEWS:
- Add a "Key Highlights" section (bullet points)
- Keep tone journalistic and factual
- Include impact and context

IF TUTORIAL:
- Add a "Step-by-Step Guide" section
- Include examples or code if relevant

IF ANALYSIS:
- Add "Pros and Cons" section
- Provide balanced insights

OUTPUT FORMAT (STRICT JSON):

{
  "title": "Clear SEO-friendly title with primary keyword",
  "description": "1-2 sentence summary (max 200 chars) with primary keyword",
  "content": "Clean semantic HTML:
    - Use <h2>, <h3>
    - Use <p>
    - Use <ul>, <ol>, <li>
    - Use <strong>, <em>
    - Use <blockquote>
    - Use <pre><code> for code
    - Minimum 600 words
    - NO markdown
    - NO inline styles
    - Well structured

    STRUCTURE:
    - Start with introduction
    - Add relevant sections
    - Add dynamic section based on type:
        NEWS → Key Highlights
        TUTORIAL → Step-by-Step Guide
        ANALYSIS → Pros and Cons
    - End with conclusion
  ",
  "tags": ["4-6 relevant tags"],
  "category": "Pick ONE from: ${CATEGORIES.join(", ")}",
  "coverEmoji": "Single emoji",
  "readTime": "X min read",
  "slug": "lowercase-hyphen-slug-with-keyword",
  "seoTitle": "Max 60 chars, keyword first",
  "seoDescription": "140-155 chars, keyword + benefit, ends with period",
  "focusKeyword": "Main keyword",
  "seoKeywords": ["6-10 long-tail keywords"]
}

SEO RULES:
- Include focus keyword in:
  - Title
  - First paragraph
  - At least one heading
- Avoid keyword stuffing
- Make it human-readable

QUALITY RULES:
- Ensure minimum 600 words
- Break into readable sections
- Use lists where helpful
- Ensure no broken HTML
`;

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
    return NextResponse.json(
      { error: `OpenAI error: ${err.message}` },
      { status: 500 },
    );
  }
}
