import apiClient from "./axios";
import type {
  CreatePlantRequest,
  Plant,
  PlantListParams,
  PlantListResponse,
  UpdatePlantRequest,
} from "./types";

export async function getPlants(params?: PlantListParams): Promise<PlantListResponse> {
  const { data } = await apiClient.get<PlantListResponse>("/plants", { params });
  return data;
}

export async function getPlant(plantId: number): Promise<Plant> {
  const { data } = await apiClient.get<Plant>(`/plants/${plantId}`);
  return data;
}

export async function createPlant(plant: CreatePlantRequest): Promise<Plant> {
  const { data } = await apiClient.post<Plant>("/plants", plant);
  return data;
}

export async function updatePlant(plantId: number, updates: UpdatePlantRequest): Promise<Plant> {
  const { data } = await apiClient.put<Plant>(`/plants/${plantId}`, updates);
  return data;
}

export async function deletePlant(plantId: number): Promise<void> {
  await apiClient.delete(`/plants/${plantId}`);
}
