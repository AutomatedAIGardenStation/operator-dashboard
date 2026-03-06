import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminContentModal } from '../AdminContentModal';
import { AdminPostEditor } from '../AdminPostEditor';
import { useAdminContentStore } from '../../../../store/adminContentStore';

// Mock the store
vi.mock('../../../../store/adminContentStore', () => ({
  useAdminContentStore: vi.fn(),
}));

// Mock Ionic React to avoid IonModal not rendering children in JSDOM easily
vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    IonModal: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null),
  };
});

const mockPosts = [
  { id: '1', title: 'First Post', slug: 'first-post', content: 'Content 1', status: 'published', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', title: 'Draft Post', slug: 'draft-post', content: 'Content 2', status: 'draft', created_at: '2024-01-02', updated_at: '2024-01-02' },
];

describe('AdminContent UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AdminContentModal', () => {
    it('should show loading spinner when loading and no posts exist', () => {
      (useAdminContentStore as any).mockReturnValue({
        posts: [],
        loading: true,
        error: null,
        fetchPosts: vi.fn(),
        deletePost: vi.fn(),
      });
      render(<AdminContentModal isOpen={true} onDidDismiss={vi.fn()} />);

      const spinner = document.querySelector('ion-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should render a list of posts', () => {
      (useAdminContentStore as any).mockReturnValue({
        posts: mockPosts,
        loading: false,
        error: null,
        fetchPosts: vi.fn(),
        deletePost: vi.fn(),
      });
      render(<AdminContentModal isOpen={true} onDidDismiss={vi.fn()} />);
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('/first-post')).toBeInTheDocument();
      expect(screen.getByText('Draft Post')).toBeInTheDocument();
      expect(screen.getByText('/draft-post')).toBeInTheDocument();
    });

    it('should call fetchPosts when opened', () => {
      const mockFetchPosts = vi.fn();
      (useAdminContentStore as any).mockReturnValue({
        posts: [],
        loading: false,
        error: null,
        fetchPosts: mockFetchPosts,
        deletePost: vi.fn(),
      });
      render(<AdminContentModal isOpen={true} onDidDismiss={vi.fn()} />);
      expect(mockFetchPosts).toHaveBeenCalledTimes(1);
    });
  });

  describe('AdminPostEditor', () => {
    it('should show validation errors when submitting empty form', async () => {
      const mockCreatePost = vi.fn();
      (useAdminContentStore as any).mockReturnValue({
        createPost: mockCreatePost,
        updatePost: vi.fn(),
      });

      render(<AdminPostEditor isOpen={true} post={null} onDidDismiss={vi.fn()} />);

      const saveBtn = screen.getByText('Save');
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Slug is required')).toBeInTheDocument();
        expect(screen.getByText('Content is required')).toBeInTheDocument();
      });
      expect(mockCreatePost).not.toHaveBeenCalled();
    });
  });
});
