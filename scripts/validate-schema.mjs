#!/usr/bin/env node
/**
 * Structured-data + feed validator
 * ================================
 * Fetches a set of live pages, pulls every <script type="application/ld+json">
 * out of the HTML, and checks each node against what Google actually requires
 * for the rich result it is meant to earn. Also validates /sitemap.xml and
 * /blog/rss.xml as well-formed, non-empty documents with absolute URLs.
 *
 * This is not a schema.org type checker — it is the narrower and more useful
 * thing: the list of mistakes that silently cost a rich result. A JSON-LD block
 * with a typo'd property name still parses, still validates as JSON, and simply
 * never produces the result it was written for. Nothing in a normal build
 * catches that, which is why it needs its own pass.
 *
 * USAGE
 *   npm run build && npm start          # or: npm run dev
 *   node scripts/validate-schema.mjs                        # localhost:3000
 *   node scripts/validate-schema.mjs https://officialdeepak.in
 *
 * Exits non-zero if any ERROR is found, so it can gate a deploy. WARNINGS are
 * recommendations — they print but do not fail the run.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = (process.argv[2] || process.env.VALIDATE_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

let errors = 0;
let warnings = 0;

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function fail(where, msg) { errors++; console.log(`  ${red("ERROR")}  ${where}: ${msg}`); }
function warn(where, msg) { warnings++; console.log(`  ${yellow("WARN")}   ${where}: ${msg}`); }
function ok(msg) { console.log(`  ${green("ok")}     ${msg}`); }

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": "schema-validator" } });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.text();
}

/** Every JSON-LD block on the page, with @graph flattened into a node list. */
function extractJsonLd(html, page) {
  const blocks = [...html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )].map((m) => m[1]);

  const nodes = [];
  blocks.forEach((raw, i) => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // The single most damaging failure mode: one bad character and Google
      // discards the entire block without reporting anything.
      fail(page, `JSON-LD block #${i + 1} is not valid JSON — ${e.message}`);
      return;
    }
    const list = Array.isArray(parsed) ? parsed : [parsed];
    for (const doc of list) {
      if (!doc["@context"]) warn(page, `JSON-LD block #${i + 1} has no @context`);
      for (const n of doc["@graph"] ?? [doc]) if (n && typeof n === "object") nodes.push(n);
    }
  });
  return { blocks, nodes };
}

const typesOf = (n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]).filter(Boolean);
const has = (n, k) => n[k] !== undefined && n[k] !== null && n[k] !== "" &&
  !(Array.isArray(n[k]) && n[k].length === 0);

/** Plain text of the page body, for the "is it visible?" checks. */
function pageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const isAbsUrl = (v) => typeof v === "string" && /^https?:\/\//.test(v);
const isIsoDate = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

// ── Per-type rules ──────────────────────────────────────────────────────────

function checkArticle(n, page, text) {
  const t = typesOf(n).join("/");
  for (const k of ["headline", "datePublished", "author"]) {
    if (!has(n, k)) fail(page, `${t} is missing required "${k}"`);
  }
  // Google truncates headlines past 110 characters and flags longer ones.
  if (typeof n.headline === "string" && n.headline.length > 110) {
    fail(page, `${t} headline is ${n.headline.length} chars — Google's limit is 110`);
  }
  if (!has(n, "image")) warn(page, `${t} has no "image" — no thumbnail in rich results`);
  if (!has(n, "dateModified")) warn(page, `${t} has no "dateModified"`);
  for (const k of ["datePublished", "dateModified"]) {
    if (has(n, k) && !isIsoDate(n[k])) fail(page, `${t}.${k} is not a parseable date: ${n[k]}`);
  }
  if (has(n, "dateModified") && has(n, "datePublished") &&
      Date.parse(n.dateModified) < Date.parse(n.datePublished)) {
    fail(page, `${t}.dateModified is earlier than datePublished`);
  }
  const author = Array.isArray(n.author) ? n.author[0] : n.author;
  if (author && typeof author === "object") {
    if (!has(author, "name")) fail(page, `${t}.author has no "name"`);
    if (!has(author, "url") && !has(author, "sameAs")) {
      warn(page, `${t}.author has neither url nor sameAs — weak authorship signal`);
    }
    // The byline has to be on the page, not only in the markup.
    if (has(author, "name") && !text.includes(String(author.name).toLowerCase())) {
      fail(page, `${t}.author "${author.name}" does not appear in the visible page text`);
    }
  }
  const pub = n.publisher;
  if (pub && typeof pub === "object" && !has(pub, "name") && !has(pub, "@id")) {
    fail(page, `${t}.publisher has no name`);
  }
  if (has(n, "wordCount") && typeof n.wordCount !== "number") {
    fail(page, `${t}.wordCount must be a number, got ${typeof n.wordCount}`);
  }
  // Headline should match the visible <h1>; a mismatch reads as cloaking.
  if (typeof n.headline === "string" && !text.includes(n.headline.toLowerCase().slice(0, 40))) {
    warn(page, `${t}.headline does not appear in the visible page text`);
  }
}

