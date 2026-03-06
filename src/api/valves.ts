import apiClient from './axios';
import type { ValveSetRequest } from './types';

export async function setValve(req: ValveSetRequest): Promise<void> {
  await apiClient.post('/valves/set', req);
}
