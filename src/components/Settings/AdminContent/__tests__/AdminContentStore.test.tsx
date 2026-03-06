import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminContentStore } from '../../../../store/adminContentStore';
import * as adminApi from '../../../../api/admin';

// Mock the API module
vi.mock('../../../../api/admin', () => ({
  getAdminPosts: vi.fn(),
  createAdminPost: vi.fn(),
  updateAdminPost: vi.fn(),
  deleteAdminPost: vi.fn(),
}));

const mockPosts = [
  { id: '1', title: 'Test 1', slug: 'test-1', content: 'test content 1', status: 'draft' as const, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

describe('AdminContentStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminContentStore.setState({ posts: [], loading: false, error: null });
  });

  it('fetchPosts should populate posts', async () => {
    (adminApi.getAdminPosts as any).mockResolvedValue(mockPosts);

    await useAdminContentStore.getState().fetchPosts();

    expect(useAdminContentStore.getState().posts).toHaveLength(1);
    expect(useAdminContentStore.getState().posts[0]?.id).toBe('1');
    expect(useAdminContentStore.getState().loading).toBe(false);
  });

  it('createPost should add a new post to state', async () => {
    const newPostReq = { title: 'Test 2', slug: 'test-2', content: 'content', status: 'published' as const };
    const newPostRes = { id: '2', ...newPostReq, created_at: '2024-01-02', updated_at: '2024-01-02' };

    (adminApi.createAdminPost as any).mockResolvedValue(newPostRes);

    await useAdminContentStore.getState().createPost(newPostReq);

    expect(useAdminContentStore.getState().posts).toHaveLength(1);
    expect(useAdminContentStore.getState().posts[0]?.id).toBe('2');
  });

  it('updatePost should modify an existing post in state', async () => {
    useAdminContentStore.setState({ posts: mockPosts });

    const updatedPostReq = { title: 'Updated Test 1', slug: 'test-1', content: 'test content 1', status: 'draft' as const };
    const updatedPostRes = { ...mockPosts[0], ...updatedPostReq };

    (adminApi.updateAdminPost as any).mockResolvedValue(updatedPostRes);

    await useAdminContentStore.getState().updatePost('1', updatedPostReq);

    expect(useAdminContentStore.getState().posts).toHaveLength(1);
    expect(useAdminContentStore.getState().posts[0]?.title).toBe('Updated Test 1');
  });

  it('deletePost should remove post from state', async () => {
    useAdminContentStore.setState({ posts: mockPosts });

    (adminApi.deleteAdminPost as any).mockResolvedValue();

    await useAdminContentStore.getState().deletePost('1');

    expect(useAdminContentStore.getState().posts).toHaveLength(0);
  });
});
