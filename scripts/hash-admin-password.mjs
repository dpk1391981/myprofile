#!/usr/bin/env node
/**
 * Generate the values the admin login needs in the environment.
 *
 *   node scripts/hash-admin-password.mjs '<new password>'
 *
 * Prints ADMIN_PASSWORD_HASH (and a fresh ADMIN_SESSION_SECRET) to paste into
 * .env.local and into the Vercel project's environment variables. The plaintext
 * password is never written anywhere.
 */
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("usage: node scripts/hash-admin-password.mjs '<password>'");
  process.exit(1);
}
if (password.length < 12) {
  console.error(
    `warning: that password is ${password.length} characters. ` +
      "12+ with mixed character classes is the sane minimum for an internet-facing admin.",
  );
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });

// `:` separates the fields, not `$`: dotenv would expand a `$`-prefixed
// segment inside a .env value and silently truncate the hash.
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
