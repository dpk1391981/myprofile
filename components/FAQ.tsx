"use client";
import React, { useState } from "react";
import { FAQS } from "./utils/portfolio-data";
import { useScrollReveal } from "./utils/useScrollReveal";
import { IconChevronDown, IconHelpCircle } from "@tabler/icons-react";

const FAQ = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  const [open, setOpen] = useState<number | null>(0);

  if (FAQS.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="animate-on-scroll relative not-prose scroll-mt-[72px] section-pad"
      id="faq"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <header className="section-header section-header-center text-center">
          <p className="section-eyebrow">
            Frequently Asked Questions
          </p>
          <h2 className="section-title font-display">
            What Recruiters Ask
          </h2>
          <p className="section-sub">
            Quick answers about my experience, stack, and availability.
          </p>
        </header>

        {/* Accordion */}
        <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <article
                key={i}
                className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="faq-question-icon" aria-hidden="true">
                    <IconHelpCircle size={18} />
                  </span>
                  <span className="flex-1" itemProp="name">
                    {faq.question}
                  </span>
                  <IconChevronDown
                    size={18}
                    className={`faq-chevron ${isOpen ? "faq-chevron--open" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`faq-answer-${i}`}
                  className="faq-answer-wrap"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                  hidden={!isOpen}
                >
                  <p className="faq-answer" itemProp="text">
                    {faq.answer}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
