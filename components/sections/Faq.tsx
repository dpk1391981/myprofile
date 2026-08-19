"use client";
import { useState } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import SectionHead from "./SectionHead";

export interface FaqEntry { question: string; answer: string }

/** Straight answers — an accordion with the first entry open. */
export default function Faq({
  items,
  kicker = "Straight answers",
  title = "What recruiters and clients ask first.",
  id = "faq",
}: {
  items: FaqEntry[];
  kicker?: string;
  title?: string;
  id?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bs-wrap bs-section" id={id}>
      <SectionHead kicker={kicker} title={title} />

      <div className="bs-faq bs-mt-6">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.question} className="bs-faq-item">
              <h3 style={{ margin: 0 }}>
                <button
                  type="button"
                  className="bs-faq-btn"
                  aria-expanded={isOpen}
                  aria-controls={`${id}-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="bs-faq-q">{f.question}</span>
                  {isOpen ? (
                    <IconMinus size={20} className="bs-faq-icon" />
                  ) : (
                    <IconPlus size={20} className="bs-faq-icon" />
                  )}
                </button>
              </h3>
              {/*
                Rendered whether or not the panel is open, and hidden with the
                `hidden` attribute rather than removed from the tree.

                The FAQPage JSON-LD this page emits (HOME_FAQ_STRUCT_DATA)
                describes every answer. Conditionally rendering them meant the
                HTML a crawler received contained exactly one of them, so the
                markup asserted content that was not on the page — a structured
                data policy violation, not merely a lost rich result. Google
                explicitly allows FAQ answers inside a collapsed accordion; what
                it does not allow is markup with no corresponding content.
              */}
              <p className="bs-faq-a" id={`${id}-panel-${i}`} hidden={!isOpen}>
                {f.answer}
              </p>
            </div>
          );
        })}
        <div className="bs-rail-hair" />
      </div>
    </section>
  );
}
