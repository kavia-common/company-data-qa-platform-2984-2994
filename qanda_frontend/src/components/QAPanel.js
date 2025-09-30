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

  const { question, answer, references } = activeTurn;

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
          <div className="oc-bubble-body">{answer || "Thinking..."}</div>
          {Array.isArray(references) && references.length > 0 && (
            <div className="oc-bubble-refs">
              <div className="oc-refs-title">References</div>
              <ul className="oc-refs-list">
                {references.map((ref, i) => (
                  <li key={i} className="oc-ref-item">
                    <div className="oc-ref-title">{ref.title || `Chunk ${i + 1}`}</div>
                    {ref.text && <div className="oc-ref-text">{ref.text}</div>}
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
