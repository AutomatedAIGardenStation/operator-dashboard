import { create } from 'zustand';
import type { AdminPost, CreateAdminPostRequest, UpdateAdminPostRequest } from '../api/types';
import { getAdminPosts, createAdminPost, updateAdminPost, deleteAdminPost } from '../api/admin';

interface AdminContentState {
  posts: AdminPost[];
  loading: boolean;
  error: string | null;

  fetchPosts: () => Promise<void>;
  createPost: (post: CreateAdminPostRequest) => Promise<void>;
  updatePost: (id: string, post: UpdateAdminPostRequest) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

export const useAdminContentStore = create<AdminContentState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const posts = await getAdminPosts();
      set({ posts, loading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message || 'Failed to fetch posts', loading: false });
    }
  },

  createPost: async (post: CreateAdminPostRequest) => {
    set({ loading: true, error: null });
    try {
      const newPost = await createAdminPost(post);
      set({ posts: [...get().posts, newPost], loading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message || 'Failed to create post', loading: false });
      throw err;
    }
  },

  updatePost: async (id: string, post: UpdateAdminPostRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedPost = await updateAdminPost(id, post);
      set({
        posts: get().posts.map(p => (p.id === id ? updatedPost : p)),
        loading: false,
      });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message || 'Failed to update post', loading: false });
      throw err;
    }
  },

  deletePost: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteAdminPost(id);
      set({
        posts: get().posts.filter(p => p.id !== id),
        loading: false,
      });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message || 'Failed to delete post', loading: false });
      throw err;
    }
  },
}));
