import apiClient from './axios';
import type { AdminPost, CreateAdminPostRequest, UpdateAdminPostRequest } from './types';

export async function triggerContentSync(): Promise<void> {
  await apiClient.post('/admin/content/sync');
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const { data } = await apiClient.get<{posts?: AdminPost[]}>('/admin/content');
  // Handle both { posts: [...] } or [...] response shapes
  return Array.isArray(data) ? data : (data.posts || []);
}

export async function createAdminPost(post: CreateAdminPostRequest): Promise<AdminPost> {
  const { data } = await apiClient.post<AdminPost>('/admin/content', post);
  return data;
}

export async function updateAdminPost(id: string, post: UpdateAdminPostRequest): Promise<AdminPost> {
  const { data } = await apiClient.put<AdminPost>(`/admin/content/${id}`, post);
  return data;
}

export async function deleteAdminPost(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/${id}`);
}
