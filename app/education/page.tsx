import PageHeader from "@/components/bs/PageHeader";
import { RecordFigure } from "@/components/bs/HeadFigure";
import Jsonld from "@/components/bs/Jsonld";
import Credentials from "@/components/sections/Credentials";
import HireCta from "@/components/sections/HireCta";
import SectionHead from "@/components/sections/SectionHead";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

// The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
// current date, so a purely static render freezes them at deploy time and the
// copy understates the experience once an anniversary passes. Re-render daily;
// no data is fetched, so this only costs a regeneration.
export const revalidate = 86400;

export const metadata = pageMeta({
  title: "Education & Certifications | Deepak Kumar — Degrees & AWS",
  description:
    "The credentials behind the work — a B.Com from the University of Delhi, a computer science diploma, AWS Solutions Architect coursework, and an MCA in AI & ML under way.",
  path: "/education",
  keywords: [
    "Deepak Kumar education",
    "AWS certified solutions architect India",
    "AI ML postgraduate India",
    "Delhi University software engineer",
    "certified React developer India",
  ],
});

export default function EducationPage() {
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Education", path: "/education" },
        ])}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Education" }]}
        dateline={["Credentials", "Delhi, India", "AWS SA Associate coursework"]}
        kicker="Education & certification"
        title="Degrees, diplomas and the certifications that stuck."
        lede="A commerce degree, a computer science diploma and AWS Solutions Architect coursework — plus a postgraduate qualification in AI and machine learning still under way."
        figure={
          <RecordFigure
            rows={[
              { kind: "Degree", title: "B.Com", where: "University of Delhi", when: "2017" },
              { kind: "Diploma", title: "Computer science / IT", where: "Board of Technical Education", when: "2016" },
              { kind: "Coursework", title: "AWS Solutions Architect Associate", where: "SAA-C03 course", when: "2023" },
              { kind: "Postgraduate", title: "MCA — AI & machine learning", where: "JAIN University", when: "since 2023", status: "In progress" },
            ]}
          />
        }
      />

      <Credentials />

      <section className="bs-wrap bs-section" id="continuing">
        <SectionHead
          kicker="Since graduating"
          title="What I have learned on the job."
        />
        <div className="bs-cols bs-mt-5">
          <div>
            <h3 className="bs-h4">Generative AI in production</h3>
            <p className="bs-quiet bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>
              The postgraduate work in AI and ML gave me the vocabulary; India Today gave me the
              production constraints. Retrieval-augmented generation, embedding pipelines and
              evaluation are things I learned by shipping them to readers.
            </p>
          </div>
          <div>
            <h3 className="bs-h4">Cloud architecture</h3>
            <p className="bs-quiet bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>
              Working through the AWS Solutions Architect Associate (SAA-C03) material in 2023 put
              names to what four years of serverless work at SYNQY had already taught me about cost,
              availability and the difference between the two.
            </p>
          </div>
          <div>
            <h3 className="bs-h4">Mentoring</h3>
            <p className="bs-quiet bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>
              Running reviews with junior engineers on performance, accessibility and secure
              development — the fastest way I know to find the gaps in your own understanding.
            </p>
          </div>
        </div>
      </section>

      <HireCta />
    </>
  );
}
