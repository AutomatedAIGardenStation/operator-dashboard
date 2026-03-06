import apiClient from './axios';
import type { DosingRecipeRequest, PumpRunRequest } from './types';

export async function triggerDosingRecipe(req: DosingRecipeRequest): Promise<void> {
  await apiClient.post('/dosing/recipe', req);
}

export async function runPump(req: PumpRunRequest): Promise<void> {
  await apiClient.post('/pump/run', req);
}
