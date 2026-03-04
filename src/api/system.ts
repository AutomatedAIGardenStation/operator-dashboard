import apiClient from "./client";
import type { RebootResponse, SystemConfig, SystemStatus } from "./types";

export async function getStatus(): Promise<SystemStatus> {
  const { data } = await apiClient.get<SystemStatus>("/system/status");
  return data;
}

export async function getConfig(): Promise<SystemConfig> {
  const { data } = await apiClient.get<SystemConfig>("/system/config");
  return data;
}

export async function updateConfig(config: SystemConfig): Promise<void> {
  await apiClient.post("/system/config", config);
}

export async function reboot(): Promise<RebootResponse> {
  const { data } = await apiClient.post<RebootResponse>("/system/reboot");
  return data;
}
