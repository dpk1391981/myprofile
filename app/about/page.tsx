import { About, Experience, Education, Skills } from "@/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript ",
};

export default function Home() {
  return (
    <>
      <About />
    </>
  );
}
