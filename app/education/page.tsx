import PageHeader from "@/components/bs/PageHeader";
import Jsonld from "@/components/bs/Jsonld";
import Credentials from "@/components/sections/Credentials";
import HireCta from "@/components/sections/HireCta";
import SectionHead from "@/components/sections/SectionHead";
import { breadcrumbLd, pageMeta } from "@/components/utils/seo";

export const metadata = pageMeta({
  title: "Education & Certifications | Deepak Kumar — MCA (AI/ML), AWS coursework",
  description:
    "The academic and professional credentials of Deepak Kumar — an MCA in Artificial Intelligence & Machine Learning from JAIN University, a Bachelor of Commerce from the University of Delhi, a Junior Engineering diploma in Computer Science, and AWS Solutions Architect Associate (SAA-C03) and MERN Stack coursework.",
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
        dateline={["Credentials", "Delhi, India", "AWS Certified SA Associate"]}
        kicker="Education & certification"
        title="Degrees, diplomas and the certifications that stuck."
        lede="A commerce degree, a computer science diploma and a postgraduate qualification in AI and machine learning — plus the AWS certification I use most days."
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
