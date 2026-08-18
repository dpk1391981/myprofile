import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "@/app/seo_config";
import { SITE_URL } from "./site-data";

/** Page metadata on the site defaults, with its own canonical and OG block. */
export function pageMeta({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    ...NEXT_SEO_DEFAULT,
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      ...NEXT_SEO_DEFAULT.openGraph,
      url,
      title,
      description,
    },
    twitter: {
      ...NEXT_SEO_DEFAULT.twitter,
      title,
      description,
    },
  };
}

/** BreadcrumbList JSON-LD for an inner page. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

/** FAQPage JSON-LD — the block Google reads for "People also ask". */
export function faqLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
