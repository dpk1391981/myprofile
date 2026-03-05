"use client";
import {
  About, Experience, CaseStudies, ArchDiagram,
  Skills, AIPlayground, Education, Review, BuildWithMe
} from "@/components";
import { IconDownload } from "@tabler/icons-react";
import { FOOTER } from "@/components/utils/portfolio-data";

export default function Home() {
  return (
    <main className="portfolio-page" id="portfolio-root">
      {/* Floating download PDF button */}
      <div className="pdf-fab-container">
        <a href={FOOTER.resumePath} target="_blank" rel="noopener noreferrer" className="pdf-fab" title="Download Resume PDF" aria-label="Download full portfolio as PDF">
          <IconDownload size={18} />
          <span className="pdf-fab-label">Resume</span>
        </a>
      </div>

      {/* Hero — who I am */}
      <About />

      {/* Career — where I've worked */}
      <Experience />

      {/* Case Studies — HOW I solve problems (converts clients) */}
      {/* <CaseStudies /> */}

      {/* Architecture — how I think (impresses technical leads) */}
      <ArchDiagram />

      {/* Skills — what I know */}
      <Skills />

      {/* AI Playground — live demo (wow factor) */}
      {/* <AIPlayground /> */}

      {/* Education */}
      <Education />

      {/* Social Proof */}
      <Review />

      {/* Build With Me — strong CTA (closes the deal) */}
      <BuildWithMe />
    </main>
  );
}