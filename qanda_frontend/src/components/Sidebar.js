import React from "react";

// PUBLIC_INTERFACE
export default function Sidebar({
  history = [],
  documents = [],
  activeTab = "history",
  onSelectHistory,
  onSelectDocument,
  onDeleteDocument,
  setActiveTab,
}) {
  /** Left sidebar with tabs for history and documents */
  return (
    <aside className="oc-sidebar">
      <div className="oc-tabs">
        <button
          className={`oc-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={`oc-tab ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
      </div>

      <div className="oc-tabpanel">
        {activeTab === "history" && (
          <div className="oc-list">
            {history.length === 0 && (
              <div className="oc-empty">No questions yet. Start by asking something!</div>
            )}
            {history.map((item, idx) => (
              <button key={idx} className="oc-list-item" onClick={() => onSelectHistory(idx)}>
                <div className="oc-list-title">{item.question}</div>
                <div className="oc-list-subtitle">{new Date(item.ts).toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="oc-list">
            {documents.length === 0 && (
              <div className="oc-empty">No documents yet. Upload or create documents.</div>
            )}
            {documents.map((doc) => (
              <div key={doc.id} className="oc-list-item row">
                <div>
                  <div className="oc-list-title">{doc.title}</div>
                  {doc.description && <div className="oc-list-subtitle">{doc.description}</div>}
                </div>
                <div className="oc-actions">
                  <button className="oc-btn xs ghost" onClick={() => onSelectDocument(doc)}>View</button>
                  <button className="oc-btn xs danger ghost" onClick={() => onDeleteDocument(doc.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
