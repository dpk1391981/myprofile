import Link from "next/link";
import { confirmSubscription } from "@/components/utils/books-api";
import RememberToken from "@/components/books/RememberToken";

/**
 * The confirm link from the delivery email.
 *
 * Server-rendered and never cached: the whole point is a side effect, and a
 * cached response would show a stale result to the next person who clicks a
 * different token.
 *
 * The upstream call is idempotent, so a second click — which people do, and
 * which mail scanners do automatically — shows success rather than an error.
 */
export const dynamic = "force-dynamic";

export default async function ConfirmPage(
  { searchParams }: { searchParams: { token?: string } }
) {
  const token = searchParams?.token || "";

  if (!token) {
    return (
      <Shell title="Something is missing">
        <p>That link is incomplete. Open the one in your email again, or{" "}
          <Link href="/books" className="underline">sign up once more</Link>.</p>
      </Shell>
    );
  }

  try {
    const result = await confirmSubscription(token);
    return (
      <Shell title="You are in">
        <p>
          Your email is confirmed. <strong>{result.title}</strong> is yours — and every book
          published after it.
        </p>
        <RememberToken token={result.readToken} />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/books/${result.slug}/read?token=${encodeURIComponent(result.readToken)}`}
                className="bs-btn bs-btn--solid">
            Open the printable copy
          </Link>
          {/*
            Chapter 1, NOT /books/{slug}. The landing page carries the signup
            form, so sending a reader who has just confirmed back to it asked
            them to subscribe a second time — the one thing a confirmation page
            must never do. Someone who clicked "read online" wants the text.
          */}
          <Link href={`/books/${result.slug}/1`} className="bs-btn bs-btn--outline">
            Start reading chapter 1
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Bookmark the printable link — it is how you get back to your copy.
        </p>
      </Shell>
    );
  } catch (err: any) {
    const gone = String(err?.message || "").includes("410");
    return (
      <Shell title={gone ? "That address unsubscribed" : "This link did not work"}>
        <p>
          {gone
            ? "This address opted out earlier. Sign up again and you will get a fresh link."
            : "The link may have been mistyped or already replaced by a newer one."}
        </p>
        <Link href="/books" className="mt-6 inline-block underline">Back to the books</Link>
      </Shell>
    );
  }
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <div className="mt-4 leading-relaxed text-slate-600">{children}</div>
    </main>
  );
}
