import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconClockHour4,
  IconDownload,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import PageHeader from "@/components/bs/PageHeader";
import Jsonld from "@/components/bs/Jsonld";
import ContactForm from "@/components/sections/ContactForm";
import Faq from "@/components/sections/Faq";
import SectionHead from "@/components/sections/SectionHead";
import { CONTACT_FAQ, CONTACT_REASONS, SITE_URL } from "@/components/utils/site-data";
import { FOOTER, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { breadcrumbLd, faqLd, pageMeta } from "@/components/utils/seo";

// The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
// current date, so a purely static render freezes them at deploy time and the
// copy understates the experience once an anniversary passes. Re-render daily;
// no data is fetched, so this only costs a regeneration.
export const revalidate = 86400;

export const metadata = pageMeta({
  title: "Contact Deepak Kumar | Hire a React & Full Stack Developer in India",
  description:
    "Contact Deepak Kumar — senior software engineer in New Delhi, India. Available for senior full-stack and AI engineering roles across Delhi NCR or fully remote, and for contract work: MVP builds, AI features, architecture reviews. Replies within 24 hours.",
  path: "/contact",
  keywords: [
    "contact Deepak Kumar",
    "hire React developer India",
    "hire full stack developer India",
    "hire software developer New Delhi",
    "freelance React developer contact",
    "remote software engineer India hire",
  ],
});

const contactPointLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Deepak Kumar",
  url: `${SITE_URL}/contact`,
  mainEntity: {
    "@type": "Person",
    name: "Deepak Kumar",
    jobTitle: "Sr Software Engineer",
    telephone: "+91-8285257636",
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Professional enquiries",
      telephone: "+91-8285257636",
      areaServed: ["IN", "US", "GB", "AE", "SG"],
      availableLanguage: ["English", "Hindi"],
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <Jsonld data={contactPointLd} />
      <Jsonld data={faqLd(CONTACT_FAQ)} />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        dateline={["Enquiries", "New Delhi · IST (UTC+5:30)", "Replies within 24 hours"]}
        kicker="Get in touch"
        title="Tell me what you are building."
        lede="Hiring for a senior role, or need something built? Send the details below. Every message reaches my inbox directly and I reply within 24 hours on working days."
      />

      <section className="bs-wrap bs-section--tight" style={{ paddingTop: 56 }}>
        <div className="bs-split">
          <div>
            <p className="bs-list-head">Send a message</p>
            <div className="bs-mt-4">
              <ContactForm />
            </div>
          </div>

          <aside>
            <p className="bs-list-head">Direct lines</p>

            {PERSONAL_INFO.email ? (
              <div className="bs-list-row">
                <IconMail size={20} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="bs-eyebrow">Email</p>
                  <a href={`mailto:${PERSONAL_INFO.email}`} style={{ fontSize: 15.5, fontWeight: 600 }}>
                    {PERSONAL_INFO.email}
                  </a>
                </div>
              </div>
            ) : null}

            <div className="bs-list-row">
              <IconPhone size={20} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="bs-eyebrow">Phone / WhatsApp</p>
                <a href={`tel:${PERSONAL_INFO.phone}`} style={{ fontSize: 15.5, fontWeight: 600 }}>
                  +91 82852 57636
                </a>
              </div>
            </div>

            <div className="bs-list-row">
              <IconMapPin size={20} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="bs-eyebrow">Based in</p>
                <p style={{ fontSize: 15.5, fontWeight: 600 }}>New Delhi, India</p>
                <p className="bs-small bs-quiet bs-mt-1">On-site across Delhi NCR, or fully remote worldwide.</p>
              </div>
            </div>

            <div className="bs-list-row">
              <IconClockHour4 size={20} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="bs-eyebrow">Working hours</p>
                <p style={{ fontSize: 15.5, fontWeight: 600 }}>IST, UTC+5:30</p>
                <p className="bs-small bs-quiet bs-mt-1">Full overlap with Europe, partial with US east coast.</p>
              </div>
            </div>

            <div className="bs-actions bs-mt-5">
              <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="bs-btn bs-btn--outline">
                <IconDownload size={16} /> Download résumé
              </a>
            </div>

            <div className="bs-socials bs-mt-4">
              <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <IconBrandLinkedin size={22} />
              </a>
              <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <IconBrandGithub size={22} />
              </a>
              <a href={PERSONAL_INFO.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                <IconBrandX size={22} />
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="bs-wrap bs-section" id="reasons">
        <SectionHead
          kicker="What people write in about"
          title="Four things worth sending."
          lede="If your message is one of these, you will get a considered reply rather than a template."
        />
        <div className="bs-cols bs-mt-6">
          {CONTACT_REASONS.map((r) => (
            <div key={r.title}>
              <h3 className="bs-h4">{r.title}</h3>
              <p className="bs-quiet bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Faq
        items={CONTACT_FAQ}
        kicker="Before you write"
        title="Questions I get before the first call."
        id="contact-faq"
      />

      <section className="bs-wrap bs-section">
        <div className="bs-rail-thick" />
        <div className="bs-rail-thin" style={{ marginTop: 4 }} />
        <p className="bs-lede bs-mt-5" style={{ maxWidth: "56ch" }}>
          Looking for something more specific? I keep separate pages for{" "}
          <Link href="/react-developer-in-india">React</Link>,{" "}
          <Link href="/javascript-developer-in-india">JavaScript</Link>,{" "}
          <Link href="/full-stack-developer-in-india">full stack</Link> and{" "}
          <Link href="/software-developer-in-india">general software engineering</Link> work in India.
        </p>
      </section>
    </>
  );
}
