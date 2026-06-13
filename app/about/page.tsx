import { About } from "@/components";
import type { Metadata } from "next";
import { NEXT_SEO_DEFAULT } from "../seo_config";

const AboutMeta = {
  ...NEXT_SEO_DEFAULT,
  ...{
    title: "About Deepak Kumar | Senior Full Stack & AI Engineer (9+ Yrs)",
    description:
      `About Deepak Kumar — a Senior Software Engineer with 9+ years of experience in React.js, Node.js, Next.js, MongoDB, and Generative AI (OpenAI, LangChain). Currently building MERN-stack and AI-powered platforms at India Today Group. Learn about his career journey, achievements, and the products he has shipped at scale.`,
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
