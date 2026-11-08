
// const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
const IS_LOCAL_FRONTEND =
  window.location.hostname === "localhost" &&
  window.location.port === "3000";

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  (IS_LOCAL_FRONTEND ? "http://localhost:8080" : "")
).replace(/\/+$/, "");

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const prefix = `${name}=`;
  const cookie = cookies.find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isForm = options.body instanceof FormData;

  if (options.body && !isForm && typeof options.body !== "string") {
    headers["Content-Type"] = "application/json";
    options = { ...options, body: JSON.stringify(options.body) };
  }

  const method = (options.method || "GET").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const csrfToken = getCookie("csrftoken");

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  const data =
    response.status === 204
      ? null
      : await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error || data?.detail || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

export function assetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}
