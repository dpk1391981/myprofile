import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.ADMIN_JWT_SECRET || "dpk_admin_2024_secret_key_x9z";

export const ADMIN_CREDENTIALS = {
  username: "dpk1391981",
  password: "1391981",
};

export function verifyCredentials(username: string, password: string): boolean {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
}

export function createToken(): string {
  const payload = {
    user: ADMIN_CREDENTIALS.username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): boolean {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return false;
    const expectedSig = createHmac("sha256", SECRET).update(data).digest("hex");
    if (sig !== expectedSig) return false;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAdminToken(): string | null {
  try {
    return cookies().get("admin_token")?.value || null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  return token ? verifyToken(token) : false;
}
