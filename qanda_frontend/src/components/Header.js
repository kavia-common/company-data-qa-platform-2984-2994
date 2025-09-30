import React from "react";

// PUBLIC_INTERFACE
export default function Header({ onOpenUpload, onOpenUser, health, user }) {
  /** Top header with brand, health, and actions */
  return (
    <header className="oc-header">
      <div className="oc-brand">
        <div className="oc-logo">QA</div>
        <div className="oc-brand-text">
          <div className="oc-title">Company Q&A</div>
          <div className="oc-subtitle">Ocean Professional</div>
        </div>
      </div>
      <div className="oc-header-actions">
        {health && <span className="oc-health">• {health?.message || "OK"}</span>}
        <button className="oc-btn ghost" onClick={onOpenUpload} aria-label="Upload documents">
          ⬆ Upload
        </button>
        <button className="oc-btn primary" onClick={onOpenUser} aria-label="User account">
          {user?.display_name ? user.display_name : "Account"}
        </button>
      </div>
    </header>
  );
}
