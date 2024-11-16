import { Experience } from "@/components";
import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "../seo_config";
import { totalExperianceYears } from "@/components/utils/date";

const ExperienceMeta = {
  ...NEXT_SEO_DEFAULT,
  ...{
    title: "Deepak Kumar | Professional Experience & Career Journey",
    description:
      `Explore the career journey of Deepak Kumar, an accomplished software engineer with over ${totalExperianceYears()} of industry experience. Discover his impactful contributions to companies like Instant System Inc, Clove Dental, Ceekr and Synqy, specializing in Node.js, React, and full stack development. Learn about his achievements in delivering innovative software solutions and driving excellence in technology.`,
  },
};

export const metadata: Metadata = ExperienceMeta;
export default function Home() {
  return (
    <>
      <Experience />
    </>
  );
}
