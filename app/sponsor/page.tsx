import Link from "next/link";
import PageHeader from "@/components/bs/PageHeader";
import { PriceFigure } from "@/components/bs/HeadFigure";
import Jsonld from "@/components/bs/Jsonld";
import ContactForm from "@/components/sections/ContactForm";
import Faq from "@/components/sections/Faq";
import SectionHead from "@/components/sections/SectionHead";
import { SITE_URL, SPONSOR_FAQ, SPONSOR_INCLUDES, SPONSOR_PRICE_FROM, SPONSOR_RULES } from "@/components/utils/site-data";
import { breadcrumbLd, faqLd, pageMeta } from "@/components/utils/seo";

export const metadata = pageMeta({
  title: "Sponsored Posts | Deepak Kumar's Engineering Blog",
  description:
    "Sponsor a post on Deepak Kumar's AI, React and web engineering blog. Written by Deepak, labelled sponsored, links marked rel=sponsored. From ₹999 a post.",
  path: "/sponsor",
  keywords: [
    "sponsored post",
    "sponsored blog post India",
    "tech blog sponsorship",
    "AI tool review",
    "developer tool sponsored review",
    "advertise on developer blog",
  ],
});

// Every @type and property below was checked against
// scripts/schemaorg-vocab.json (Service, Offer, Audience, WebPage,
// SpeakableSpecification, PriceSpecification and their property domains).
// The price is a floor (minPrice), not a fixed price: longer reviews are quoted
// higher per brief. Keep it in step with SPONSOR_PRICE_FROM, the one source
// for every visible mention.
const sponsorLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/sponsor#webpage`,
      url: `${SITE_URL}/sponsor`,
      name: "Sponsored posts on Deepak Kumar's blog",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/sponsor#service` },
      inLanguage: "en-IN",
      dateModified: "2026-10-14",
      // The block answer engines and voice assistants should quote.
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".bs-sponsor-summary"] },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/sponsor#service`,
      name: "Sponsored blog post",
      serviceType: "Sponsored blog post",
      category: "Content sponsorship",
      description:
        "A single sponsored article on officialdeepak.in/blog, written or edited by Deepak Kumar, labelled as sponsored at the top. Includes the sponsor's brand name in the headline, their URL with a link marked rel=\"sponsored\", a sponsor box, and permanent placement.",
      provider: { "@id": `${SITE_URL}/#person` },
      url: `${SITE_URL}/sponsor`,
      areaServed: "Worldwide",
      audience: {
        "@type": "Audience",
        audienceType: "Software engineers, AI and LLM developers, and engineering leaders",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: SPONSOR_PRICE_FROM,
          priceCurrency: "INR",
        },
        description: `From ₹${SPONSOR_PRICE_FROM} per post; the final price is agreed in writing per brief, before work starts.`,
        url: `${SITE_URL}/sponsor`,
      },
    },
  ],
};

