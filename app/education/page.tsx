import { Education } from "@/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education",
  description: "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript | Education ",
};

export default function Home() {
  return (
    <>
      <Education />
    </>
  );
}
