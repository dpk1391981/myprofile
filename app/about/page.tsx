import { About } from "@/components";
import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "../seo_config";

const AboutMeta = {
  ...NEXT_SEO_DEFAULT,
  ...{
    title: "Deepak Kumar | About - Full Stack JavaScript Developer",
    description:
      `Deepak Kumar is an experienced Full Stack JavaScript Develope expertise in React, Node.js, and modern web technologies. Passionate about crafting scalable software solutions, Deepak combines technical skills with innovative problem-solving to deliver exceptional results. Learn more about his journey and professional achievements.`,
  },
};
export const metadata: Metadata = AboutMeta;

export default function Home() {
  return (
    <>
      <About />
    </>
  );
}
