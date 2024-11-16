import { Education } from "@/components";
import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "../seo_config";

const EducationMeta = {
  ...NEXT_SEO_DEFAULT,
  ...{
    title: "Deepak Kumar | Education & Academic Qualifications",
    description:
      "Discover the educational background of Deepak Kumar, an accomplished software engineer with expertise in JavaScript, Full Stack Development, and modern web technologies. Learn how his degrees from Jain University and Delhi University, combined with his passion for continuous learning, have shaped his journey in software engineering and innovation.",
  },
};
export const metadata: Metadata = EducationMeta;

export default function Home() {
  return (
    <>
      <Education />
    </>
  );
}
