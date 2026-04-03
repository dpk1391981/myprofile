"use client";

import { useRef, useState, useCallback } from "react";

interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const TOOLBAR_ACTIONS = [
  { cmd: "bold", label: "B", title: "Bold", style: "font-bold" },
  { cmd: "italic", label: "I", title: "Italic", style: "italic" },
  { cmd: "underline", label: "U", title: "Underline", style: "underline" },
  { cmd: "strikeThrough", label: "S̶", title: "Strike", style: "" },
];

const HEADINGS = [
  { tag: "h2", label: "H2" },
  { tag: "h3", label: "H3" },
  { tag: "h4", label: "H4" },
];

const LISTS = [
  { cmd: "insertUnorderedList", label: "• List" },
  { cmd: "insertOrderedList", label: "1. List" },
];

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncContent();
  }, []);

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertHeading = (tag: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = range.toString() || "Heading";
    const el = document.createElement(tag);
    el.textContent = selectedText;
    range.deleteContents();
    range.insertNode(el);
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    syncContent();
  };

  const insertCodeBlock = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = range.toString() || "// code here";
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = selectedText;
    pre.appendChild(code);
    range.deleteContents();
    range.insertNode(pre);
    range.setStartAfter(pre);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    syncContent();
  };

  const insertInlineCode = () => {
    exec("insertHTML", `<code>${window.getSelection()?.toString() || "code"}</code>`);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const insertBlockquote = () => {
    exec("formatBlock", "blockquote");
  };

  const insertDivider = () => {
    exec("insertHTML", "<hr /><p><br /></p>");
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    onChange(html);
    if (editorRef.current) editorRef.current.innerHTML = html;
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200">
        {(["visual", "html", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
              activeTab === tab
                ? "bg-white border border-slate-200 text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "visual" && "✏️ "}
            {tab === "html" && "<> "}
            {tab === "preview" && "👁️ "}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <span className="flex-1" />
        <span className="text-xs text-slate-400 hidden sm:block">
          {value.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      {/* Toolbar — only in visual mode */}
      {activeTab === "visual" && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-white border-b border-slate-100">
          {/* Text formatting */}
          {TOOLBAR_ACTIONS.map((a) => (
            <button
              key={a.cmd}
              type="button"
              title={a.title}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(a.cmd);
              }}
              className={`px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 text-slate-700 transition-colors ${a.style}`}
            >
              {a.label}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Headings */}
          {HEADINGS.map((h) => (
            <button
              key={h.tag}
              type="button"
              title={h.label}
              onMouseDown={(e) => {
                e.preventDefault();
                insertHeading(h.tag);
              }}
              className="px-2.5 py-1.5 text-xs font-bold rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
            >
              {h.label}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Lists */}
          {LISTS.map((l) => (
            <button
              key={l.cmd}
              type="button"
              title={l.label}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(l.cmd);
              }}
              className="px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
            >
              {l.label}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Code */}
          <button
            type="button"
            title="Inline code"
            onMouseDown={(e) => {
              e.preventDefault();
              insertInlineCode();
            }}
            className="px-2.5 py-1.5 text-xs font-mono rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            `code`
          </button>
          <button
            type="button"
            title="Code block"
            onMouseDown={(e) => {
              e.preventDefault();
              insertCodeBlock();
            }}
            className="px-2.5 py-1.5 text-xs font-mono rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {"<pre>"}
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            title="Blockquote"
            onMouseDown={(e) => {
              e.preventDefault();
              insertBlockquote();
            }}
            className="px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ❝
          </button>
          <button
            type="button"
            title="Link"
            onMouseDown={(e) => {
              e.preventDefault();
              insertLink();
            }}
            className="px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            🔗
          </button>
          <button
            type="button"
            title="Horizontal rule"
            onMouseDown={(e) => {
              e.preventDefault();
              insertDivider();
            }}
            className="px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ─
          </button>
        </div>
      )}

      {/* Editor content */}
      {activeTab === "visual" && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          onBlur={syncContent}
          dangerouslySetInnerHTML={{ __html: value }}
          className="min-h-[420px] p-5 focus:outline-none text-slate-800 prose prose-sm max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-rose-600
            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:text-slate-500 prose-blockquote:italic
            prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
            prose-li:text-slate-700 prose-a:text-blue-600 prose-a:underline
            prose-hr:border-slate-200"
          style={{ fontFamily: "inherit" }}
        />
      )}

      {activeTab === "html" && (
        <textarea
          value={value}
          onChange={handleHtmlChange}
          className="w-full min-h-[420px] p-5 font-mono text-sm text-slate-800 focus:outline-none resize-none bg-slate-950 text-green-400"
          placeholder="<h2>Your content here...</h2>"
          spellCheck={false}
        />
      )}

      {activeTab === "preview" && (
        <div
          className="min-h-[420px] p-6 prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-code:bg-slate-100 prose-code:px-1.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-rose-600
            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:text-slate-500 prose-blockquote:italic
            prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
            prose-a:text-blue-600 prose-a:underline prose-hr:border-slate-200"
          dangerouslySetInnerHTML={{ __html: value || "<p class='text-slate-400'>Nothing to preview yet...</p>" }}
        />
      )}
    </div>
  );
}
