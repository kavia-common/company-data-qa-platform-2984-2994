import React, { useState } from "react";

// PUBLIC_INTERFACE
export default function MessageInput({ onSend, loading }) {
  /** Bottom input for sending a question */
  const [value, setValue] = useState("");

  const handleSend = () => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  };

  return (
    <div className="oc-inputbar">
      <input
        className="oc-input"
        type="text"
        placeholder="Ask a question about company data..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        aria-label="Question input"
      />
      <button className="oc-btn primary" onClick={handleSend} disabled={loading} aria-label="Send question">
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
