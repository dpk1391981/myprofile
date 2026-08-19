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
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 mb-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl leading-none">🤖</span>
          <div>
            <h2 className="font-bold text-base">Generate aivtechx Content</h2>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Runs the content pipeline on the agent service — sources topics, writes,
              humanises and fact-checks each article. Takes several minutes and finishes
              in the background; new posts appear in the list on refresh.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-indigo-100">Articles</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-white/15 border border-white/25 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-900"
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
              className="w-4 h-4 rounded accent-white"
            />
            Draft only
          </label>

          <button
            type="button"
            onClick={trigger}
            disabled={cooling}
            className="bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors whitespace-nowrap"
          >
            {cooling ? "Triggered ✓" : "Generate Now"}
          </button>
        </div>
      </div>

      {status.kind === "sent" && (
        <p className="mt-4 text-sm bg-white/15 rounded-lg px-4 py-2.5">
          ✅ Run started for {status.count} article{status.count > 1 ? "s" : ""}
          {publish ? "" : " (drafts)"}. It finishes in the background — no need to wait
          on this page.
        </p>
      )}

      {status.kind === "error" && (
        <p className="mt-4 text-sm bg-red-900/40 border border-red-300/40 rounded-lg px-4 py-2.5">
          ⚠️ {status.message}
        </p>
      )}
    </div>
  );
}
