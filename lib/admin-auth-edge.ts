/**
 * Edge-runtime twin of `verifyToken` in lib/admin-auth.ts.
 *
 * Middleware runs on the Edge runtime, where node:crypto is unavailable, so the
 * same HMAC-SHA256 check is done with Web Crypto. Keep the payload shape and the
 * hex signature encoding identical to admin-auth.ts or sessions minted by one
 * side will be rejected by the other.
 */
const SECRET = process.env.ADMIN_SESSION_SECRET || "";
const USERNAME = process.env.ADMIN_USERNAME || "";

export const ADMIN_COOKIE = "admin_token";

let keyPromise: Promise<CryptoKey> | null = null;

function signingKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return keyPromise;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-safe, data-independent string compare. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function base64urlToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function verifyTokenEdge(token: string | undefined): Promise<boolean> {
  if (SECRET.length < 32 || !USERNAME) return false;
  if (!token || token.length > 4096) return false;

  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return false;

    const mac = await crypto.subtle.sign(
      "HMAC",
      await signingKey(),
      new TextEncoder().encode(data),
    );
    if (!constantTimeEqual(sig, toHex(mac))) return false;

    const payload = JSON.parse(base64urlToString(data));
    return (
      payload.u === USERNAME &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now()
    );
  } catch {
    return false;
  }
}
