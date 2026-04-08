// Thin wrapper around fetch. The base URL is read from VITE_API_BASE_URL so
// we can point at a local mock or the deployed API Gateway without code
// changes. See frontend/.env.development for local config.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getNotifications(role = 'student') {
  return request(`/notifications?role=${encodeURIComponent(role)}`);
}

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || '';

async function authRequest(path, body) {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export function login({ email, password }) {
  return authRequest('/auth/login', { email, password });
}

export function signup({ email, password, role }) {
  return authRequest('/auth/signup', { email, password, role });
}
