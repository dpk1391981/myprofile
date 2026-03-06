"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { REVIEWS } from "./utils/portfolio-data";
import { useScrollReveal } from "./utils/useScrollReveal";
import { IconBrandLinkedin, IconChevronLeft, IconChevronRight, IconQuote } from "@tabler/icons-react";

const Review = () => {
  const [active, setActive] = useState(0);
  const sectionRef = useScrollReveal<HTMLElement>();

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % REVIEWS.length);
  }, []);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  }, []);

  // Auto-advance every 8s
  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next]);

  if (REVIEWS.length === 0) return null;

  const review = REVIEWS[active];

  return (
    <section
      ref={sectionRef}
      className="animate-on-scroll relative not-prose scroll-mt-[72px] py-16 md:py-10 bg-slate-50/60"
      id="reviews"
      aria-label="Recommendations"
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <header className="section-header section-header-center text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">What Colleagues Say</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
           
          >
            Recommendations
          </h2>
        </header>

        {/* Card */}
        <div className="review-card">
          {/* Quote icon */}
          <div className="review-quote-icon" aria-hidden="true">
            <IconQuote size={32} />
          </div>

          {/* Quote text */}
          <blockquote className="relative z-10 mb-8">
            <p className="text-base md:text-lg leading-relaxed text-slate-600 italic">
              &ldquo;{review.quote}&rdquo;
            </p>
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <Image
              src={review.avatar}
              alt={`Photo of ${review.name}`}
              title={review.name}
              width={52}
              height={52}
              loading="lazy"
              className="rounded-full border-2 border-slate-200 object-cover"
              style={{ width: 52, height: 52 }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-base" itemProp="author">{review.name}</p>
              <p className="text-sm text-slate-500">
                {review.role} at {review.company}
              </p>
            </div>
            <Link
              href={review.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="review-linkedin-btn"
              aria-label={`View ${review.name} on LinkedIn`}
            >
              <IconBrandLinkedin size={20} />
            </Link>
          </div>

          {/* Navigation */}
          {REVIEWS.length > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={prev}
                className="review-nav-btn"
                aria-label="Previous recommendation"
              >
                <IconChevronLeft size={18} />
              </button>

              {/* Dots */}
              <div className="flex gap-2" role="tablist">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`review-dot ${i === active ? "review-dot--active" : ""}`}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Go to recommendation ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="review-nav-btn"
                aria-label="Next recommendation"
              >
                <IconChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Review;