function checkFaq(n, page, text) {
  const entities = n.mainEntity ?? [];
  if (!Array.isArray(entities) || entities.length === 0) {
    return fail(page, "FAQPage has no mainEntity questions");
  }
  entities.forEach((q, i) => {
    const at = `FAQPage.mainEntity[${i}]`;
    if (typesOf(q)[0] !== "Question") fail(page, `${at} is not a Question`);
    if (!has(q, "name")) fail(page, `${at} has no "name" (the question text)`);
    const a = q.acceptedAnswer;
    if (!a || typeof a !== "object") return fail(page, `${at} has no acceptedAnswer`);
    if (typesOf(a)[0] !== "Answer") fail(page, `${at}.acceptedAnswer is not an Answer`);
    if (!has(a, "text")) return fail(page, `${at}.acceptedAnswer has no "text"`);
    /*
      Google's hard requirement: the answer must be visible on the page. FAQ
      markup whose answers are not in the rendered HTML is a manual-action
      risk, not just a lost rich result — so this is an ERROR, not a warning.
    */
    const probe = String(a.text).toLowerCase().replace(/\s+/g, " ").slice(0, 60);
    if (probe && !text.includes(probe)) {
      fail(page, `${at} answer text is not visible on the page (FAQ markup must mirror visible content)`);
    }
    if (has(q, "name")) {
      const qp = String(q.name).toLowerCase().replace(/\s+/g, " ").slice(0, 40);
      if (!text.includes(qp)) fail(page, `${at} question text is not visible on the page`);
    }
  });
}

function checkBreadcrumb(n, page) {
  const items = n.itemListElement ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    return fail(page, "BreadcrumbList has no itemListElement");
  }
  items.forEach((li, i) => {
    const at = `BreadcrumbList[${i}]`;
    if (li.position !== i + 1) fail(page, `${at} position is ${li.position}, expected ${i + 1}`);
    if (!has(li, "name")) fail(page, `${at} has no "name"`);
    // Every crumb but the last must resolve somewhere.
    const item = typeof li.item === "object" ? li.item?.["@id"] : li.item;
    if (i < items.length - 1 && !isAbsUrl(item)) {
      fail(page, `${at} "item" is not an absolute URL: ${item}`);
    }
  });
}

function checkItemList(n, page) {
  const items = n.itemListElement ?? [];
  if (!Array.isArray(items) || items.length === 0) return warn(page, "ItemList is empty");
  items.forEach((li, i) => {
    if (li.position !== i + 1) fail(page, `ItemList[${i}] position is ${li.position}, expected ${i + 1}`);
    const url = li.url ?? li.item?.url ?? li.item;
    if (!isAbsUrl(url)) fail(page, `ItemList[${i}] has no absolute url`);
  });
  if (has(n, "numberOfItems") && typeof n.numberOfItems !== "number") {
    fail(page, "ItemList.numberOfItems must be a number");
  }
}

function checkPerson(n, page) {
  if (!has(n, "name")) fail(page, "Person has no name");
  if (!has(n, "url")) warn(page, "Person has no url");
  if (!has(n, "sameAs")) warn(page, "Person has no sameAs — no entity reconciliation signal");
}

