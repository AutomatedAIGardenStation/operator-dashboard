import apiClient from './axios';
import type { GantryMoveRequest, GantryPosition } from './types';

export async function moveGantry(req: GantryMoveRequest): Promise<void> {
  await apiClient.post('/gantry/move', req);
}

export async function homeGantry(): Promise<void> {
  await apiClient.post('/gantry/home');
}

export async function getGantryPosition(): Promise<GantryPosition> {
  const { data } = await apiClient.get<GantryPosition>('/gantry/position');
  return data;
}
