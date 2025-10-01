/**
 * Build the backend base URL robustly:
 * - Prefer REACT_APP_BACKEND_API_URL if provided (must end with /api/).
 * - Else try same-origin relative "/api/" (works only when reverse-proxied).
 * Always ensure it ends with "/api/" and fix accidental "/apiqa/".
 */
function buildBaseUrl() {
  const envBase = process.env.REACT_APP_BACKEND_API_URL;
  if (envBase && typeof envBase === "string" && envBase.trim()) {
    // Normalize: enforce trailing slash, correct path ending
    let norm = envBase.trim();
    if (!/^[a-z]+:\/\//i.test(norm)) {
      console.warn(
        "[API] REACT_APP_BACKEND_API_URL should include protocol (http/https). Current:",
        norm
      );
    }
    // Fix accidental /apiqa and ensure /api/ ending
    norm = (norm.endsWith("/") ? norm : `${norm}/`).replace(/\/apiqa\/?$/i, "/api/");
    if (!/\/api\/$/i.test(norm)) {
      if (/\/api$/i.test(norm)) norm = `${norm}/`;
      else norm = norm.replace(/\/?$/, "/api/");
    }
    // Warn on mixed content risk
    if (typeof window !== "undefined" && window.location) {
      const pageIsHttps = window.location.protocol === "https:";
      const envIsHttp = norm.toLowerCase().startsWith("http:");
      if (pageIsHttps && envIsHttp) {
        console.warn(
          "[API] Detected HTTPS page with HTTP API URL; this will be blocked by the browser (mixed content).",
          "Use an HTTPS API URL."
        );
      }
    }
    return norm;
  }

  // No env set: rely on relative /api/ which only works behind a reverse proxy
  const relBase = "/api/";
  console.warn(
    "[API] REACT_APP_BACKEND_API_URL is not set; using relative '/api/'." +
      " This requires the frontend host to reverse-proxy to the backend. In cloud previews, set REACT_APP_BACKEND_API_URL to the backend's full HTTPS URL (ending with /api/)."
  );
  return relBase.replace(/\/apiqa\/?$/i, "/api/");
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
    const hint =
      `Network error while calling ${url}. ` +
      `Resolved BASE_URL='${BASE_URL}'. ` +
      `If this is a cloud preview, ensure REACT_APP_BACKEND_API_URL is set to the backend's HTTPS domain ending with /api/.`;
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
