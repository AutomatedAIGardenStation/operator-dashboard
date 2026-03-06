import apiClient from './axios';

export async function triggerContentSync(): Promise<void> {
  await apiClient.post('/admin/content');
}
