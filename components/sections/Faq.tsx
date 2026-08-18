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
              {isOpen ? (
                <p className="bs-faq-a" id={`${id}-panel-${i}`}>{f.answer}</p>
              ) : null}
            </div>
          );
        })}
        <div className="bs-rail-hair" />
      </div>
    </section>
  );
}
