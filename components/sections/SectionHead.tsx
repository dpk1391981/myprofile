import React from "react";

/** Kicker, headline and optional standfirst — the head of every section. */
export default function SectionHead({
  kicker,
  title,
  lede,
  as = "h2",
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <>
      <p className="bs-kicker">{kicker}</p>
      <Heading className={as === "h1" ? "bs-h1 bs-mt-2" : "bs-h2 bs-mt-2"}>{title}</Heading>
      {lede ? (
        <p className="bs-lede bs-quiet bs-mt-3" style={{ maxWidth: "58ch" }}>
          {lede}
        </p>
      ) : null}
    </>
  );
}
