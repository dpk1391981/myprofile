import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { fetchPublicHtml } from "@/lib/safe-url";
import OpenAI from "openai";

// dns/net in the SSRF guard need the Node runtime, not Edge.
export const runtime = "nodejs";
// A full-length draft on the larger model takes 30-50s; the short-draft
// top-up below only runs if there is time left inside this.
export const maxDuration = 60;

/*
  Why this prompt and model changed (2026-10-13).

  The 12 posts made with this tool between Aug and Oct 2026 came out at 450-800
  words in a newsroom voice: an "Introduction" heading, a "Key Highlights"
  bullet block, a "Conclusion". They were the blog's best-performing AI posts in
  Search Console and also its least human-sounding. Three causes, three fixes:
    - gpt-4o-mini at a 600-word floor writes short and generic -> a larger model
      (EXTRACT_MODEL overrides it), a 1,200-1,600 word target, and one top-up
      pass when a draft still lands under MIN_WORDS;
    - "You are an expert technical editor, news writer and SEO specialist" ->
      the author writing on his own blog, first person, with a view;
    - the mandated Introduction / Key Highlights / Conclusion skeleton -> gone.
  The voice and background rules mirror _WRITER_SYSTEM and AUTHOR_BACKGROUND in
  aivtechx/agents/portfolio_content.py; keep the two in step.
*/
const MODEL = process.env.EXTRACT_MODEL || "gpt-4o";
const MIN_WORDS = 1000;
const SOURCE_CHARS = 20000;

/** True, number-free facts from the portfolio. The writer may refer to this
 *  work but must never invent an incident, figure or result inside it. */
const AUTHOR_BACKGROUND = `
- Senior Software Engineer at India Today Group (Aaj Tak) since 2025: MERN stack and Generative AI features for the newsroom's digital and editorial platforms — editorial tools, AI article summaries, AI-assisted content workflows, intelligent search, election-results dashboards and video CMS components, built with OpenAI and LangChain on AWS.
- Earlier, years at Instant Systems Inc building for clients: a Patient Relationship Management system for Clove Dental (as module lead), retail-media analytics dashboards for SYNQY, and a personal-development platform for Humanize.
- Runs his own products end to end: PlanToday.in (wedding and event vendor marketplace with plain-English and Hinglish search parsed by NLP), TrendMeToday.com (clusters news coverage and scores stories on momentum), VTechXHub.com (content publishing platform) and Think4BuySale (real-estate marketplace).
- Based in India; works across React, Next.js, Node.js, TypeScript, MongoDB and AWS.`;

