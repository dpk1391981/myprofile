import { Skills } from "@/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technical Skills",
  description: "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript ",
};

export default function Home() {
  return (
    <>
      <Skills />
    </>
  );
}
