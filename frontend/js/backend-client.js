/* ----
   Sunesis API Client (Production Ready)
   Works on:
   - Localhost (Express running on http://localhost:5500)
   - Vercel (Serverless functions under /api)
 */

/**
 * API base URL logic:
 * - Local development: backend runs on http://localhost:5500
 * - Production (Vercel): backend runs on same domain, under /api
 */
const local_origin = "http://localhost:5500";
const remote_origin = "https://sunesis.vercel.app";

const API_ORIGIN =
   window.location.hostname === "localhost"
     ? local_origin
     : remote_origin;


const API_BASE_URL = `${API_ORIGIN}/api`;

/**
 * Check if browser is online
 */
function isOnline() {
  return navigator.onLine;
}

// Get token stored in sessionStorage or localStorage

function getAuthToken() {
  return (
    sessionStorage.getItem("sunesis_token") ||
    localStorage.getItem("sunesis_token") ||
    null
  );
}

/**
 * Build headers for authenticated requests
 */
function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Central API Fetch Handler
 */
async function apiFetch(path, options = {}) {
  if (!isOnline()) {
    throw new Error("You are offline. Please check your internet connection.");
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: getAuthHeaders(options.headers || {}),
    body: options.body || null,
  });

  let data = null;
  const text = await response.text();

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || "Request failed");
  }

  return data;
}

// AUTH API

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

// TOPICS API

async function remoteFetchTopics() {
  return apiFetch("/topics");
}

async function remoteCreateTopic(name) {
  return apiFetch("/topics", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

async function remoteDeleteTopic(name) {
  return apiFetch(`/topics/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

// SLIDES API

async function remoteFetchSlides(topic = "") {
  const query = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  return apiFetch(`/slides${query}`);
}

async function remoteCreateSlide(slide) {
  return apiFetch("/slides", {
    method: "POST",
    body: JSON.stringify({
      topic: slide.topic,
      title: slide.title,
      description: slide.desc || slide.description || "",
      media: slide.media,
      type: slide.type,
    }),
  });
}

async function remoteDeleteSlide(id) {
  return apiFetch(`/slides/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

async function remoteDeleteSlidesByTopic(topicName) {
  return apiFetch(`/topics/${encodeURIComponent(topicName)}/slides`, {
    method: "DELETE",
  });
}

// ADMIN API

async function remoteDeleteAll() {
  return apiFetch("/all", {
    method: "DELETE",
  });
}

//  SESSION MANAGEMENT

/**
 * Save session in sessionStorage always
 * Save session in localStorage if remember = true
 */
function saveRemoteSession(user, token, remember = false) {
  // Always store in sessionStorage
  sessionStorage.setItem("sunesis_token", token);
  sessionStorage.setItem("sunesis_user", user.username);
  sessionStorage.setItem("sunesis_role", user.role);
  sessionStorage.setItem("sunesis_logged_in", "true");

  // Optionally store in localStorage
  if (remember) {
    localStorage.setItem("sunesis_token", token);
    localStorage.setItem("sunesis_user", user.username);
    localStorage.setItem("sunesis_role", user.role);
    localStorage.setItem("sunesis_logged_in", "true");
  }
}

/**
 * Clears all stored session values
 */
function clearRemoteSession() {
  sessionStorage.removeItem("sunesis_token");
  sessionStorage.removeItem("sunesis_user");
  sessionStorage.removeItem("sunesis_role");
  sessionStorage.removeItem("sunesis_logged_in");

  localStorage.removeItem("sunesis_token");
  localStorage.removeItem("sunesis_user");
  localStorage.removeItem("sunesis_role");
  localStorage.removeItem("sunesis_logged_in");
}

/**
 * Returns currently logged in username
 */
function getRemoteUsername() {
  return (
    sessionStorage.getItem("sunesis_user") ||
    localStorage.getItem("sunesis_user") ||
    null
  );
}

/**
 * Returns user role
 */
function getRemoteUserRole() {
  return (
    sessionStorage.getItem("sunesis_role") ||
    localStorage.getItem("sunesis_role") ||
    "user"
  );
}

/**
 * Check if user is admin
 */
function isRemoteAdmin() {
  return getRemoteUserRole() === "Nmenichimso";
}

/**
 * Check if user is logged in
 */
function isRemoteLoggedIn() {
  return (
    sessionStorage.getItem("sunesis_logged_in") === "true" ||
    localStorage.getItem("sunesis_logged_in") === "true"
  );
}

// OPTIONAL: Auto logout if session is invalid (e.g. token expired)

async function validateSessionOrLogout() {
  try {
    const me = await remoteGetMe();
    return me;
  } catch (err) {
    clearRemoteSession();
    throw err;
  }
}