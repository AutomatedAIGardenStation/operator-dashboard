import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';
import { login as apiLogin, refresh as apiRefresh, logout as apiLogout } from '../api/auth';
import type { LoginRequest } from '../api/types';
import { getCapabilities } from '../api/system';
import { useCapabilitiesStore } from './capabilitiesStore';

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  init: () => Promise<void>;
}

const TOKEN_KEY = 'gs_access_token';
const REFRESH_KEY = 'gs_refresh_token';

async function storeTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  await Preferences.set({ key: TOKEN_KEY, value: token });
  await Preferences.set({ key: REFRESH_KEY, value: refreshToken });
}

async function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  await Preferences.remove({ key: TOKEN_KEY });
  await Preferences.remove({ key: REFRESH_KEY });
}

// Temporary user parsing for demonstration (assuming JWT holds user info or returning a dummy user)
// In a real app, user info comes from the backend or the decoded JWT
const parseUserFromToken = (_token: string): User => {
  return { id: '1', email: 'user@example.com', role: 'admin' };
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  init: async () => {
    let token = localStorage.getItem(TOKEN_KEY);
    let refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!token) {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      token = value;
    }

    if (!refreshToken) {
      const { value } = await Preferences.get({ key: REFRESH_KEY });
      refreshToken = value;
    }

    if (token && refreshToken) {
      set({
        token,
        refreshToken,
        user: parseUserFromToken(token),
        isAuthenticated: true,
      });

      // Fetch capabilities after restoring session
      getCapabilities()
        .then(caps => useCapabilitiesStore.getState().initCapabilities(caps))
        .catch(err => console.error('Failed to init capabilities on load', err));
    }
  },

  login: async (credentials: LoginRequest) => {
    const data = await apiLogin(credentials);
    const { access_token, refresh_token } = data;

    await storeTokens(access_token, refresh_token);

    set({
      token: access_token,
      refreshToken: refresh_token,
      user: parseUserFromToken(access_token),
      isAuthenticated: true,
    });

    // Fetch capabilities after fresh login
    try {
      const caps = await getCapabilities();
      useCapabilitiesStore.getState().initCapabilities(caps);
    } catch (err) {
      console.error('Failed to fetch capabilities on login', err);
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore network errors on logout
    } finally {
      await clearTokens();
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
      // Fire an event if needed by websocket
      window.dispatchEvent(new Event('gs:session-expired'));
      // Clear capability cache on logout
      window.dispatchEvent(new Event('gs:capabilities-reset'));
    }
  },

  refresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      await get().logout();
      throw new Error('No refresh token available');
    }

    try {
      const data = await apiRefresh(refreshToken);
      const { access_token, refresh_token } = data;

      await storeTokens(access_token, refresh_token);

      set({
        token: access_token,
        refreshToken: refresh_token,
        user: parseUserFromToken(access_token),
        isAuthenticated: true,
      });
    } catch (error) {
      await get().logout();
      throw error;
    }
  },
}));
