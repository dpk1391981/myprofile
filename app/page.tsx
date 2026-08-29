import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Products from "@/components/sections/Products";
import SelectedWork from "@/components/sections/SelectedWork";
import Career from "@/components/sections/Career";
import Capabilities from "@/components/sections/Capabilities";
import Recommendations from "@/components/sections/Recommendations";
import Credentials from "@/components/sections/Credentials";
import Faq from "@/components/sections/Faq";
import HireCta from "@/components/sections/HireCta";
import TechBlogs from "@/components/sections/TechBlogs";
import { FAQS } from "@/components/utils/portfolio-data";
import { SITE_URL } from "@/components/utils/site-data";
import { HOME_FAQ_STRUCT_DATA, NEXT_SEO_DEFAULT } from "./seo_config";
import Jsonld from "@/components/bs/Jsonld";

/*
  Two things date this page, and the faster one sets the number.

  The career-length figures (YEARS_WHOLE, yearsExp) are computed from the
  current date, so a purely static render freezes them at deploy time and the
  copy understates the experience once an anniversary passes. That alone wants
  a daily re-render, which is what this used to be.

  But <TechBlogs> reads the live feed, and THAT was the bug: a segment
  `revalidate` governs when the page HTML is regenerated, and a shorter
  `revalidate` on a fetch inside it does not pull that number down — it only
  ages the data-cache entry the next regeneration will read. So the strip's
  900s fetch bought nothing: a post published in the morning could not appear
  on the most-linked page of the site until the daily window rolled over, and
  it visibly did not. Fifteen minutes is the freshness the blog strip needed
  all along; the years figure is happy anywhere under a day.

  Admin publishes do not wait for this at all — see lib/revalidate-blog.ts,
  which purges "/" the moment a post is written. This is the floor for
  everything published around the admin, by the agent service directly.
*/
export const revalidate = 900;

export const metadata: Metadata = {
  ...NEXT_SEO_DEFAULT,
  alternates: { canonical: SITE_URL },
};

export default function Home() {
  return (
    <>
      <Jsonld data={HOME_FAQ_STRUCT_DATA} />
      <Hero />
      {/* Work history sits directly under the hero on purpose: recruiters and
          clients look for it first, and it used to sit below three screens of
          product write-ups. Products keep their place, one section further
          down and collapsed by default. */}
      <Career />
      <SelectedWork limit={5} showMore />
      <TechBlogs />
      <Products />
      <Capabilities />
      <Recommendations />
      <Credentials />
      <Faq items={FAQS} />
      <HireCta />
    </>
  );
}
