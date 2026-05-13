import axios from 'axios';

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Cookie helpers
export const getToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)kibilov_token=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
};

export const setToken = (token: string, days = 7) => {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `kibilov_token=${encodeURIComponent(token)};expires=${exp};path=/;SameSite=Lax`;
};

export const removeToken = () => {
  document.cookie = 'kibilov_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
};

export const getRefreshToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)kibilov_refresh=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
};

export const setRefreshToken = (token: string) => {
  const exp = new Date(Date.now() + 30 * 864e5).toUTCString();
  document.cookie = `kibilov_refresh=${encodeURIComponent(token)};expires=${exp};path=/;SameSite=Lax`;
};

// Request interceptor — attach token
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

// Response interceptor — auto refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (!refresh) return Promise.reject(err);

      if (isRefreshing) {
        return new Promise(resolve => queue.push((t: string) => {
          original.headers.Authorization = `Bearer ${t}`;
          resolve(api(original));
        }));
      }

      isRefreshing = true;
      try {
        const r = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken: refresh });
        const { accessToken, refreshToken } = r.data;
        setToken(accessToken);
        if (refreshToken) setRefreshToken(refreshToken);
        queue.forEach(cb => cb(accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        removeToken();
        queue = [];
        return Promise.reject(err);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(err);
  }
);

export default api;
