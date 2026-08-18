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
import { FAQS } from "@/components/utils/portfolio-data";
import { SITE_URL } from "@/components/utils/site-data";
import { HOME_FAQ_STRUCT_DATA, NEXT_SEO_DEFAULT } from "./seo_config";
import Jsonld from "@/components/bs/Jsonld";

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
      <Products />
      <Capabilities />
      <Recommendations />
      <Credentials />
      <Faq items={FAQS} />
      <HireCta />
    </>
  );
}
