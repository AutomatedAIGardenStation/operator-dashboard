import apiClient from './axios';
import type { CurrentToolResponse, ToolType } from './types';

export async function dockTool(): Promise<void> {
  await apiClient.post('/tools/dock');
}

export async function releaseTool(toolType: ToolType): Promise<void> {
  await apiClient.post('/tools/release', { tool_type: toolType });
}

export async function getCurrentTool(): Promise<CurrentToolResponse> {
  const { data } = await apiClient.get<CurrentToolResponse>('/tools/current');
  return data;
}
