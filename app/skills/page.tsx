import { Skills } from "@/components";
import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "../seo_config";

const SkillsMeta = {
  ...NEXT_SEO_DEFAULT,
  ...{
    title: "Deepak Kumar | Experienced Software Engineer | Technical Expertise in JavaScript, React, Node.js & More",
    description:
      "Explore the technical journey of Deepak Kumar, an experienced software engineer expertise in JavaScript, React, Angular, Node.js, and modern web development frameworks. Discover his skills in building scalable applications, optimizing code, and driving innovation across full-stack development, project management, and problem-solving.",
  },
};

export const metadata: Metadata = SkillsMeta;
export default function Home() {
  return (
    <>
      <Skills />
    </>
  );
}