// ── Vocabulary checks ───────────────────────────────────────────────────────
/*
  WHY THIS EXISTS. The checks above verify that Google's REQUIRED PROPERTIES are
  present. They say nothing about whether the vocabulary is real, and that gap
  is where the expensive mistakes live:

    • `"@type": "HireAction"` — a type that does not exist. It reads exactly
      like it should, which is what makes it dangerous: the JSON is valid, every
      required property is present, and consumers discard the node whole.
    • `logo` on a Person — `logo` is defined on Organization and Brand only.

  The first version of this section checked @type against a hand-written
  allowlist. That allowlist was written from memory, it contained
  `ContactAction` (also not a schema.org type), and so the validator cheerfully
  certified an invalid type — the check and the bug shared an author and shared
  his wrong belief. An allowlist of what someone thinks schema.org contains is
  not a check; it is the same guess a second time.

  So the vocabulary is now the real one: scripts/schemaorg-vocab.json, generated
  from schema.org's canonical JSON-LD dump by scripts/refresh-schemaorg-vocab.mjs
  and committed so this runs offline. Nothing here encodes an opinion about what
  schema.org defines.
*/
const VOCAB = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "schemaorg-vocab.json"), "utf8")
);

/** Every ancestor of a class, including itself. Empty if the class is unknown. */
const ancestryCache = new Map();
function ancestors(type) {
  if (ancestryCache.has(type)) return ancestryCache.get(type);
  const out = new Set();
  const walk = (t) => {
    if (!t || out.has(t) || !(t in VOCAB.classes)) return;
    out.add(t);
    for (const parent of VOCAB.classes[t]) walk(parent);
  };
  walk(type);
  ancestryCache.set(type, out);
  return out;
}

/*
  Properties Google and the JSON-LD syntax add on top of the schema.org
  vocabulary. They are legitimate in the markup but absent from the dump, so
  they are exempted by name rather than allowed to produce noise.
*/
const NON_VOCAB_PROPERTIES = new Set(["query-input"]);

