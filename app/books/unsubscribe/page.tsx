import Link from "next/link";
import { unsubscribeEmail } from "@/components/utils/books-api";

/**
 * One-click unsubscribe.
 *
 * No confirmation step and no "are you sure": the List-Unsubscribe header
 * promises one click, and a page that asks again is the reason people press the
 * spam button instead — which costs the sending domain far more than the
 * subscriber did.
 */
export const dynamic = "force-dynamic";

export default async function UnsubscribePage(
  { searchParams }: { searchParams: { token?: string } }
) {
  const token = searchParams?.token || "";
  let message = "That link is not valid. If you keep receiving mail, reply to any message and it will be handled by hand.";
  let ok = false;

  if (token) {
    try {
      const result = await unsubscribeEmail(token);
      ok = true;
      message = `${result.email} has been removed. You will not receive anything else.`;
    } catch {
      /* fall through to the default message */
    }
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {ok ? "Unsubscribed" : "We could not do that"}
      </h1>
      <p className="mt-4 leading-relaxed text-slate-600">{message}</p>
      {ok && (
        <p className="mt-4 text-sm text-slate-500">
          The books stay free to read either way —{" "}
          <Link href="/books" className="underline">they are all still here</Link>.
        </p>
      )}
    </main>
  );
}