export default function SponsorPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Sponsored posts", path: "/sponsor" },
        ])}
      />
      <Jsonld data={sponsorLd} />
      <Jsonld data={faqLd(SPONSOR_FAQ)} />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Sponsored posts" }]}
        dateline={["Sponsorship", "AI · React · Web engineering", "Replies within 24 hours"]}
        kicker="Work with the blog"
        title="Put your product in front of engineers."
        lede="The blog covers AI, LLM tooling, React and the web platform, read by developers and people who hire them. If you have a product they would actually use, send a brief and I will tell you honestly whether it fits."
        figure={
          <PriceFigure
            price={`₹${SPONSOR_PRICE_FROM}`}
            rows={[
              { label: "Format", value: "One post, written by me" },
              { label: "Label", value: "Marked as sponsored" },
              { label: "Reply", value: "Within 24 hours" },
            ]}
          />
        }
      >
        {/* The price, said out loud under the lede: a visible low floor is
            what turns a curious visitor into a brief. */}
        <div className="bs-price-callout bs-mt-5">
          <span className="bs-price-callout__text">
            Starts at only <strong className="bs-price-callout__amount">₹{SPONSOR_PRICE_FROM}</strong> per post
          </span>
          <a href="#brief" className="bs-btn bs-btn--solid">Send a brief</a>
        </div>
      </PageHeader>

      <section className="bs-wrap bs-section" id="what-you-get">
        <SectionHead
          kicker={`What ₹${SPONSOR_PRICE_FROM} gets you`}
          title="Real readers, your name, and a post that stays up."
          lede="What every sponsored post includes. Links are marked sponsored, as Google requires, so what you are paying for is visibility and clicks from people who build with this technology."
        />
        <ol className="bs-includes bs-mt-6">
          {SPONSOR_INCLUDES.map((item, i) => (
            <li key={item.title} className="bs-includes__item">
              <span className="bs-includes__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="bs-h4">{item.title}</h3>
              <p className="bs-quiet bs-mt-2">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bs-wrap bs-section--tight" id="brief" style={{ paddingTop: 56, scrollMarginTop: 24 }}>
        <div className="bs-split">
          <div>
            <p className="bs-list-head">Send a brief</p>
            <div className="bs-mt-4">
              <ContactForm kind="sponsored" lockKind />
            </div>
          </div>

          <aside>
            <p className="bs-list-head">How it works</p>
            <ol className="bs-steps">
              <li><strong>You send a brief.</strong> What the product is, who it is for, what you want covered.</li>
              <li><strong>I check the fit.</strong> I try the product where I can. If it is not useful to my readers, I say no.</li>
              <li><strong>You get a quote.</strong> One price for the post, agreed in writing before I start.</li>
              <li><strong>I write and publish it.</strong> You can check facts before it goes live. The opinions stay mine.</li>
            </ol>
          </aside>
        </div>
      </section>

      {/* At a glance. Written as self-contained sentences that name the site
          and the author, so an AI answer can lift any one of them without the
          surrounding page and still be accurate. Marked speakable above. */}
      <section className="bs-wrap bs-section" id="at-a-glance">
        <SectionHead kicker="At a glance" title="Sponsored posts, in short." />
        <div className="bs-sponsor-summary bs-mt-5" style={{ maxWidth: "68ch" }}>
          <p className="bs-lede">
            Deepak Kumar, a senior software engineer in New Delhi, accepts sponsored posts on his blog at
            officialdeepak.in. The blog covers AI and LLM engineering, React, Next.js and the web platform.
          </p>
          <ul className="bs-steps" style={{ listStyle: "disc" }}>
            <li>Each sponsored post is one article, written or edited by Deepak Kumar.</li>
            <li>The sponsor is named in the headline and article, with their URL, a sponsor box and a link, and the post stays live permanently.</li>
            <li>Every sponsored post is labelled as sponsored at the top of the article.</li>
            <li>Links to the sponsor carry rel=&quot;sponsored&quot;, as Google requires for paid links.</li>
            <li>Accepted: developer tools, AI and LLM products, cloud and web platform services.</li>
            <li>Not accepted: gambling, crypto schemes, essay mills, or link-buying for SEO.</li>
            <li>Prices start at ₹{SPONSOR_PRICE_FROM} per post; the final price is agreed in writing per brief. A reply comes within 24 hours on working days.</li>
          </ul>
        </div>
      </section>

      <section className="bs-wrap bs-section" id="rules">
        <SectionHead
          kicker="The ground rules"
          title="What every sponsored post gets, and what it never does."
          lede="These protect my readers, and they protect you too. A post that reads like an advert does not work."
        />
        <div className="bs-split bs-split--even bs-mt-6">
          {SPONSOR_RULES.map((r) => (
            <div key={r.title} style={{ borderTop: "1px solid var(--hair)", paddingTop: 18 }}>
              <h3 className="bs-h4">{r.title}</h3>
              <p className="bs-quiet bs-mt-2" style={{ fontSize: 15.5, lineHeight: 1.7 }}>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Faq items={SPONSOR_FAQ} kicker="Before you send a brief" title="Common sponsorship questions." id="sponsor-faq" />

      <section className="bs-wrap bs-section">
        <div className="bs-rail-thick" />
        <div className="bs-rail-thin" style={{ marginTop: 4 }} />
        <p className="bs-lede bs-mt-5" style={{ maxWidth: "56ch" }}>
          Here to hire me or get something built instead? Use the{" "}
          <Link href="/contact">contact page</Link>. To see the kind of writing a sponsored post would sit next to, read{" "}
          <Link href="/blog">the blog</Link>.
        </p>
      </section>
    </>
  );
}
