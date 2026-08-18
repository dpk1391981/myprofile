import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import PageHeader from "@/components/bs/PageHeader";
import Jsonld from "@/components/bs/Jsonld";
import Capabilities from "@/components/sections/Capabilities";
import Credentials from "@/components/sections/Credentials";
import HireCta from "@/components/sections/HireCta";
import SectionHead from "@/components/sections/SectionHead";
import { ABOUT_PRINCIPLES, ABOUT_STORY, PROOF, YEARS_WHOLE } from "@/components/utils/site-data";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

export const metadata = pageMeta({
  title: "About Deepak Kumar | Senior Software Engineer in India — MERN & Generative AI",
  description:
    `About Deepak Kumar — a senior software developer in India with ${YEARS_WHOLE} years across news media, healthtech, adtech and real estate. React.js, Next.js, Node.js, MongoDB and Generative AI with OpenAI and LangChain. Currently at India Today Group, and running four products of his own.`,
  path: "/about",
  keywords: [
    "about Deepak Kumar",
    "Deepak Kumar software engineer",
    "senior software developer in India",
    "React developer in India",
    "MERN stack developer New Delhi",
    "Generative AI engineer India",
    "software engineer biography India",
  ],
});

export default function AboutPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        dateline={["Profile", "New Delhi, India", `${YEARS_WHOLE} years in production`]}
        kicker="About"
        title="Nine years of shipping things that other people depend on."
        lede={`I am a Senior Software Engineer in New Delhi. I build on the MERN stack and Next.js, add Generative AI where it earns its place, and I have spent most of my career inside production systems with real users attached to them.`}
      />

      <section className="bs-wrap bs-section--tight" style={{ paddingTop: 44 }}>
        <div className="bs-proof">
          {PROOF.map((f) => (
            <div key={f.label}>
              <p className="bs-proof-value">{f.value}</p>
              <p className="bs-proof-label">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bs-wrap bs-section" id="story">
        <div className="bs-split">
          <div>
            {ABOUT_STORY.map((block) => (
              <div key={block.heading} className="bs-mt-6" style={{ marginTop: 0, paddingTop: 34 }}>
                <h2 className="bs-h3">{block.heading}</h2>
                {block.paras.map((p) => (
                  <p key={p.slice(0, 40)} className="bs-body-text bs-measure bs-mt-3">{p}</p>
                ))}
              </div>
            ))}
          </div>

          <aside>
            <figure className="bs-halftone" style={{ width: "100%", aspectRatio: "4 / 5", position: "relative" }}>
              <Image
                src="/assets/images/deepak-kumar-react-developer-india.jpg"
                alt="Portrait of Deepak Kumar, senior full stack and JavaScript developer in New Delhi, India"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
            </figure>
            <figcaption className="bs-figcaption">
              New Delhi, India — available on-site across Delhi NCR or fully remote.
            </figcaption>

            <div className="bs-mt-5">
              <p className="bs-list-head">At a glance</p>
              <dl className="bs-dl">
                <div className="bs-dl-row"><dt>Based in</dt><dd style={{ fontSize: 17 }}>New Delhi</dd></div>
                <div className="bs-dl-row"><dt>Timezone</dt><dd style={{ fontSize: 17 }}>IST +5:30</dd></div>
                <div className="bs-dl-row"><dt>Current role</dt><dd style={{ fontSize: 17 }}>India Today</dd></div>
                <div className="bs-dl-row"><dt>Certification</dt><dd style={{ fontSize: 17 }}>AWS SAA</dd></div>
              </dl>
              <div className="bs-actions bs-mt-4">
                <Link href="/experience" className="bs-link">
                  Full career history <IconArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bs-wrap bs-section" id="principles">
        <SectionHead
          kicker="How I think about the work"
          title="Four rules I actually follow."
        />
        <div className="bs-cols bs-mt-6">
          {ABOUT_PRINCIPLES.map((p) => (
            <div key={p.title}>
              <h3 className="bs-h4">{p.title}</h3>
              <p className="bs-quiet bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Capabilities detailed />
      <Credentials />

      <section className="bs-wrap bs-section">
        <SectionHead kicker="Elsewhere" title="Where else to find me." />
        <div className="bs-cols bs-mt-5">
          <div>
            <h3 className="bs-h4">Code</h3>
            <p className="bs-quiet bs-mt-2 bs-small">Side projects, experiments and the odd utility.</p>
            <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" className="bs-link bs-mt-2">
              GitHub <IconArrowUpRight size={15} />
            </a>
          </div>
          <div>
            <h3 className="bs-h4">Career</h3>
            <p className="bs-quiet bs-mt-2 bs-small">Recommendations, roles and the long-form version.</p>
            <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" className="bs-link bs-mt-2">
              LinkedIn <IconArrowUpRight size={15} />
            </a>
          </div>
          <div>
            <h3 className="bs-h4">Writing</h3>
            <p className="bs-quiet bs-mt-2 bs-small">Notes on React performance, RAG and architecture.</p>
            <Link href="/blog" className="bs-link bs-mt-2">
              Read the blog <IconArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <HireCta />
    </>
  );
}
