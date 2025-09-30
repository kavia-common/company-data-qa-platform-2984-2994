/**
 * Build the backend base URL, ensuring it ends with `/api/` to avoid 404s when the
 * environment value accidentally omits or uses a wrong suffix like `/apiqa/`.
 * This normalizes common mistakes and keeps request construction consistent.
 */
const RAW_BASE = process.env.REACT_APP_BACKEND_API_URL || "http://localhost:3001/api/";
// Normalize to ensure trailing `/`
const NORMALIZED = RAW_BASE.endsWith("/") ? RAW_BASE : `${RAW_BASE}/`;
// Replace accidental `/apiqa/` with `/api/`
const BASE_URL = NORMALIZED.replace(/\/apiqa\/?$/i, "/api/");

/**
 * Minimal fetch helper with error handling.
 * Ensures path joining without double slashes.
 */
async function http(path, options = {}) {
  const cleanedPath = String(path || "").replace(/^\//, ""); // strip leading slash
  const url = `${BASE_URL}${cleanedPath}`;
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = resp.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!resp.ok) {
    const errText = isJson ? JSON.stringify(await resp.json()).slice(0, 500) : await resp.text();
    throw new Error(`API ${resp.status}: ${errText}`);
  }
  return isJson ? resp.json() : resp.text();
}

// PUBLIC_INTERFACE
export async function healthCheck() {
  /** Returns backend health message */
  return http("/health/");
}

// PUBLIC_INTERFACE
export async function askQuestion({ question, user_id }) {
  /** Ask a question, returns an answer with references */
  return http("/qa/", {
    method: "POST",
    body: JSON.stringify({ question, user_id }),
  });
}

// PUBLIC_INTERFACE
export async function listDocuments() {
  /** List all documents */
  return http("/documents/");
}

// PUBLIC_INTERFACE
export async function createDocument(doc) {
  /** Create a document with optional chunks */
  return http("/documents/", {
    method: "POST",
    body: JSON.stringify(doc),
  });
}

// PUBLIC_INTERFACE
export async function getDocument(id) {
  /** Retrieve a single document by id */
  return http(`/documents/${id}/`);
}

// PUBLIC_INTERFACE
export async function deleteDocument(id) {
  /** Delete a document */
  return http(`/documents/${id}/`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export async function addDocumentChunk(id, chunk) {
  /** Partial update to add a chunk: { add_chunk: { text, chunk_index? } } */
  return http(`/documents/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ add_chunk: chunk }),
  });
}

// PUBLIC_INTERFACE
export async function listUsers() {
  /** List users */
  return http("/users/");
}

// PUBLIC_INTERFACE
export async function createUser(user) {
  /** Create a user */
  return http("/users/", { method: "POST", body: JSON.stringify(user) });
}

// PUBLIC_INTERFACE
export async function getUser(id) {
  /** Retrieve user */
  return http(`/users/${id}/`);
}

// PUBLIC_INTERFACE
export async function updateUser(id, user) {
  /** Update user */
  return http(`/users/${id}/`, { method: "PUT", body: JSON.stringify(user) });
}
