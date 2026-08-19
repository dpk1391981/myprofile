/**
 * Manual trigger for the aivtechx portfolio content run.
 *
 * The dashboard button fires this and does not wait — the actual generation
 * takes minutes on the agent service, which is why the upstream route queues it
 * as a background task and returns a run id immediately. This route therefore
 * only reports whether the run was *accepted*, never whether it succeeded.
 *
 * Rate-limited because each accepted trigger spends real OpenAI budget on the
 * agent service; a stuck button or an impatient double-click should not run the
 * pipeline five times over.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { rateLimit } from "@/lib/rate-limit";
import { adminTriggerContentRun } from "@/components/utils/portfolio-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** At most 5 manual runs in an hour. Cron handles the routine schedule. */
const TRIGGER_LIMIT = 5;
const TRIGGER_WINDOW_SECONDS = 60 * 60;

export async function POST(req: Request) {
  const authError = requireAdmin();
  if (authError) return authError;

  const limit = rateLimit("content-run", TRIGGER_LIMIT, TRIGGER_WINDOW_SECONDS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Only ${TRIGGER_LIMIT} manual runs per hour. Try again in ${Math.ceil(
          limit.retryAfterSeconds / 60,
        )} min.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let count: number | undefined;
  let publish = true;
  try {
    const body = await req.json().catch(() => ({}));
    // Clamp rather than reject — the UI only ever sends 1–4.
    if (Number.isFinite(body?.count)) {
      count = Math.min(4, Math.max(1, Math.trunc(body.count)));
    }
    if (typeof body?.publish === "boolean") publish = body.publish;
  } catch {
    // Empty body is fine: upstream defaults apply.
  }

  try {
    const result = await adminTriggerContentRun({ count, publish });
    return NextResponse.json({
      status: "triggered",
      runId: result.run_id,
      count: result.count,
      publish: result.publish,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not reach the content service: ${err.message}` },
      { status: 502 },
    );
  }
}
