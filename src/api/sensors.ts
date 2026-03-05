import apiClient from "./axios";
import type {
  Sensor,
  SensorHistory,
  SensorHistoryParams,
  SensorHistoryResponse,
  SensorListParams,
  SensorListResponse,
} from "./types";

export async function getSensors(params?: SensorListParams): Promise<SensorListResponse> {
  const { data } = await apiClient.get<SensorListResponse>("/sensors", { params });
  return data;
}

export async function getSensor(sensorId: number): Promise<Sensor> {
  const { data } = await apiClient.get<Sensor>(`/sensors/${sensorId}`);
  return data;
}

export async function getSensorHistory(
  sensorId: number,
  params?: SensorHistoryParams,
): Promise<SensorHistoryResponse> {
  const { data } = await apiClient.get<SensorHistoryResponse>(
    `/sensors/${sensorId}/history`,
    { params },
  );
  return data;
}

export async function getHistory(
  zone: number,
  range: string,
): Promise<SensorHistory[]> {
  const { data } = await apiClient.get<SensorHistory[]>(
    `/sensors`,
    { params: { zone, history: range } },
  );
  return data;
}