const wordCount = (html: string) =>
  html.replace(/<pre[\s\S]*?<\/pre>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

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
  const authError = requireAdmin();
  if (authError) return authError;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Rejects private/loopback/metadata targets, on the first URL and on every
  // redirect it follows — see lib/safe-url.ts.
  // Sites that block server-side fetches (Medium and friends) fall back to the
  // reader proxy, which hands back markdown instead of HTML.
  const fetched = await fetchPublicHtml(body?.url, { readerFallback: true });
  if ("error" in fetched) {
    return NextResponse.json({ error: fetched.error }, { status: 400 });
  }
  const { html: rawHtml, url, contentType } = fetched;

  const stripped = (
    contentType === "text"
      ? // Already clean markdown — keep the line breaks, they carry the structure.
        rawHtml.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n")
      : // Strip scripts, styles, nav, header, footer — keep article body text
        rawHtml
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<nav[\s\S]*?<\/nav>/gi, "")
          .replace(/<header[\s\S]*?<\/header>/gi, "")
          .replace(/<footer[\s\S]*?<\/footer>/gi, "")
          .replace(/<aside[\s\S]*?<\/aside>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
  )
    .trim()
    .slice(0, SOURCE_CHARS);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `
You are Deepak Kumar, a Senior Software Engineer in India with 9+ years of production experience, writing a post for your own engineering blog at officialdeepak.in. You are not a journalist and not a marketer. You are a working engineer telling other engineers what changed, whether it matters, and what you would actually do about it.

═══ THE ONE UNBREAKABLE RULE ═══
Every factual claim must be traceable to the SOURCE you are given. Never state a version, date, benchmark, percentage, price, statistic, quote, API name or "first/fastest/most" claim that is not in the source. Your own judgement is welcome, clearly marked as yours ("I'd", "my guess is"). Invented fact presented as fact is not. If the source is thin on a point, say less about that point.

═══ SOUND LIKE DEEPAK, NOT LIKE A NEWS DESK ═══
This is what you have actually worked on, and the ONLY background you may draw on:
${AUTHOR_BACKGROUND}
- Where the subject genuinely touches that work, say so once or twice, tied to the subject: "This is the part I'd test first on a newsroom CMS, where a slow publish is a missed story." Never as a CV line.
- NEVER invent an incident, date, number, colleague, outage, migration or result inside that work. Talk about what you would check and where it would bite: judgement, not invented history. If the subject does not touch that work, leave it out.
- Have a view: which option you'd pick and why, what you're sceptical of, what you'd wait for before adopting it.
- First person throughout. Short sentences mixed with longer ones. One-sentence paragraphs are fine.
- Never use: "In today's fast-paced", "rapidly evolving", "game-changer", "delve", "dive into", "landscape", "leverage" (as a verb), "seamless", "robust", "Moreover", "Furthermore", "Additionally", "In conclusion", "It's worth noting", "when it comes to", "unlock", "harness".
- Do NOT use an "Introduction" or "Conclusion" heading, and no "Key Highlights" block. Start with the news; end on your take, a caveat, or the next step. Never summarise at the end.

═══ WHAT THE POST MUST CONTAIN ═══
- What actually changed, stated plainly in the first paragraph, answering the reader's search directly and using the focus keyword once, naturally.
- Why it matters for someone running real production code.
- A section of practical steps, named after the subject (e.g. "Moving a Next.js app to the new cache API"), not a generic label.
- A realistic, correct code example in <pre><code> when the topic is technical. Omit it if you are not sure it is correct.
- An honest section on what this does not solve, who should ignore it, and the trade-offs, again named after the subject.
- Where a reader would phrase a section as a question ("Is it available in India?", "How does it compare to Claude?"), use that question as the <h2>, at most two times.

═══ LENGTH ═══
1,200 to 1,600 words of prose in "content", not counting code. Under ${MIN_WORDS} words the draft is unusable. If the source is short, the length comes from your practical steps and your trade-offs, both clearly your own judgement, never from padding or invented facts.

═══ OUTPUT: ONLY valid JSON, no markdown fence ═══
{
  "title": "specific, honest on-page headline, 50-70 chars, no clickbait",
  "description": "one-sentence summary for the blog index, 120-180 chars. Lead with the subject and what is true about it; never open with Explore, Discover, Learn, Unlock, Dive or Delve",
  "content": "the article as clean semantic HTML: <h2>, <h3>, <p>, <ul>/<ol>/<li>, <strong>, <em>, <blockquote>, <pre><code>. No <h1>, no markdown, no inline styles, no class attributes",
  "tags": ["4-6 lowercase tags"],
  "category": "ONE of: ${CATEGORIES.join(", ")}",
  "coverEmoji": "single emoji",
  "slug": "lowercase-hyphen-slug-with-the-focus-keyword",
  "seoTitle": "the title Google shows, 30-45 chars; the site appends ' | Deepak Kumar', so never add a site name. Start with the exact words a person would search: product, model or version name first. American spelling (optimize, maximize).",
  "seoDescription": "140-155 chars. Contains the focus keyword and says what this post gives that the official announcement does not: the trade-off, the steps, the comparison, who should care.",
  "focusKeyword": "the single phrase this post should rank for",
  "seoKeywords": ["5-8 phrases people actually search, including the focus keyword"]
}
`;

  const userPrompt = `Write my blog post from this source.\n\nSource URL: ${url}\n\nSource content:\n${stripped}`;
  const started = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      // Higher than the old 0.3: the facts are pinned by the prompt, and the
      // extra variety is what stops every post opening the same way.
      temperature: 0.7,
      max_tokens: 6000,
    });

    const extracted = JSON.parse(completion.choices[0].message.content || "{}");

    // One top-up when the draft is short, if there is time left in the
    // function. It only lengthens the two judgement sections, so it cannot
    // add claims the source does not make.
    if (
      typeof extracted.content === "string" &&
      wordCount(extracted.content) < MIN_WORDS &&
      Date.now() - started < 28_000
    ) {
      try {
        const more = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
            { role: "assistant", content: JSON.stringify({ content: extracted.content }) },
            {
              role: "user",
              content: `That article is ${wordCount(extracted.content)} words; it needs 1,200 or more. Return JSON {"content": "..."} with the FULL article, every existing fact, code block and heading kept. Add length only by deepening the practical steps and the trade-offs sections with your own clearly-marked judgement. No new facts, no padding, no summary paragraph.`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 6000,
        });
        const longer = JSON.parse(more.choices[0].message.content || "{}").content;
        if (typeof longer === "string" && wordCount(longer) > wordCount(extracted.content)) {
          extracted.content = longer;
        }
      } catch {
        // Keep the first draft; a short post is still better than an error.
      }
    }

    // Computed, not trusted from the model: its "X min read" guesses ran short.
    if (typeof extracted.content === "string") {
      extracted.readTime = `${Math.max(1, Math.round(wordCount(extracted.content) / 225))} min read`;
    }
    return NextResponse.json({ data: extracted });
  } catch (err: any) {
    return NextResponse.json(
      { error: `OpenAI error: ${err.message}` },
      { status: 500 },
    );
  }
}
