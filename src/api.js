/** API root: origin only, e.g. http://localhost:3000 — /api is appended automatically. */
function getApiBase() {
  const raw = import.meta.env.VITE_BASE_API_URL;
  if (raw == null || String(raw).trim() === '') {
    return '/api';
  }
  const origin = String(raw).replace(/\/$/, '');
  return `${origin}/api`;
}

export async function apiJson(path, options = {}) {
  const { body, headers, ...rest } = options;
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
