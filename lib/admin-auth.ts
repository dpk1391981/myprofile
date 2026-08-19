/**
 * Admin session auth (Node runtime — API routes and server components).
 *
 * Nothing secret lives in this file. The username, the password hash and the
 * signing secret all come from the environment, so a copy of the repository is
 * not a copy of the credentials. `lib/admin-auth-edge.ts` verifies the same
 * token format with Web Crypto for middleware, which cannot use node:crypto —
 * the two must stay in step on payload shape and signature encoding.
 *
 * Required env (see .env.local.example):
 *   ADMIN_USERNAME       plain username
 *   ADMIN_PASSWORD_HASH  scrypt:<saltHex>:<keyHex>  — `npm run admin:hash`
 *                        (`:` not `$` as the separator — dotenv expands `$…`
 *                        inside .env values and would eat half the hash)
 *   ADMIN_SESSION_SECRET >=32 chars of random, used to sign session cookies
 */
import { createHmac, timingSafeEqual, scryptSync } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.ADMIN_SESSION_SECRET || "";
const USERNAME = process.env.ADMIN_USERNAME || "";
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

/** Sessions last a week; long enough to be usable, short enough to expire. */
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const ADMIN_COOKIE = "admin_token";

let warned = false;

/**
 * Auth fails closed when it is not configured. Returning `false` from every
 * entry point is the safe direction: a misconfigured deploy locks the owner
 * out rather than letting everybody in.
 */
function isConfigured(): boolean {
  const ok = SECRET.length >= 32 && !!USERNAME && PASSWORD_HASH.startsWith("scrypt:");
  if (!ok && !warned) {
    warned = true;
    console.error(
      "[admin-auth] ADMIN_USERNAME / ADMIN_PASSWORD_HASH / ADMIN_SESSION_SECRET " +
        "are missing or invalid — admin login is disabled until they are set.",
    );
  }
  return ok;
}

/** Constant-time compare that does not leak length through an early return. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // timingSafeEqual throws on length mismatch, so compare digests of equal size.
  const ah = createHmac("sha256", SECRET).update(ab).digest();
  const bh = createHmac("sha256", SECRET).update(bb).digest();
  return timingSafeEqual(ah, bh) && ab.length === bb.length;
}

export function verifyCredentials(username: unknown, password: unknown): boolean {
  if (!isConfigured()) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (password.length > 512) return false; // don't run scrypt on arbitrary input sizes

  const [, saltHex, keyHex] = PASSWORD_HASH.split(":");
  if (!saltHex || !keyHex) return false;

  let derived: Buffer;
  try {
    derived = scryptSync(password, Buffer.from(saltHex, "hex"), keyHex.length / 2, {
      N: 16384,
      r: 8,
      p: 1,
    });
  } catch {
    return false;
  }

  const expected = Buffer.from(keyHex, "hex");
  // Both checks always run — no short-circuit that would reveal which half failed.
  const passwordOk =
    derived.length === expected.length && timingSafeEqual(derived, expected);
  const userOk = safeEqual(username, USERNAME);
  return passwordOk && userOk;
}

export function createToken(): string {
  const now = Date.now();
  const payload = {
    u: USERNAME,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyToken(token: unknown): boolean {
  if (!isConfigured()) return false;
  if (typeof token !== "string" || token.length > 4096) return false;
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return false;

    const expected = createHmac("sha256", SECRET).update(data).digest("hex");
    const sigBuf = Buffer.from(sig, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    // The username is pinned into the token, so rotating ADMIN_USERNAME also
    // invalidates every session issued to the old one.
    return payload.u === USERNAME && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAdminToken(): string | null {
  try {
    return cookies().get(ADMIN_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  return token ? verifyToken(token) : false;
}

/** Cookie options shared by the login and logout handlers. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}
