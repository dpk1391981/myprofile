"use client";

import { useState } from "react";

interface ExtractedData {
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  category?: string;
  coverEmoji?: string;
  readTime?: string;
  slug?: string;
}

interface UrlExtractorProps {
  onExtracted: (data: ExtractedData) => void;
}

export default function UrlExtractor({ onExtracted }: UrlExtractorProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Extraction failed");
        return;
      }

      onExtracted(data.data);
      setSuccess(true);
      setUrl("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">AI Content Extractor</h3>
          <p className="text-xs text-slate-500">Paste any article URL — OpenAI extracts & structures the content</p>
        </div>
      </div>

      <form onSubmit={handleExtract} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://dev.to/article or any blog URL..."
          className="flex-1 border border-purple-200 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Extracting...
            </>
          ) : (
            <>✨ Extract</>
          )}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-red-600 text-xs font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
      {success && (
        <p className="mt-2 text-green-700 text-xs font-medium flex items-center gap-1">
          <span>✅</span> Content extracted! Form has been populated — review and save.
        </p>
      )}
      {loading && (
        <p className="mt-2 text-purple-600 text-xs">
          Fetching page and asking OpenAI to extract content... this may take 10–20s.
        </p>
      )}
    </div>
  );
}
