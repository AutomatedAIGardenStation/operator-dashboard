import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { useCapabilitiesStore } from "../store/capabilitiesStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

export class CapabilityError extends Error {
  isCapabilityError = true;
  config: InternalAxiosRequestConfig;
  originalError?: AxiosError;

  constructor(message: string, config: InternalAxiosRequestConfig, originalError?: AxiosError) {
    super(message);
    this.name = 'CapabilityError';
    this.config = config;
    this.originalError = originalError;
  }
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  isServerError: boolean;

  constructor(message: string, error: AxiosError) {
    super(message);
    this.name = 'ApiError';
    this.status = error.response?.status;
    this.code = error.code;
    this.isNetworkError = !error.response && !!error.request;
    this.isTimeout = error.code === 'ECONNABORTED';
    this.isServerError = !!(this.status && this.status >= 500);
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const capabilityKey = `${config.method?.toUpperCase()} ${config.url}`;
  if (useCapabilitiesStore.getState().isCapabilityMissing(capabilityKey)) {
    return Promise.reject(new CapabilityError(
      `Feature unavailable: ${capabilityKey}`,
      config
    ));
  }

  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | CapabilityError) => {
    if (error instanceof CapabilityError || ('isCapabilityError' in error && error.isCapabilityError)) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError;
    const original = axiosError.config as InternalAxiosRequestConfig & { _retryCount?: number, _retry?: boolean };

    // Capability missing handling
    if (axiosError.response?.status === 404 || axiosError.response?.status === 405) {
      if (original) {
        const capabilityKey = `${original.method?.toUpperCase()} ${original.url}`;
        useCapabilitiesStore.getState().markCapabilityMissing(capabilityKey);
      }
      return Promise.reject(new CapabilityError(
        `Feature unavailable`,
        original,
        axiosError
      ));
    }

    // Auth Refresh handling
    if (axiosError.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore.getState().refresh();
        }
        await refreshPromise;
        refreshPromise = null;

        const newToken = useAuthStore.getState().token;
        if (original.headers && newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(original);
      } catch (refreshError) {
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    // Normalization & Retry logic
    const normalizedError = new ApiError(axiosError.message, axiosError);

    const isRetryable =
      original?.method?.toUpperCase() === 'GET' &&
      (normalizedError.isNetworkError || normalizedError.isTimeout || normalizedError.isServerError);

    if (isRetryable) {
      original._retryCount = original._retryCount ?? 0;
      if (original._retryCount < 2) {
        original._retryCount += 1;
        const delay = Math.pow(2, original._retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(original);
      }
    }

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
