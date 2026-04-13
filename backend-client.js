const API_BASE_URL = window.SUPABASE_URL || "http://localhost:3000";

function isOnline() {
  return window.navigator.onLine;
}

function getRemoteAuthToken() {
  return sessionStorage.getItem("sunesis_token") || localStorage.getItem("sunesis_token");
}

function getRemoteAuthHeaders() {
  const token = getRemoteAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch(path, options = {}) {
  if (!isOnline()) {
    throw new Error("Offline");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getRemoteAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (error) {
    body = { message: text };
  }

  if (!response.ok) {
    throw new Error(body?.message || response.statusText || "API request failed");
  }

  return body;
}

async function remoteRegister(username, password, role = "user") {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });
}

async function remoteLogin(username, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

async function remoteGetMe() {
  return apiFetch("/auth/me");
}

async function remoteFetchTopics() {
  return apiFetch("/topics");
}

async function remoteFetchSlides(topic) {
  const query = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  return apiFetch(`/slides${query}`);
}

async function remoteCreateTopic(name) {
  return apiFetch("/topics", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

async function remoteCreateSlide(slide) {
  return apiFetch("/slides", {
    method: "POST",
    body: JSON.stringify(slide),
  });
}

async function remoteDeleteTopic(name) {
  return apiFetch(`/topics/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

async function remoteDeleteSlidesByTopic(name) {
  return apiFetch(`/topics/${encodeURIComponent(name)}/slides`, {
    method: "DELETE",
  });
}

async function remoteDeleteSlide(id) {
  return apiFetch(`/slides/${id}`, {
    method: "DELETE",
  });
}

async function remoteDeleteAll() {
  return apiFetch("/all", {
    method: "DELETE",
  });
}

function saveRemoteSession(user, token, remember = false) {
  if (remember) {
    localStorage.setItem("sunesis_token", token);
    localStorage.setItem("sunesis_user", user.username);
    localStorage.setItem("sunesis_role", user.role);
    localStorage.setItem("sunesis_logged_in", "true");
  }

  sessionStorage.setItem("sunesis_token", token);
  sessionStorage.setItem("sunesis_user", user.username);
  sessionStorage.setItem("sunesis_role", user.role);
  sessionStorage.setItem("sunesis_logged_in", "true");
}

function clearRemoteSession() {
  sessionStorage.removeItem("sunesis_token");
  sessionStorage.removeItem("sunesis_role");
  localStorage.removeItem("sunesis_token");
  localStorage.removeItem("sunesis_role");
}

function getRemoteUserRole() {
  return sessionStorage.getItem("sunesis_role") || localStorage.getItem("sunesis_role") || "user";
}

function isRemoteAdmin() {
  return getRemoteUserRole() === "sunesis_admin";
}
