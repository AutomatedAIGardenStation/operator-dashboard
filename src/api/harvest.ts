import apiClient from "./client";
import type {
  EnqueueHarvestRequest,
  EnqueueHarvestResponse,
  HarvestQueueParams,
  HarvestQueueResponse,
  UpdateHarvestTaskRequest,
} from "./types";

export async function getQueue(params?: HarvestQueueParams): Promise<HarvestQueueResponse> {
  const { data } = await apiClient.get<HarvestQueueResponse>("/harvest/queue", { params });
  return data;
}

export async function enqueueJob(job: EnqueueHarvestRequest): Promise<EnqueueHarvestResponse> {
  const { data } = await apiClient.post<EnqueueHarvestResponse>("/harvest/queue", job);
  return data;
}

export async function updateTask(
  taskId: string,
  updates: UpdateHarvestTaskRequest,
): Promise<void> {
  await apiClient.patch(`/harvest/queue/${taskId}`, updates);
}
