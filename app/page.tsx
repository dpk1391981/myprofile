"use client";
import { About, Experience, Education, Skills, Review } from "@/components";
import { IconDownload } from "@tabler/icons-react";
import { PERSONAL_INFO, FOOTER } from "@/components/utils/portfolio-data";

const handleDownloadPDF = () => {
  window.print();
};

export default function Home() {
  return (
    <main className="portfolio-page" id="portfolio-root">
      {/* Floating download PDF button */}
      <div className="pdf-fab-container">
        <a
          href={FOOTER.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-fab"
          title="Download Resume PDF"
          aria-label="Download full portfolio as PDF"
        >
          <IconDownload size={18} />
          <span className="pdf-fab-label">Resume</span>
        </a>
        <button
          onClick={handleDownloadPDF}
          className="pdf-fab pdf-fab--secondary"
          title="Print / Save as PDF"
          aria-label="Print this page as PDF"
        >
          <IconDownload size={18} />
          <span className="pdf-fab-label">Save Page</span>
        </button>
      </div>

      <About />
      <Experience />
      <Skills />
      <Education />
      <Review />

      {/* Compact CTA */}
      <section className="py-10 md:py-14 px-5 sm:px-8" id="contact-cta" aria-label="Call to action">
        <div className="max-w-4xl mx-auto">
          <div className="cta-card-compact">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Looking for a Senior Engineer?
                </h2>
                <p className="text-sm text-white/60">
                  Scalable products · Modern JavaScript · AI integration · Clean architecture
                </p>
              </div>
              <a
                href="/joinme"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.95)", color: "#1e3a8a", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}