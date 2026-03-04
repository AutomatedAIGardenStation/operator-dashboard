import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthTokens } from "./types";

const TOKEN_KEY = "gs_access_token";
const REFRESH_KEY = "gs_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshAccessToken(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data } = await axios.post<AuthTokens>(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refresh_token: refreshToken },
  );
  setTokens(data);
  return data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    if (!original || error.response?.status !== 401 || (original as unknown as Record<string, unknown>)._retry) {
      return Promise.reject(error);
    }

    (original as unknown as Record<string, unknown>)._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      const tokens = await refreshPromise;
      refreshPromise = null;

      if (original.headers) {
        original.headers.Authorization = `Bearer ${tokens.access_token}`;
      }
      return apiClient(original);
    } catch (refreshError) {
      refreshPromise = null;
      clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
