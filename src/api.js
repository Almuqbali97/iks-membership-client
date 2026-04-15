/** API root: origin only, e.g. http://localhost:3000 — /api is appended automatically. */
const AUTH_TOKEN_KEY = 'iks_auth_token';

function getApiBase() {
  const raw = import.meta.env.VITE_BASE_API_URL;
  if (raw == null || String(raw).trim() === '') {
    return '/api';
  }
  const origin = String(raw).replace(/\/$/, '');
  return `${origin}/api`;
}

export function setAuthToken(token) {
  const value = String(token || '').trim();
  if (!value) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, value);
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export async function apiJson(path, options = {}) {
  const { body, headers, ...rest } = options;
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getAuthToken();

  const res = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    if (res.status === 401) {
      setAuthToken('');
    }
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
