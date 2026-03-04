import apiClient, { setTokens, clearTokens } from "./client";
import type { AuthTokens, LoginRequest } from "./types";

export async function login(credentials: LoginRequest): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>("/auth/login", credentials);
  setTokens(data);
  return data;
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  setTokens(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearTokens();
  }
}
