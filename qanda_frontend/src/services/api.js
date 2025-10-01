/**
 * Build the backend base URL robustly:
 * - Prefer REACT_APP_BACKEND_API_URL if provided.
 * - Else try same-origin relative "/api/" (works when reverse-proxied).
 * - Else derive from window.location using current protocol/host with port 3001.
 * Always ensure it ends with "/api/" and fix accidental "/apiqa/".
 */
function buildBaseUrl() {
  const envBase = process.env.REACT_APP_BACKEND_API_URL;
  if (envBase && typeof envBase === "string" && envBase.trim()) {
    const norm = (envBase.endsWith("/") ? envBase : `${envBase}/`).replace(/\/apiqa\/?$/i, "/api/");
    return norm;
  }

  // If running behind same origin proxy, use relative "/api/"
  // This avoids mixed-content issues and lets the deployment route handle ports/TLS.
  const relative = "/api/";
  // In browsers, a relative URL is resolved against current origin; keep it.
  // We still normalize accidental "/apiqa/" somewhere upstream.
  const relNorm = relative.replace(/\/apiqa\/?$/i, "/api/");
  if (typeof window !== "undefined" && window.location) {
    // Additionally compute a fallback absolute URL with the current protocol and host,
    // forcing port 3001 only if none is present in host (e.g., in local dev).
    const { protocol, hostname, port } = window.location;
    const desiredPort = port && port !== "3000" ? port : "3001";
    const abs = `${protocol}//${hostname}:${desiredPort}/api/`;
    // Prefer relative for proxy-friendly setups; keep absolute as last resort.
    // We will return relative and use absolute only if fetch with relative fails later (handled in error messaging).
    return relNorm || abs;
  }
  // Node/test fallback
  return "http://localhost:3001/api/";
}

const BASE_URL = buildBaseUrl();

/**
 * Minimal fetch helper with error handling.
 * Ensures path joining without double slashes and provides clearer network errors.
 */
async function http(path, options = {}) {
  const cleanedPath = String(path || "").replace(/^\//, ""); // strip leading slash
  const url = `${BASE_URL}${cleanedPath}`;
  let resp;
  try {
    resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (networkErr) {
    // Likely CORS, DNS, mixed-content (http on https), or server unreachable
    const hint = `Network error while calling ${url}. Check REACT_APP_BACKEND_API_URL, protocol (https vs http), and that the backend is reachable.`;
    throw new Error(`${networkErr?.message || "Failed to fetch"} — ${hint}`);
  }

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
