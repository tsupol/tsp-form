import { useState, useCallback } from "react";
import { JsonView, allExpanded, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import "../styles/json-pretty.css";

export function JsonPretty({ data, jsonViewProps }: { data: any, jsonViewProps?: any }) {
  const [copied, setCopied] = useState(false);

  const toPrettyJson = useCallback(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      // Fallback – attempt to stringify best-effort
      try {
        return String(data);
      } catch {
        return "";
      }
    }
  }, [data]);

  const copyToClipboard = useCallback(async () => {
    const text = toPrettyJson();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }, [toPrettyJson]);

  return (
    <div className="json-pretty">
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label={copied ? "Copied" : "Copy JSON"}
        className="json-pretty-copy"
        style={{
          background: "var(--color-surface, #111)",
          borderColor: "var(--color-line, #333)",
        }}
        title={copied ? "Copied" : "Copy JSON"}
      >
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>

      <JsonView
        data={data}
        shouldExpandNode={allExpanded}
        style={darkStyles}
        {...jsonViewProps}
      />
    </div>
  );
}
