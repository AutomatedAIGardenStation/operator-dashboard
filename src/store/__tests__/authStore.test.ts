import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import * as authApi from '../../api/auth';
import { Preferences } from '@capacitor/preferences';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn()
}));

vi.mock('../../api/system', () => ({
  getCapabilities: vi.fn().mockResolvedValue(['GET /test']),
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn().mockResolvedValue({ value: null }),
    remove: vi.fn()
  }
}));

// Helper to create a dummy JWT for testing
const createDummyJWT = (payload: Record<string, unknown>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'dummy-signature';
  return `${header}.${body}.${signature}`;
};

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

  it('login sets tokens, parses user, and updates isAuthenticated', async () => {
    const dummyToken = createDummyJWT({ id: '99', email: 'test99@example.com', role: 'operator' });
    const mockResponse = { access_token: dummyToken, refresh_token: 'refresh-123', token_type: 'Bearer', expires_in: 3600 };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(dummyToken);
    expect(state.refreshToken).toBe('refresh-123');
    expect(state.user).toEqual({ id: '99', email: 'test99@example.com', role: 'operator' });
    expect(localStorage.getItem('gs_access_token')).toBe(dummyToken);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'gs_access_token', value: dummyToken });
  });

  it('login handles invalid token by setting user to null', async () => {
    const mockResponse = { access_token: 'invalid-token', refresh_token: 'refresh-123', token_type: 'Bearer', expires_in: 3600 };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('invalid-token');
    expect(state.user).toBeNull();
  });

  it('login handles token missing email or role by setting user to null', async () => {
    const missingFieldsToken = createDummyJWT({ id: '99' }); // no email or role
    const mockResponse = { access_token: missingFieldsToken, refresh_token: 'refresh-123', token_type: 'Bearer', expires_in: 3600 };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(missingFieldsToken);
    expect(state.user).toBeNull();
  });

  it('logout clears tokens and updates isAuthenticated', async () => {
    const dummyToken = createDummyJWT({ id: '99', email: 'test99@example.com', role: 'operator' });
    useAuthStore.setState({ token: dummyToken, refreshToken: '123', isAuthenticated: true });
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
    const oldToken = createDummyJWT({ id: '99', email: 'test99@example.com', role: 'operator' });
    const newToken = createDummyJWT({ id: '100', email: 'new@example.com', role: 'admin' });
    useAuthStore.setState({ token: oldToken, refreshToken: 'old-refresh', isAuthenticated: true });

    const mockResponse = { access_token: newToken, refresh_token: 'new-refresh', token_type: 'Bearer', expires_in: 3600 };
    vi.mocked(authApi.refresh).mockResolvedValue(mockResponse);

    await useAuthStore.getState().refresh();

    const state = useAuthStore.getState();
    expect(state.token).toBe(newToken);
    expect(state.refreshToken).toBe('new-refresh');
    expect(state.user).toEqual({ id: '100', email: 'new@example.com', role: 'admin' });
    expect(authApi.refresh).toHaveBeenCalledWith('old-refresh');
  });

  it('refresh failure triggers logout', async () => {
    const oldToken = createDummyJWT({ id: '99', email: 'test99@example.com', role: 'operator' });
    useAuthStore.setState({ token: oldToken, refreshToken: 'old-refresh', isAuthenticated: true });
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('Unauthorized'));

    await expect(useAuthStore.getState().refresh()).rejects.toThrow('Unauthorized');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});
