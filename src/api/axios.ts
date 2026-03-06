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
    const original = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

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

    if (!original || axiosError.response?.status !== 401 || original._retry) {
      return Promise.reject(axiosError);
    }

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
  },
);

export default apiClient;
