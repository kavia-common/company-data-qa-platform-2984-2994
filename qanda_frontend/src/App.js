import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { applyTheme } from "./theme";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QAPanel from "./components/QAPanel";
import MessageInput from "./components/MessageInput";
import Modal from "./components/Modal";
import {
  healthCheck,
  listDocuments,
  createDocument,
  deleteDocument,
  askQuestion,
  listUsers,
  createUser,
} from "./services/api";

// PUBLIC_INTERFACE
function App() {
  /** Root application: wires layout, theme, state, and API */
  const [health, setHealth] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]); // [{question, answer, references, ts}]
  const [activeIdx, setActiveIdx] = useState(-1);
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(false);

  // user
  const [user, setUser] = useState(null);

  // modals
  const [openUpload, setOpenUpload] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  // upload form
  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [docText, setDocText] = useState("");

  // user form
  const [userEmail, setUserEmail] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");

  useEffect(() => {
    applyTheme();
  }, []);

  useEffect(() => {
    // initial load: health, documents, maybe a user
    (async () => {
      try {
        const h = await healthCheck();
        setHealth(h);
      } catch (e) {
        setHealth({ message: "Backend unavailable" });
      }
      try {
        const docs = await listDocuments();
        setDocuments(docs || []);
      } catch (e) {
        // silent
      }
      try {
        const users = await listUsers();
        if (Array.isArray(users) && users.length > 0) {
          setUser(users[0]);
        }
      } catch (e) {
        // ignore if user system not initialized
      }
    })();
  }, []);

  const activeTurn = useMemo(() => (activeIdx >= 0 ? history[activeIdx] : null), [activeIdx, history]);

  async function handleSend(question) {
    setLoading(true);
    const turn = { question, answer: "", references: [], ts: Date.now() };
    const newHistory = [...history, turn];
    setHistory(newHistory);
    setActiveIdx(newHistory.length - 1);
    try {
      const res = await askQuestion({ question, user_id: user?.id });
      // backend response contract: { answer | answer_text, references? }
      const extractAnswer = (val) => {
        if (val == null) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
          if (typeof val.answer_text === "string") return val.answer_text;
          if (typeof val.text === "string") return val.text;
          if (typeof val.answer === "string") return val.answer;
          try {
            const s = JSON.stringify(val);
            return s.length > 1000 ? s.slice(0, 1000) + "…" : s;
          } catch {
            return "";
          }
        }
        return String(val);
      };
      const answerText = extractAnswer(res?.answer_text ?? res?.answer ?? res);

      const refsRaw = Array.isArray(res?.references) ? res.references : [];
      const normalizedRefs = refsRaw.map((r, i) => {
        if (r && typeof r === "object") {
          const title =
            typeof r.title === "string"
              ? r.title
              : typeof r.name === "string"
              ? r.name
              : typeof r.document_title === "string"
              ? r.document_title
              : `Reference ${r.chunk_index ?? i}`;
          const text =
            typeof r.text === "string"
              ? r.text
              : typeof r.content === "string"
              ? r.content
              : typeof r.snippet === "string"
              ? r.snippet
              : typeof r.excerpt === "string"
              ? r.excerpt
              : typeof r.answer_text === "string"
              ? r.answer_text
              : undefined;
          return { title, text };
        }
        return { title: `Reference ${i + 1}`, text: String(r) };
      });

      const updated = { ...turn, answer: (answerText || "No answer.").trim(), references: normalizedRefs };
      setHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = updated;
        return copy;
      });
    } catch (e) {
      setHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...turn, answer: `Error: ${e.message}` };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDocument() {
    if (!docTitle.trim()) return;
    const payload = {
      title: docTitle.trim(),
      description: docDesc.trim() || undefined,
      source: "manual",
      chunks: docText.trim()
        ? [{ text: docText.trim(), chunk_index: 0 }]
        : [],
    };
    try {
      const created = await createDocument(payload);
      setDocuments((prev) => [created, ...prev]);
      setDocTitle("");
      setDocDesc("");
      setDocText("");
      setOpenUpload(false);
      setActiveTab("documents");
    } catch (e) {
      alert(`Failed to create document: ${e.message}`);
    }
  }

  async function handleDeleteDocument(id) {
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      alert(`Failed to delete: ${e.message}`);
    }
  }

  async function handleEnsureUser() {
    if (!userEmail.trim()) {
      alert("Email is required");
      return;
    }
    try {
      const created = await createUser({
        email: userEmail.trim(),
        display_name: userDisplayName.trim() || undefined,
        is_active: true,
      });
      setUser(created);
      setOpenUser(false);
    } catch (e) {
      alert(`Failed to create user: ${e.message}`);
    }
  }

  return (
    <div className="app-shell">
      <Header
        onOpenUpload={() => setOpenUpload(true)}
        onOpenUser={() => setOpenUser(true)}
        health={health}
        user={user}
      />
      <div className="app-content">
        <Sidebar
          history={history}
          documents={documents}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectHistory={(idx) => setActiveIdx(idx)}
          onSelectDocument={(doc) => {
            setActiveTab("history");
            const q = `What does "${doc.title}" say?`;
            const turn = {
              question: q,
              answer: doc.description || "Open the document for more details.",
              references: (doc.chunks || []).slice(0, 3).map((c, i) => ({
                title: `Chunk ${c.chunk_index ?? i}`,
                text: c.text,
              })),
              ts: Date.now(),
            };
            setHistory((prev) => [...prev, turn]);
            setActiveIdx(history.length);
          }}
          onDeleteDocument={handleDeleteDocument}
        />
        <main className="oc-center">
          <div className="oc-panel-container" style={{ flex: 1, overflow: "auto" }}>
            <QAPanel activeTurn={activeTurn} />
          </div>
          <MessageInput onSend={handleSend} loading={loading} />
        </main>
      </div>

      {/* Upload Modal */}
      <Modal
        open={openUpload}
        title="Upload or Create Document"
        onClose={() => setOpenUpload(false)}
        footer={
          <>
            <button className="oc-btn ghost" onClick={() => setOpenUpload(false)}>Cancel</button>
            <button className="oc-btn primary" onClick={handleCreateDocument}>Save</button>
          </>
        }
      >
        <label>
          <div className="oc-list-subtitle">Title</div>
          <input
            className="oc-input"
            placeholder="e.g., HR Policy"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
          />
        </label>
        <label>
          <div className="oc-list-subtitle">Description</div>
          <input
            className="oc-input"
            placeholder="Optional short description"
            value={docDesc}
            onChange={(e) => setDocDesc(e.target.value)}
          />
        </label>
        <label>
          <div className="oc-list-subtitle">Content (optional, chunk 0)</div>
          <textarea
            className="oc-input"
            style={{ height: 140, borderRadius: 12 }}
            placeholder="Paste initial content for the first chunk"
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
          />
        </label>
      </Modal>

      {/* User Modal */}
      <Modal
        open={openUser}
        title="User Account"
        onClose={() => setOpenUser(false)}
        footer={
          <>
            <button className="oc-btn ghost" onClick={() => setOpenUser(false)}>Close</button>
            <button className="oc-btn primary" onClick={handleEnsureUser}>{user ? "Update" : "Create"}</button>
          </>
        }
      >
        {user ? (
          <div className="oc-list">
            <div className="oc-list-item">
              <div>
                <div className="oc-list-title">{user.display_name || user.email}</div>
                <div className="oc-list-subtitle">{user.email}</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <label>
              <div className="oc-list-subtitle">Email</div>
              <input
                className="oc-input"
                placeholder="you@company.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </label>
            <label>
              <div className="oc-list-subtitle">Display Name (optional)</div>
              <input
                className="oc-input"
                placeholder="e.g., Alex"
                value={userDisplayName}
                onChange={(e) => setUserDisplayName(e.target.value)}
              />
            </label>
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;
