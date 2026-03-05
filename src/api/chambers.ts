import apiClient from "./axios";
import type { Chamber, ChamberListResponse } from "./types";

export async function getChambers(): Promise<ChamberListResponse> {
  const { data } = await apiClient.get<ChamberListResponse>("/chambers");
  return data;
}

export async function getChamber(chamberId: number): Promise<Chamber> {
  const { data } = await apiClient.get<Chamber>(`/chambers/${chamberId}`);
  return data;
}
