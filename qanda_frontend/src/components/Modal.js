import React from "react";

// PUBLIC_INTERFACE
export default function Modal({ open, title, children, onClose, footer }) {
  /** Generic modal dialog */
  if (!open) return null;
  return (
    <div className="oc-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="oc-modal">
        <div className="oc-modal-header">
          <div className="oc-modal-title">{title}</div>
          <button className="oc-btn icon ghost" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <div className="oc-modal-body">{children}</div>
        {footer && <div className="oc-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
