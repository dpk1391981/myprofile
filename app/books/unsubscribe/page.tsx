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
    <main className="bk-shell" style={{ paddingTop: 80, paddingBottom: 100 }}>
      <h1 className="bk-chapter-title">
        {ok ? "Unsubscribed" : "We could not do that"}
      </h1>
      <p className="bs-body-text bs-quiet" style={{ marginTop: 18 }}>{message}</p>
      {ok && (
        <p className="bs-small bs-quiet" style={{ marginTop: 18 }}>
          The books stay free to read either way —{" "}
          <Link href="/books" className="bs-link">they are all still here</Link>.
        </p>
      )}
    </main>
  );
}
