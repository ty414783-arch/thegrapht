const desktopConfig = window.tgDesktop?.config || {};

const normalizeApiBase = (rawValue) => {
  const fallback = 'https://thegrapht.su/api';
  const source = String(rawValue || fallback).trim();
  if (!source) return fallback;

  try {
    const parsed = new URL(source);
    const normalizedPath = String(parsed.pathname || '').replace(/\/+$/, '');
    if (!normalizedPath || normalizedPath === '/') {
      parsed.pathname = '/api';
    } else if (normalizedPath === '/api') {
      parsed.pathname = '/api';
    } else {
      parsed.pathname = normalizedPath;
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    const cleaned = source.replace(/\/+$/, '');
    if (!cleaned || cleaned === '/') return '/api';
    if (cleaned.endsWith('/api') || cleaned === '/api') return cleaned;
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return `${cleaned}/api`;
    return cleaned;
  }
};

const configuredApiBase = normalizeApiBase(desktopConfig.apiBase || 'https://web.thegrapht.su/api');
const fallbackApiBases = ['https://web.thegrapht.su/api', 'https://thegrapht.su/api'];
const apiBaseCandidates = Array.from(new Set([configuredApiBase, ...fallbackApiBases].map((value) => normalizeApiBase(value)).filter(Boolean)));
export const API_BASE = apiBaseCandidates[0];
export const WS_BASE = String(desktopConfig.wsBase || 'wss://web.thegrapht.su/ws');
const TOKEN_STORAGE_KEY = 'tg_desktop_session_token';
const API_BASE_STORAGE_KEY = 'tg_desktop_api_base';

let sessionToken = '';
let activeApiBase = '';

const readStoredToken = () => {
  try {
    return String(window.localStorage.getItem(TOKEN_STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
};

const writeStoredToken = (token) => {
  const next = String(token || '').trim();
  try {
    if (next) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, next);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
  sessionToken = next;
};

const readStoredApiBase = () => {
  try {
    return normalizeApiBase(window.localStorage.getItem(API_BASE_STORAGE_KEY) || '');
  } catch {
    return '';
  }
};

const writeStoredApiBase = (base) => {
  const next = normalizeApiBase(base || '');
  try {
    if (next) {
      window.localStorage.setItem(API_BASE_STORAGE_KEY, next);
    } else {
      window.localStorage.removeItem(API_BASE_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
  activeApiBase = next;
};

sessionToken = readStoredToken();
activeApiBase = readStoredApiBase();

const joinUrl = (apiBase, path) => `${String(apiBase || '').replace(/\/+$/, '')}${path}`;

const parseJsonSafe = (text) => {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const formatApiError = (status, payload, path) => {
  const backendMessage = String(payload?.error || payload?.message || '').trim();
  if (backendMessage) return backendMessage;

  if (status === 0) return 'Network error. Check internet connection.';
  if (status === 400) return 'Invalid request data.';
  if (status === 401) {
    if (String(path || '').includes('/auth/login')) {
      return 'Invalid email or password.';
    }
    return 'Session expired. Please log in again.';
  }
  if (status === 403) return 'Access denied.';
  if (status === 404) return `API endpoint not found (${path}).`;
  if (status === 409) return 'Account already exists.';
  if (status === 422) return 'Please check input fields.';
  if (status >= 500) return 'Server error. Try again later.';
  return `Request failed (${status}).`;
};

export async function apiFetch(path, options = {}) {
  const normalizedPath = String(path || '');
  const isAuthRoute = normalizedPath.startsWith('/v1/auth/');
  const requestHeaders = {
    ...(options.headers || {})
  };

  if (!isAuthRoute && sessionToken && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${sessionToken}`;
  }

  const preferredCandidates = activeApiBase
    ? [activeApiBase, ...apiBaseCandidates.filter((item) => item !== activeApiBase)]
    : apiBaseCandidates;
  const candidates = isAuthRoute ? apiBaseCandidates : preferredCandidates;
  let lastError = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidateBase = candidates[index];
    const isLastCandidate = index === candidates.length - 1;

    try {
      const response = await fetch(joinUrl(candidateBase, path), {
        credentials: 'include',
        headers: requestHeaders,
        ...options
      });

      const rawBody = await response.text();
      const payload = parseJsonSafe(rawBody);

      if (response.ok) {
        writeStoredApiBase(candidateBase);

        if (payload === null) {
          const error = new Error(`Invalid API response (${response.status})`);
          error.status = response.status;
          if (!isLastCandidate) {
            lastError = error;
            continue;
          }
          throw error;
        }

        return payload;
      }

      const error = new Error(formatApiError(response.status, payload, path));
      error.status = response.status;
      error.apiBase = candidateBase;

      if (!isAuthRoute && activeApiBase && candidateBase === activeApiBase) {
        throw error;
      }

      if (!isLastCandidate && response.status === 404) {
        lastError = error;
        continue;
      }

      throw error;
    } catch (error) {
      if (error instanceof TypeError) {
        const networkError = new Error('Network error. Unable to reach API server.');
        networkError.status = 0;
        lastError = networkError;
      } else {
        lastError = error;
      }
      if (isLastCandidate) {
        throw lastError;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Request failed');
}

export const authApi = {
  async login(email, password) {
    // Always attempt login with a clean auth header/cookie state.
    writeStoredToken('');
    writeStoredApiBase('');
    const payload = await apiFetch('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (payload?.token) {
      writeStoredToken(payload.token);
    }
    return payload;
  },

  async register(name, email, password) {
    const payload = await apiFetch('/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (payload?.token) {
      writeStoredToken(payload.token);
    }
    return payload;
  },

  async verify(email, code) {
    const payload = await apiFetch('/v1/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (payload?.token) {
      writeStoredToken(payload.token);
    }
    return payload;
  },

  async resend(email) {
    return apiFetch('/v1/auth/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  async logout() {
    try {
      await apiFetch('/v1/auth/logout', { method: 'POST' });
    } finally {
      writeStoredToken('');
    }
  }
};


export const chatApi = {
  getClientState: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        query.set(key, String(value));
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/v1/client-state${suffix}`);
  },

  getDialogMessages: (publicId) => apiFetch(`/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/messages`),

  sendMessage: (publicId, body) => apiFetch(`/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body })
  }),

  markRead: (publicId) => apiFetch(`/v1/dialogs/by-public-id/${encodeURIComponent(publicId)}/read`, {
    method: 'POST'
  })
};

export const tokenApi = {
  clear: () => {
    writeStoredToken('');
    writeStoredApiBase('');
  },
  get: () => sessionToken
};
