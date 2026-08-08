"use client";

import { useState } from "react";

export function CopyHash({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <details className="hash-row">
      <summary>
        <span>{label}</span>
        <b>MATCH</b>
      </summary>
      <div>
        <code>{value}</code>
        <button type="button" onClick={copy}>
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
    </details>
  );
}
