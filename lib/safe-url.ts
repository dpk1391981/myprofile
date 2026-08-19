/**
 * Guard for URLs the server is asked to fetch on a user's behalf.
 *
 * The blog extractor takes a URL from the admin form and fetches it server-side.
 * Without this check that endpoint is an SSRF proxy: it would happily fetch
 * http://169.254.169.254/ (cloud metadata) or an internal host that is only
 * reachable from the deployment. Admin-only access narrows who can aim it, but
 * a stolen session should not also hand over the private network.
 */
import { lookup } from "dns/promises";
import net from "net";

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) || // link-local, incl. cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    a >= 224 // multicast + reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique-local
  if (v.startsWith("fe80")) return true; // link-local
  if (v.startsWith("::ffff:")) return isPrivateIPv4(v.slice(7)); // v4-mapped
  return false;
}

function isPrivateAddress(ip: string): boolean {
  return net.isIPv4(ip) ? isPrivateIPv4(ip) : isPrivateIPv6(ip);
}

/**
 * Resolves `raw` and rejects anything that is not a public http(s) address.
 * Returns the normalised URL string, or an error message to show the caller.
 */
export async function assertPublicHttpUrl(
  raw: unknown,
): Promise<{ url: string } | { error: string }> {
  if (typeof raw !== "string" || raw.length > 2048) {
    return { error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { error: "That is not a valid URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Only http and https URLs can be fetched" };
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "");

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    return { error: "That host is not allowed" };
  }

  // A literal IP is checked directly; a name is resolved first, so a hostname
  // that points at 127.0.0.1 is caught too.
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) return { error: "That host is not allowed" };
    return { url: parsed.toString() };
  }

  try {
    const records = await lookup(host, { all: true });
    if (!records.length || records.some((r) => isPrivateAddress(r.address))) {
      return { error: "That host is not allowed" };
    }
  } catch {
    return { error: "That host could not be resolved" };
  }

  return { url: parsed.toString() };
}

/**
 * GET a public URL, re-validating every redirect hop.
 *
 * Following redirects automatically would undo the check above — a public URL
 * is free to 302 to http://169.254.169.254 — so each hop is resolved and
 * re-checked before it is followed.
 */
export async function fetchPublicHtml(
  startUrl: string,
  opts: { maxRedirects?: number; timeoutMs?: number; maxBytes?: number } = {},
): Promise<{ html: string; url: string } | { error: string }> {
  const { maxRedirects = 3, timeoutMs = 15000, maxBytes = 5 * 1024 * 1024 } = opts;
  let current = startUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const checked = await assertPublicHttpUrl(current);
    if ("error" in checked) return { error: checked.error };

    let res: Response;
    try {
      res = await fetch(checked.url, {
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; blog-extractor/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      return { error: "Failed to fetch URL" };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return { error: "Failed to fetch URL" };
      current = new URL(location, checked.url).toString();
      continue;
    }

    if (!res.ok) return { error: "Failed to fetch URL" };

    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > maxBytes) return { error: "That page is too large to process" };

    const html = await res.text();
    // The post-redirect URL is what was actually read; cite that, not the input.
    return { html: html.slice(0, maxBytes), url: checked.url };
  }

  return { error: "Too many redirects" };
}
