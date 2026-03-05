import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import * as authApi from '../../api/auth';
import { Preferences } from '@capacitor/preferences';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn()
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn().mockResolvedValue({ value: null }),
    remove: vi.fn()
  }
}));

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false
    });
  });

  it('login sets tokens and updates isAuthenticated', async () => {
    const mockResponse = { access_token: 'access-123', refresh_token: 'refresh-123', token_type: 'Bearer', expires_in: 3600 };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-123');
    expect(localStorage.getItem('gs_access_token')).toBe('access-123');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'gs_access_token', value: 'access-123' });
  });

  it('logout clears tokens and updates isAuthenticated', async () => {
    useAuthStore.setState({ token: '123', refreshToken: '123', isAuthenticated: true });
    localStorage.setItem('gs_access_token', '123');

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(localStorage.getItem('gs_access_token')).toBeNull();
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'gs_access_token' });
    expect(authApi.logout).toHaveBeenCalled();
  });

  it('refresh fetches new tokens and updates state', async () => {
    useAuthStore.setState({ token: 'old', refreshToken: 'old-refresh', isAuthenticated: true });
    const mockResponse = { access_token: 'new-access', refresh_token: 'new-refresh', token_type: 'Bearer', expires_in: 3600 };
    vi.mocked(authApi.refresh).mockResolvedValue(mockResponse);

    await useAuthStore.getState().refresh();

    const state = useAuthStore.getState();
    expect(state.token).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
    expect(authApi.refresh).toHaveBeenCalledWith('old-refresh');
  });

  it('refresh failure triggers logout', async () => {
    useAuthStore.setState({ token: 'old', refreshToken: 'old-refresh', isAuthenticated: true });
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('Unauthorized'));

    await expect(useAuthStore.getState().refresh()).rejects.toThrow('Unauthorized');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});