function checkVocabulary(n, page, path = "$") {
  const types = typesOf(n).filter((t) => typeof t === "string");

  for (const t of typesOf(n)) {
    if (typeof t !== "string") { fail(page, `${path} has a non-string @type`); continue; }
    // A fully-qualified URL type belongs to another vocabulary — out of scope.
    if (/^https?:\/\//.test(t)) continue;
    if (!(t in VOCAB.classes)) {
      fail(page, `${path} uses "@type": "${t}" — not a schema.org type (a node with an unrecognised type is discarded whole)`);
    }
  }

  if (types.length) {
    // Every type this node is, plus everything those types inherit from.
    const selfAndAncestors = new Set(types.flatMap((t) => [...ancestors(t)]));

    for (const prop of Object.keys(n)) {
      if (prop.startsWith("@") || NON_VOCAB_PROPERTIES.has(prop)) continue;
      const domains = VOCAB.properties[prop];
      if (!domains) {
        warn(page, `${path} uses "${prop}", which is not a schema.org property — consumers ignore it`);
        continue;
      }
      // Valid if the node is (or inherits from) any class the property is
      // defined on. `image` on Person passes because Person inherits from Thing.
      if (!domains.some((d) => selfAndAncestors.has(d))) {
        /*
          A warning, not an error, to match how schema.org's own validator
          grades this: an out-of-domain property is reported but the node is
          still understood, whereas an unresolvable @type (above) discards the
          node entirely. Grading both as errors would block a deploy on
          something the reference tool tolerates.
        */
        warn(page, `${path} sets "${prop}" on ${types.join("/")}, but schema.org defines it on ${domains.join(", ")}`);
      }
    }
  }

  // Recurse — both defects this section was written for were on nested nodes
  // (Person.potentialAction, Article.publisher).
  for (const [k, v] of Object.entries(n)) {
    if (k.startsWith("@")) continue;
    for (const child of Array.isArray(v) ? v : [v]) {
      if (child && typeof child === "object" && child["@type"]) {
        checkVocabulary(child, page, `${path}.${k}`);
      }
    }
  }
}

/*
  A SearchAction promises Google a working search endpoint. If the target URL
  ignores its query parameter the sitelinks searchbox is a false claim, so the
  endpoint is actually exercised rather than taken at face value.
*/
async function checkSearchAction(n, page) {
  const target = typeof n.target === "string" ? n.target : n.target?.urlTemplate;
  if (!target) return fail(page, "SearchAction has no target");
  if (!/\{[a-z_]+\}/i.test(target)) {
    return fail(page, `SearchAction target has no query placeholder: ${target}`);
  }
  const probe = target.replace(/\{[a-z_]+\}/i, "zzqqxx-probe");
  let path;
  try { path = new URL(probe).pathname + new URL(probe).search; }
  catch { return fail(page, `SearchAction target is not a valid URL: ${target}`); }
  try {
    const res = await fetch(`${BASE}${path}`);
    const body = (await res.text()).toLowerCase();
    if (!body.includes("zzqqxx-probe")) {
      warn(page, `SearchAction target ${path} ignores its query parameter — the sitelinks searchbox will not work`);
    }
  } catch (e) {
    warn(page, `SearchAction target could not be fetched: ${e.message}`);
  }
}

// ── Page-level checks ───────────────────────────────────────────────────────

function checkHead(html, page) {
  const canon = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html);
  if (!canon) fail(page, "no <link rel=canonical>");
  else if (!isAbsUrl(canon[1])) fail(page, `canonical is not absolute: ${canon[1]}`);

  const desc = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i.exec(html);
  if (!desc || !desc[1].trim()) fail(page, "no meta description");
  else if (desc[1].length > 320) warn(page, `meta description is ${desc[1].length} chars (>320 is truncated)`);

  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!title || !title[1].trim()) fail(page, "no <title>");
  else if (title[1].length > 70) warn(page, `<title> is ${title[1].length} chars (Google shows ~60)`);

  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  if (h1s === 0) fail(page, "no <h1>");
  if (h1s > 1) warn(page, `${h1s} <h1> elements — there should be one`);

  if (!/<meta[^>]+property=["']og:title["']/i.exec(html)) warn(page, "no og:title");
  if (!/<meta[^>]+name=["']twitter:card["']/i.exec(html)) warn(page, "no twitter:card");

  const robots = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i.exec(html);
  if (robots && /noindex/i.test(robots[1])) warn(page, `robots is "${robots[1]}" — this page will not be indexed`);
}

async function validatePage(path, expected = []) {
  console.log(`\n${dim("─".repeat(64))}\n${path}`);
  let html;
  try {
    html = await get(path);
  } catch (e) {
    return fail(path, e.message);
  }

  checkHead(html, path);

  const { blocks, nodes } = extractJsonLd(html, path);
  if (blocks.length === 0) return fail(path, "no JSON-LD on the page");

  const text = pageText(html);
  const seen = new Set();

  for (const n of nodes) {
    // Vocabulary first: an unrecognised @type invalidates the node regardless
    // of whether its required properties are all present.
    checkVocabulary(n, path);
    for (const t of typesOf(n)) {
      seen.add(t);
      if (["Article", "TechArticle", "BlogPosting", "NewsArticle"].includes(t)) checkArticle(n, path, text);
      else if (t === "FAQPage") checkFaq(n, path, text);
      else if (t === "BreadcrumbList") checkBreadcrumb(n, path);
      else if (t === "ItemList") checkItemList(n, path);
      else if (t === "Person") checkPerson(n, path);
    }
    if (n.potentialAction) {
      for (const a of (Array.isArray(n.potentialAction) ? n.potentialAction : [n.potentialAction])) {
        if (typesOf(a).includes("SearchAction")) await checkSearchAction(a, path);
      }
    }
  }

  for (const t of expected) {
    if (!seen.has(t)) fail(path, `expected a ${t} node, found none`);
  }

  ok(`${blocks.length} JSON-LD block(s), ${nodes.length} node(s): ${[...seen].join(", ")}`);
  return html;
}

// ── Feeds ───────────────────────────────────────────────────────────────────

async function validateSitemap() {
  console.log(`\n${dim("─".repeat(64))}\n/sitemap.xml`);
  let xml;
  try { xml = await get("/sitemap.xml"); } catch (e) { return fail("/sitemap.xml", e.message); }

  if (!/<urlset[^>]+xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/.test(xml)) {
    fail("/sitemap.xml", "missing or wrong urlset xmlns");
  }
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) return fail("/sitemap.xml", "contains no <loc> entries");

  for (const loc of locs) {
    if (!isAbsUrl(loc)) fail("/sitemap.xml", `<loc> is not absolute: ${loc}`);
    if (/[<>"']/.test(loc)) fail("/sitemap.xml", `<loc> contains unescaped characters: ${loc}`);
    if (/\?/.test(loc)) warn("/sitemap.xml", `<loc> has a query string: ${loc}`);
  }
  const dupes = locs.filter((l, i) => locs.indexOf(l) !== i);
  if (dupes.length) fail("/sitemap.xml", `duplicate URLs: ${[...new Set(dupes)].join(", ")}`);

  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!isIsoDate(m[1])) fail("/sitemap.xml", `unparseable <lastmod>: ${m[1]}`);
  }

  // A sitemap listing URLs that 404 or redirect burns crawl budget. Sampled,
  // not exhaustive — the point is to catch a systematically wrong base URL.
  const sample = locs.slice(0, 8);
  for (const loc of sample) {
    const path = new URL(loc).pathname;
    try {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      if (res.status >= 400) fail("/sitemap.xml", `${path} → HTTP ${res.status}`);
      else if (res.status >= 300) warn("/sitemap.xml", `${path} → HTTP ${res.status} (redirect)`);
    } catch (e) {
      fail("/sitemap.xml", `${path} → ${e.message}`);
    }
  }
  ok(`${locs.length} URLs, ${sample.length} sampled and reachable`);
}

async function validateRss() {
  console.log(`\n${dim("─".repeat(64))}\n/blog/rss.xml`);
  let xml;
  try { xml = await get("/blog/rss.xml"); } catch (e) { return fail("/blog/rss.xml", e.message); }

  if (!/<rss[^>]+version=["']2\.0["']/.test(xml)) fail("/blog/rss.xml", "not declared as RSS 2.0");
  for (const tag of ["title", "link", "description"]) {
    if (!new RegExp(`<${tag}>`).test(xml)) fail("/blog/rss.xml", `channel has no <${tag}>`);
  }
  if (!/<atom:link[^>]+rel=["']self["']/.test(xml)) warn("/blog/rss.xml", "no atom:link rel=self");

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  if (items.length === 0) return warn("/blog/rss.xml", "feed has no items");
  items.forEach((item, i) => {
    for (const tag of ["title", "link", "guid", "pubDate", "description"]) {
      if (!new RegExp(`<${tag}[ >]`).test(item)) fail("/blog/rss.xml", `item[${i}] has no <${tag}>`);
    }
    const pub = /<pubDate>([^<]+)<\/pubDate>/.exec(item);
    // RSS 2.0 requires RFC 822 dates, not ISO 8601.
    if (pub && !/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4}/.test(pub[1])) {
      fail("/blog/rss.xml", `item[${i}] pubDate is not RFC 822: ${pub[1]}`);
    }
  });
  // Raw & in text content breaks strict parsers.
  const unescaped = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/.exec(xml);
  if (unescaped) fail("/blog/rss.xml", `unescaped ampersand near: ${xml.slice(Math.max(0, unescaped.index - 30), unescaped.index + 30)}`);

  ok(`${items.length} items, well-formed`);
}

async function validateRobots() {
  console.log(`\n${dim("─".repeat(64))}\n/robots.txt`);
  let txt;
  try { txt = await get("/robots.txt"); } catch (e) { return fail("/robots.txt", e.message); }
  if (!/^sitemap:/im.test(txt)) fail("/robots.txt", "does not declare a Sitemap");
  const sm = /^sitemap:\s*(\S+)/im.exec(txt);
  if (sm && !isAbsUrl(sm[1])) fail("/robots.txt", `Sitemap URL is not absolute: ${sm[1]}`);
  if (/^disallow:\s*\/\s*$/im.test(txt)) fail("/robots.txt", "Disallow: / blocks the whole site");
  ok("declares a sitemap and does not block the site");
}

// ── Run ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nValidating structured data against ${BASE}\n`);

  await validatePage("/", ["Person", "WebSite"]);
  await validatePage("/blog", ["BreadcrumbList", "ItemList"]);

  // Take the newest article straight from the feed, so this always validates a
  // real, current post rather than a slug hardcoded here that later 404s.
  let slug = null;
  try {
    const rss = await get("/blog/rss.xml");
    const link = /<item>[\s\S]*?<link>([^<]+)<\/link>/.exec(rss);
    if (link) slug = new URL(link[1]).pathname;
  } catch { /* handled by validateRss below */ }

  if (slug) await validatePage(slug, ["TechArticle", "BreadcrumbList"]);
  else warn("/blog/rss.xml", "could not resolve an article URL to validate");

  await validateSitemap();
  await validateRss();
  await validateRobots();

  console.log(`\n${dim("─".repeat(64))}`);
  if (errors) console.log(`${red(`${errors} error(s)`)}, ${warnings} warning(s)\n`);
  else console.log(`${green("No errors")}, ${warnings} warning(s)\n`);
  process.exit(errors ? 1 : 0);
}

main().catch((e) => { console.error(red(`\nValidator crashed: ${e.stack}`)); process.exit(1); });
