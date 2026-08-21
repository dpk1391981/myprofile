import { SITE_URL } from "@/components/utils/site-data";
import type { Book } from "@/components/utils/books-api";

/**
 * Structured data for a book page.
 *
 * ═══ EVERY TYPE AND PROPERTY HERE WAS CHECKED, NOT REMEMBERED ═══
 * scripts/schemaorg-vocab.json is the source of truth in this repo, and it
 * exists because two confidently-wrong schema types shipped from memory before
 * (HireAction and ContactAction — neither is a real schema.org type, and each
 * caused the whole node to be discarded on every page it appeared on).
 *
 * Verified against that dump: Book, Chapter, Person, Audience, ReadAction,
 * EntryPoint, and every property assigned below. If you add a field here,
 * check it there first — an unknown @type is an ERROR that drops the node
 * entirely, and an out-of-domain property is a warning that quietly does
 * nothing.
 */

const PERSON_ID = `${SITE_URL}/#person`;

export function bookLd(book: Book) {
  const url = `${SITE_URL}/books/${book.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${url}#book`,
    url,
    name: book.title,
    ...(book.subtitle ? { alternateName: book.subtitle } : {}),
    description: book.description || book.seoDescription || "",
    // Reference the Person node the root layout already ships rather than
    // restating it — two Person nodes with the same name and no shared @id read
    // as two different people.
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    inLanguage: book.language || "en",
    ...(book.pages ? { numberOfPages: book.pages } : {}),
    // EBook is the correct BookFormatType for a web/PDF edition.
    bookFormat: "https://schema.org/EBook",
    ...(book.publishedAt ? { datePublished: book.publishedAt } : {}),
    ...(book.coverImage ? { image: book.coverImage } : {}),
    // The honest signal, and a competitive one: most results for "<topic> book"
    // are paid.
    isAccessibleForFree: true,
    /*
      An Offer at price 0.
      Google shows a price on book results, and without this node the free book
      renders next to paid competitors with a blank where their price is — which
      reads as "unknown", not as "free". Stating 0 explicitly is what earns the
      "Free" badge.

      The struck-through list price is NOT modelled here. `price` means what the
      buyer pays through this offer, and that is zero; putting 499 anywhere in
      this node would be a false price claim to a search engine, which is a far
      worse problem than a missing decoration. Verified against
      scripts/schemaorg-vocab.json: Offer, price, priceCurrency, availability,
      url are all in domain.
    */
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: book.currency || "INR",
      availability: "https://schema.org/InStock",
      url,
    },
    ...(book.outcomes?.length ? { teaches: book.outcomes } : {}),
    ...(book.level ? { educationalLevel: book.level } : {}),
    ...(book.audience
      ? { audience: { "@type": "Audience", audienceType: book.audience } }
      : {}),
    ...(book.topic ? { about: book.topic } : {}),
    ...(book.toc?.length
      ? {
          hasPart: book.toc.map((c) => ({
            "@type": "Chapter",
            position: c.ordinal,
            name: c.heading,
            ...(c.summary ? { abstract: c.summary } : {}),
            ...(c.words ? { wordCount: c.words } : {}),
          })),
        }
      : {}),
    potentialAction: {
      "@type": "ReadAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/read`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
    },
  };
}

/**
 * The FAQ, built from the book's own fields.
 *
 * These are the questions a person actually types before downloading something,
 * which is also what an answer engine is trying to resolve. Generated rather
 * than hand-written so every book gets one, and so the answers cannot drift
 * away from the book's real length, level and price.
 *
 * The AI-disclosure question is here ON PURPOSE. Someone will ask it, and the
 * page that answers it plainly keeps the reader; the page that hides it loses
 * them at the moment they find out somewhere else.
 */
export function bookFaq(book: Book): { question: string; answer: string }[] {
  const faq: { question: string; answer: string }[] = [];

  faq.push({
    question: `Is ${book.title} free?`,
    answer:
      `Yes. All ${book.chapters} chapters — ${book.pages} pages — are free to read online with ` +
      `no signup and no paywall. An email address is only needed if you want the whole book as ` +
      `one printable file to keep.`,
  });

  faq.push({
    question: `Do I need to sign up to read ${book.title}?`,
    answer:
      "No. Every chapter is a public page you can read immediately. Signing up is optional and " +
      "only gets you the single-file, printable copy.",
  });

  if (book.audience) {
    faq.push({
      question: `Who is ${book.title} for?`,
      answer: `${book.audience}${
        book.prerequisites ? ` It assumes you already know: ${book.prerequisites}` : ""
      }`,
    });
  }

  if (book.outcomes?.length) {
    faq.push({
      question: `What will I learn from ${book.title}?`,
      answer: `After reading it you will be able to ${book.outcomes
        .map((o) => o.charAt(0).toLowerCase() + o.slice(1))
        .join("; ")}.`,
    });
  }

  faq.push({
    question: `How long is ${book.title}?`,
    answer: `${book.chapters} chapters, about ${book.wordCount.toLocaleString()} words — roughly ${
      book.pages
    } printed pages.`,
  });

  if (book.codeLanguage) {
    faq.push({
      question: "Does it include code examples?",
      answer: `Yes — the examples are in ${book.codeLanguage}, and every snippet is checked by a parser before publication so it runs as written.`,
    });
  }

  if (book.aiDisclosure === "ai-generated") {
    faq.push({
      question: "Was this book written with AI?",
      answer:
        `Yes. ${book.title} was drafted by an AI writing pipeline and then reviewed and edited by ` +
        `${book.authorName || "Deepak Kumar"} before publication. Every code example is verified ` +
        `automatically, and chapters that did not meet the editorial bar were rewritten or held back. ` +
        `We say so plainly rather than leaving you to work it out.`,
    });
  }

  faq.push({
    question: "What happens to my email address?",
    answer:
      "It is used to send you the book and occasional notes when there is a new one. " +
      "It is never sold or shared, and every email has one-click unsubscribe.",
  });

  return faq;
}


/**
 * Structured data for a single chapter page.
 *
 * Chapter → isPartOf → the Book node, referenced by the same @id the book page
 * mints. That link is what tells a search engine these fifteen URLs are one
 * work rather than fifteen unrelated articles — without it each chapter
 * competes alone and none of them inherit the book's authority.
 *
 * Verified against scripts/schemaorg-vocab.json: Chapter, isPartOf, position,
 * abstract, wordCount, author, inLanguage, isAccessibleForFree. Do not add a
 * property here without checking it there.
 */
export function chapterLd(
  book: Book,
  chapter: { ordinal: number; heading: string; summary: string; wordCount: number }
) {
  const bookUrl = `${SITE_URL}/books/${book.slug}`;
  const url = `${bookUrl}/${chapter.ordinal}`;

  return {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "@id": `${url}#chapter`,
    url,
    name: chapter.heading,
    ...(chapter.summary ? { abstract: chapter.summary } : {}),
    position: chapter.ordinal,
    ...(chapter.wordCount ? { wordCount: chapter.wordCount } : {}),
    author: { "@id": PERSON_ID },
    inLanguage: book.language || "en",
    isAccessibleForFree: true,
    isPartOf: {
      "@type": "Book",
      "@id": `${bookUrl}#book`,
      name: book.title,
      url: bookUrl,
    },
  };
}
