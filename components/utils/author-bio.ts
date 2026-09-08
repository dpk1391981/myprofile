/*
  The author bio under every article.

  WHY IT VARIES BY CATEGORY. This was one hardcoded paragraph — "I build
  production web applications and Generative AI systems…" — printed identically
  under a Kubernetes post, a React post and a TypeScript release note. A bio
  that never changes tells a reader nothing about why THIS author is worth
  trusting on THIS subject, and it is the same sameness that makes an
  auto-published blog read as machine-made.

  The line is the one piece of an article that is allowed to be a claim about
  the author, so it is worth spending on relevance: each variant names real work
  that is genuinely adjacent to the category. Nothing here is generated — these
  are hand-written and must stay true. `default` is the original line and is
  what any unmapped category gets, so a new category is never a broken promise,
  just a less specific one.

  Keys are the agent's VALID_CATEGORIES (agents/portfolio_content.py). Tags are
  checked first because they are more specific than the single category.
*/
const BY_CATEGORY: Record<string, string> = {
  React:
    "I have written React for production since 2017 — component libraries, editorial dashboards, and the front end of a live election results screen that updates while millions of people are watching it. I write here about what those systems actually do once real traffic hits them.",
  "Node.js":
    "Most of my backend work is Node — APIs, queues and ingestion pipelines behind editorial products at India Today Group, plus the services running my own marketplaces. I write here about what those systems actually do once real traffic hits them.",
  JavaScript:
    "I have worked in JavaScript daily for nine years, across browser code that has to stay fast and server code that has to stay up. I write here about what those systems actually do once real traffic hits them.",
  TypeScript:
    "I moved production codebases onto TypeScript at three companies and maintain several in it now. I write here about what those systems actually do once real traffic hits them.",
  /*
    BOTH SPELLINGS ON PURPOSE. The agent's VALID_CATEGORIES lists "AI", but every
    row actually in the database is filed under "AI/ML" — verified against the
    live posts, where "AI" appears zero times. Keying only on the agent's
    constant silently fell through to the default on every AI article, which is
    the one category where the specific bio matters most.
  */
  "AI/ML": "I build Generative AI into production — RAG on MongoDB Atlas Vector Search, semantic search over an editorial archive, and the multi-agent pipelines that write this blog and my books unattended. I write here about what those systems actually do once real traffic hits them.",
  AI: "I build Generative AI into production — RAG on MongoDB Atlas Vector Search, semantic search over an editorial archive, and the multi-agent pipelines that write this blog and my books unattended. I write here about what those systems actually do once real traffic hits them.",
  Cloud:
    "I run the infrastructure behind my own products as well as writing the applications on it, which is a useful vantage point: I get the bill and the pager for the same decision. I write here about what those systems actually do once real traffic hits them.",
  DevOps:
    "I run the deployment and on-call side of my own products alongside the application code, so the trade-offs here are ones I have paid for. I write here about what those systems actually do once real traffic hits them.",
  Database:
    "I design the data layer as well as the code on top of it — MongoDB and MySQL in production, Atlas Vector Search for retrieval, Redis where the queue matters more than the query. I write here about what those systems actually do once real traffic hits them.",
  Web: "I build production web applications end to end — React and Next.js on the front, Node.js behind them — and I care most about the parts that only show up under load. I write here about what those systems actually do once real traffic hits them.",
  Engineering:
    "I build production web applications and Generative AI systems, and I have spent most of nine years on the maintenance end of other people's architectural decisions. I write here about what those systems actually do once real traffic hits them.",
  Career:
    "Nine years in, across seven companies, a national newsroom and four products of my own — including the hiring side of the table. I write here about what those systems actually do once real traffic hits them.",
};

/*
  Tag overrides, checked before the category. A post filed under "AI" that is
  really about Kubernetes should not claim RAG experience as its credential.
*/
const BY_TAG: Record<string, string> = {
  kubernetes:
    "I run containerised services in production for my own products and have done the unglamorous half of Kubernetes — the upgrades, the resource limits nobody set, the 3am rollback. I write here about what those systems actually do once real traffic hits them.",
  docker:
    "I containerise and deploy my own products, so build times and image size are costs I actually pay. I write here about what those systems actually do once real traffic hits them.",
  security:
    "I have shipped the boring security work — auth flows, token handling, dependency upgrades after a CVE lands on a Friday. I write here about what those systems actually do once real traffic hits them.",
  llm: "I build LLM systems in production — retrieval, evaluation harnesses and guardrails, plus the unattended agent pipelines that write this blog and my books. I write here about what those systems actually do once real traffic hits them.",
  rag: "I build RAG systems in production, on MongoDB Atlas Vector Search over a working editorial archive. I write here about what those systems actually do once real traffic hits them.",
  nextjs:
    "This site, my books platform and two marketplaces of mine all run on Next.js, so its sharp edges are ones I have hit personally. I write here about what those systems actually do once real traffic hits them.",
  "next.js":
    "This site, my books platform and two marketplaces of mine all run on Next.js, so its sharp edges are ones I have hit personally. I write here about what those systems actually do once real traffic hits them.",
  cybersecurity:
    "I have shipped the boring security work — auth flows, token handling, dependency upgrades after a CVE lands on a Friday. I write here about what those systems actually do once real traffic hits them.",
  aws: "I run my own products on AWS and have carried the architecture decisions far enough to see the bill. I write here about what those systems actually do once real traffic hits them.",
};

export const DEFAULT_AUTHOR_BIO =
  "I build production web applications and Generative AI systems — React and Next.js on the front, Node.js and RAG pipelines behind them. I write here about what those systems actually do once real traffic hits them.";

/**
 * The bio line for one post. Tags win over category because they are more
 * specific; an unmapped post falls back to the original line rather than to
 * anything invented.
 */
export function authorBio(category?: string, tags?: string[]): string {
  for (const raw of tags ?? []) {
    const hit = BY_TAG[raw.trim().toLowerCase()];
    if (hit) return hit;
  }
  return BY_CATEGORY[(category || "").trim()] ?? DEFAULT_AUTHOR_BIO;
}
