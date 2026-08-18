import Link from "next/link";
import type { Metadata } from "next";
import { IconArrowUpRight } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Message received | Deepak Kumar",
  robots: { index: false, follow: true },
};

export default function SuccessPage() {
  return (
    <section className="bs-wrap" style={{ paddingTop: 26, minHeight: "62vh" }}>
      <div className="bs-rail-thick" />
      <div className="bs-dateline">
        <span>Enquiry received</span>
        <span>New Delhi, India</span>
        <span className="bs-live">● Reply within 24 hours</span>
      </div>
      <div className="bs-rail-thin" />

      <div style={{ paddingTop: 64, maxWidth: "40ch" }}>
        <h1 className="bs-h1">Message received.</h1>
        <p className="bs-lede bs-quiet bs-mt-4">
          It is in my inbox. I reply within 24 hours on working days — if it is urgent,
          call or WhatsApp +91 82852 57636.
        </p>
        <div className="bs-actions bs-mt-5">
          <Link href="/" className="bs-btn bs-btn--solid">Back to the front page</Link>
          <Link href="/projects" className="bs-btn bs-btn--outline">
            See the work <IconArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
