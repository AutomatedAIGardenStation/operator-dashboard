import apiClient from "./client";
import type { InferenceRequest, InferenceResponse, MLModelsResponse } from "./types";

export async function runInference(request: InferenceRequest): Promise<InferenceResponse> {
  const { data } = await apiClient.post<InferenceResponse>("/ml/infer", request);
  return data;
}

export async function getModels(): Promise<MLModelsResponse> {
  const { data } = await apiClient.get<MLModelsResponse>("/ml/models");
  return data;
}
