import type { Metadata } from "next";
import React from "react";
import Review from "@/components/Review";

export const metadata: Metadata = {
  title: "Deepak Kumar | Review",
  description:
    "Deepak Kumar | Software Engineer | Node Js | React Js | Javascript | Review | References | Recommendations",
  keywords: "JAVASCRIPT | FULL STACK | NODE JS | REACT JS | MYSQL | NOSQL",
};

const page = () => {
  return (
    <Review />
  );
};

export default page;
