import axios from "axios";
import { useAuthStore } from "../store/authStore";
import type { AuthTokens, LoginRequest } from "./types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function login(credentials: LoginRequest): Promise<AuthTokens> {
  // Use a bare axios instance so we don't trigger interceptor loops on 401 invalid credentials
  const { data } = await axios.post<AuthTokens>(
    `${baseURL}/auth/login`,
    credentials,
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  // Use a bare axios instance so we don't trigger interceptor loops
  const { data } = await axios.post<AuthTokens>(
    `${baseURL}/auth/refresh`,
    { refresh_token: refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

export async function logout(): Promise<void> {
  // Use a bare axios instance to prevent deadlock loops when token is already expired
  const token = useAuthStore.getState().token;
  await axios.post(
    `${baseURL}/auth/logout`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    }
  );
}
