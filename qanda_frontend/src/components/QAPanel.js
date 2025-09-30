import React from "react";

/**
 * PUBLIC_INTERFACE
 * QAPanel displays a single question/answer turn with references in a human-readable layout.
 * It normalizes possibly nested objects from the API (e.g., {question: {text}, answer_text, references: [...]})
 * and avoids dumping stringified JSON into the UI.
 */
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

  // Normalize a possibly nested "question" payload into plain text
  const getQuestionText = (q) => {
    if (q == null) return "";
    if (typeof q === "string") return q;
    if (typeof q === "object") {
      // prefer known fields
      if (typeof q.text === "string") return q.text;
      if (typeof q.question === "string") return q.question;
      try {
        const s = JSON.stringify(q);
        return s.length > 500 ? s.slice(0, 500) + "…" : s;
      } catch {
        return "";
      }
    }
    return String(q);
  };

  // Normalize a possibly nested "answer" payload into plain text
  const getAnswerText = (a) => {
    if (a == null) return "";
    if (typeof a === "string") return a;
    if (typeof a === "object") {
      if (typeof a.answer_text === "string") return a.answer_text;
      if (typeof a.text === "string") return a.text;
      if (typeof a.answer === "string") return a.answer;
      try {
        const s = JSON.stringify(a);
        return s.length > 1000 ? s.slice(0, 1000) + "…" : s;
      } catch {
        return "";
      }
    }
    return String(a);
  };

  const safeRefTitle = (ref, idx) => {
    if (!ref) return `Reference ${idx + 1}`;
    if (typeof ref === "string") return `Reference ${idx + 1}`;
    if (typeof ref === "object") {
      const t = ref.title ?? ref.name ?? ref.document_title ?? ref.id ?? `Reference ${idx + 1}`;
      return typeof t === "string" ? t : String(t);
    }
    return `Reference ${idx + 1}`;
  };

  const safeRefText = (ref) => {
    if (!ref) return "";
    if (typeof ref === "string") return ref;
    if (typeof ref === "object") {
      // Common fields from RAG snippets
      if (typeof ref.text === "string") return ref.text;
      if (typeof ref.content === "string") return ref.content;
      if (typeof ref.snippet === "string") return ref.snippet;
      if (typeof ref.excerpt === "string") return ref.excerpt;
      if (typeof ref.answer_text === "string") return ref.answer_text;
      // last resort: concise stringify
      try {
        const s = JSON.stringify(ref);
        return s.length > 1000 ? s.slice(0, 1000) + "…" : s;
      } catch {
        return "";
      }
    }
    return String(ref);
  };

  // If upstream stored the whole turn in different shapes, normalize
  const question = getQuestionText(activeTurn.question ?? activeTurn?.question_text ?? activeTurn?.query ?? "");
  const answer = getAnswerText(
    activeTurn.answer_text ?? activeTurn.answer ?? activeTurn?.response ?? activeTurn
  ) || "No answer.";
  const references = Array.isArray(activeTurn.references)
    ? activeTurn.references
    : Array.isArray(activeTurn.refs)
    ? activeTurn.refs
    : [];

  return (
    <div className="oc-panel">
      <div className="oc-msg question">
        <div className="oc-avatar user" aria-hidden="true">🧑</div>
        <div className="oc-bubble">
          <div className="oc-bubble-header">Question</div>
          <div className="oc-bubble-body">{question}</div>
        </div>
      </div>

      <div className="oc-msg answer">
        <div className="oc-avatar bot" aria-hidden="true">🤖</div>
        <div className="oc-bubble">
          <div className="oc-bubble-header">Answer</div>
          <div className="oc-bubble-body">{answer}</div>

          {references.length > 0 && (
            <div className="oc-bubble-refs">
              <div className="oc-refs-title">References</div>
              <ul className="oc-refs-list">
                {references.map((ref, i) => (
                  <li key={i} className="oc-ref-item">
                    <div className="oc-ref-title">{safeRefTitle(ref, i)}</div>
                    {safeRefText(ref) && (
                      <div className="oc-ref-text">
                        {safeRefText(ref)}
                      </div>
                    )}
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
