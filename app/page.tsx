"use client";
import {
  About, Experience, Projects, ArchDiagram,
  Skills, Education, Review, FAQ, BuildWithMe
} from "@/components";
import { IconDownload } from "@tabler/icons-react";
import { FOOTER } from "@/components/utils/portfolio-data";

export default function Home() {
  return (
    <main className="portfolio-page" id="portfolio-root">
      {/* Floating resume download — always one tap away */}
      <div className="pdf-fab-container">
        <a
          href={FOOTER.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-fab"
          title="Download Resume PDF"
          aria-label="Download Deepak Kumar's resume as PDF"
        >
          <IconDownload size={18} />
          <span className="pdf-fab-label">Resume</span>
        </a>
      </div>

      {/* Hero — who I am + the pitch */}
      <About />

      {/* Products & Projects — what I've actually shipped */}
      <Projects />

      {/* Career — where I've worked */}
      <Experience />

      {/* Architecture — how I think (impresses technical leads) */}
      <ArchDiagram />

      {/* Skills — what I know */}
      <Skills />

      {/* Education */}
      <Education />

      {/* Social Proof */}
      <Review />

      {/* FAQ — Answer Engine Optimization + recruiter quick-answers */}
      <FAQ />

      {/* Build With Me — strong CTA (closes the deal) */}
      <BuildWithMe />
    </main>
  );
}
