"use client";

/**
 * Manual trigger for the aivtechx content pipeline.
 *
 * Deliberately fire-and-forget. A run takes several minutes on the agent
 * service — feed fetch, then write/humanize/verify per article — so the request
 * is dispatched and the UI confirms immediately rather than holding a spinner
 * for a result that will never arrive in this page's lifetime. The posts show
 * up in the list on a later refresh.
 *
 * The promise is still caught: "the request never left the browser" is worth
 * showing, even though "the run failed twenty minutes later" is not knowable
 * here. Check the agent service log for the run id if a run goes missing.
 */

import { useState } from "react";
import {
  IconRobot,
  IconCircleCheck,
  IconAlertTriangle,
  IconSparkles,
} from "@tabler/icons-react";

type Status =
  | { kind: "idle" }
  | { kind: "sent"; count: number }
  | { kind: "error"; message: string };

/** Blocks a second dispatch while the first is still plausibly in flight. */
const COOLDOWN_MS = 30_000;

export default function GenerateContentCta() {
  const [count, setCount] = useState(2);
  const [publish, setPublish] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [cooling, setCooling] = useState(false);

  function trigger() {
    if (cooling) return;

    setCooling(true);
    setStatus({ kind: "sent", count });
    window.setTimeout(() => setCooling(false), COOLDOWN_MS);

    // No await: the response only says "accepted", and the run outlives this page.
    fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count, publish }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus({
            kind: "error",
            message: data.error || `Trigger rejected (${res.status})`,
          });
          setCooling(false);
        }
      })
      .catch(() => {
        setStatus({ kind: "error", message: "Network error — nothing was triggered." });
        setCooling(false);
      });
  }

  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <IconRobot size={20} stroke={1.8} />
          </span>
          <div>
            <h2 className="text-sm font-semibold sm:text-base">Generate aivtechx Content</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-indigo-100 sm:text-sm">
              Runs the content pipeline on the agent service — sources topics, writes,
              humanises and fact-checks each article. Takes several minutes and finishes
              in the background; new posts appear in the list on refresh.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-indigo-100">Articles</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              /* A translucent select inherits the banner's white text, which left
                 the chosen number all but invisible against the control's own
                 light native background. Solid white + dark ink instead. */
              className="rounded-lg border border-white/30 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-indigo-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!publish}
              onChange={(e) => setPublish(!e.target.checked)}
              className="h-4 w-4 rounded border-white/40 accent-white"
            />
            Draft only
          </label>

          <button
            type="button"
            onClick={trigger}
            disabled={cooling}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cooling ? (
              <>
                <IconCircleCheck size={16} stroke={2} /> Triggered
              </>
            ) : (
              <>
                <IconSparkles size={16} stroke={2} /> Generate Now
              </>
            )}
          </button>
        </div>
      </div>

      {status.kind === "sent" && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-white/15 px-3.5 py-2.5 text-xs sm:text-sm">
          <IconCircleCheck size={16} stroke={2} className="mt-0.5 shrink-0" />
          <span>
            Run started for {status.count} article{status.count > 1 ? "s" : ""}
            {publish ? "" : " (drafts)"}. It finishes in the background — published posts
            go live a few minutes after the run, on their scheduled release time.
          </span>
        </p>
      )}

      {status.kind === "error" && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-300/40 bg-red-900/40 px-3.5 py-2.5 text-xs sm:text-sm">
          <IconAlertTriangle size={16} stroke={2} className="mt-0.5 shrink-0" />
          <span>{status.message}</span>
        </p>
      )}
    </div>
  );
}
