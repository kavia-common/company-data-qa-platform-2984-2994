import React from "react";

// PUBLIC_INTERFACE
export default function QAPanel({ activeTurn }) {
  /** Show a single Q&A turn with references and friendly layout */
  if (!activeTurn) {
    return (
      <div className="oc-panel-empty">
        <div className="oc-hero">
          <div className="oc-hero-icon">💬</div>
          <div className="oc-hero-title">Ask about your company data</div>
          <div className="oc-hero-sub">Type a question below to get started.</div>
        </div>
      </div>
    );
  }

  // Defensive render helpers to avoid passing objects as React children
  const toText = (val, fallback = "") => {
    if (val == null) return fallback;
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      return String(val);
    }
    // If backend returned an object by mistake, stringify a concise view
    try {
      // Prefer common fields if present
      if (typeof val === "object") {
        if ("text" in val) return String(val.text ?? fallback);
        if ("answer_text" in val) return String(val.answer_text ?? fallback);
        if ("answer" in val) return String(val.answer ?? fallback);
        if ("question" in val) return String(val.question ?? fallback);
      }
      const s = JSON.stringify(val);
      return s.length > 500 ? s.slice(0, 500) + "…" : s;
    } catch {
      return fallback;
    }
  };

  const safeRefTitle = (ref, idx) => {
    if (!ref || typeof ref !== "object") return `Chunk ${idx + 1}`;
    const t = ref.title ?? ref.name ?? ref.id ?? `Chunk ${idx + 1}`;
    return toText(t, `Chunk ${idx + 1}`);
  };

  const safeRefText = (ref) => {
    if (!ref) return "";
    if (typeof ref === "string") return ref;
    if (typeof ref === "object") {
      // known fields from backend
      if ("text" in ref && ref.text) return toText(ref.text);
      if ("content" in ref && ref.content) return toText(ref.content);
      if ("answer_text" in ref && ref.answer_text) return toText(ref.answer_text);
    }
    return toText(ref, "");
  };

  const question = toText(activeTurn.question, "");
  // Some backends may return {answer_text, ...}; fall back to .answer
  const answer =
    toText(
      (activeTurn && (activeTurn.answer_text ?? activeTurn.answer)),
      "Thinking..."
    ) || "Thinking...";
  const references = Array.isArray(activeTurn.references) ? activeTurn.references : [];

  return (
    <div className="oc-panel">
      <div className="oc-msg question">
        <div className="oc-avatar user">🧑</div>
        <div className="oc-bubble">
          <div className="oc-bubble-header">You</div>
          <div className="oc-bubble-body">{question}</div>
        </div>
      </div>

      <div className="oc-msg answer">
        <div className="oc-avatar bot">🤖</div>
        <div className="oc-bubble">
          <div className="oc-bubble-header">Assistant</div>
          <div className="oc-bubble-body">{answer}</div>
          {references.length > 0 && (
            <div className="oc-bubble-refs">
              <div className="oc-refs-title">References</div>
              <ul className="oc-refs-list">
                {references.map((ref, i) => (
                  <li key={i} className="oc-ref-item">
                    <div className="oc-ref-title">{safeRefTitle(ref, i)}</div>
                    {safeRefText(ref) && <div className="oc-ref-text">{safeRefText(ref)}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
