import apiClient from './axios';
import type { GantryMoveRequest, GantryPosition } from './types';

import { API_ENDPOINTS } from './endpoints';

export async function moveGantry(req: GantryMoveRequest): Promise<void> {
  await apiClient.post(API_ENDPOINTS.GANTRY.MOVE, req);
}

export async function homeGantry(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.GANTRY.HOME);
}

export async function getGantryPosition(): Promise<GantryPosition> {
  const { data } = await apiClient.get<GantryPosition>(API_ENDPOINTS.GANTRY.POSITION);
  return data;
}
