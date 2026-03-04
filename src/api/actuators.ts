import apiClient from "./client";
import type {
  ActivateActuatorRequest,
  ActivateActuatorResponse,
  Actuator,
  ActuatorListParams,
  ActuatorListResponse,
  ActuatorStatusResponse,
} from "./types";

export async function getActuators(params?: ActuatorListParams): Promise<ActuatorListResponse> {
  const { data } = await apiClient.get<ActuatorListResponse>("/actuators", { params });
  return data;
}

export async function getActuator(actuatorId: number): Promise<Actuator> {
  const { data } = await apiClient.get<Actuator>(`/actuators/${actuatorId}`);
  return data;
}

export async function activateActuator(
  actuatorId: number,
  command: ActivateActuatorRequest,
): Promise<ActivateActuatorResponse> {
  const { data } = await apiClient.post<ActivateActuatorResponse>(
    `/actuators/${actuatorId}/activate`,
    command,
  );
  return data;
}

export async function deactivateActuator(actuatorId: number): Promise<void> {
  await apiClient.post(`/actuators/${actuatorId}/deactivate`);
}

export async function getActuatorStatus(actuatorId: number): Promise<ActuatorStatusResponse> {
  const { data } = await apiClient.get<ActuatorStatusResponse>(
    `/actuators/${actuatorId}/status`,
  );
  return data;
}
