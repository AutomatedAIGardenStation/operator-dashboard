import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient, { ApiError } from '../axios';
import { useAuthStore } from '../../store/authStore';
import { useCapabilitiesStore } from '../../store/capabilitiesStore';

// Mock axios instance logic to simulate requests and interceptors
vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../store/capabilitiesStore', () => ({
  useCapabilitiesStore: {
    getState: vi.fn(),
  },
}));

describe('apiClient interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'fake-token',
      refresh: vi.fn().mockResolvedValue(undefined),
    });
    (useCapabilitiesStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isCapabilityMissing: vi.fn().mockReturnValue(false),
      markCapabilityMissing: vi.fn(),
    });
  });

  it('normalizes network errors to ApiError', async () => {
    const error = {
      isAxiosError: true,
      message: 'Network Error',
      request: {},
      config: { method: 'POST', url: '/test' },
      response: undefined,
    } as unknown as Error;

    const interceptorManager = apiClient.interceptors.response as unknown as { handlers: Array<{ rejected: (e: Error) => Promise<never> }> };
    const responseInterceptor = interceptorManager.handlers[0]?.rejected;
    if (!responseInterceptor) throw new Error('Interceptor not found');

    await expect(responseInterceptor(error)).rejects.toThrow(ApiError);
    await expect(responseInterceptor(error)).rejects.toMatchObject({
      isNetworkError: true,
      isTimeout: false,
      isServerError: false,
    });
  });

  it('identifies retryable errors and delays execution', async () => {
    const config = { method: 'GET', url: '/test', _retryCount: 0 };
    const error = {
      isAxiosError: true,
      message: 'timeout of 15000ms exceeded',
      code: 'ECONNABORTED',
      config,
    } as unknown as Error;

    const interceptorManager = apiClient.interceptors.response as unknown as { handlers: Array<{ rejected: (e: Error) => Promise<never> }> };
    const responseInterceptor = interceptorManager.handlers[0]?.rejected;
    if (!responseInterceptor) throw new Error('Interceptor not found');

    // Since we can't reliably mock `apiClient()` default invocation in this test environment without triggering
    // actual network requests, let's just intercept `setTimeout` and check that the delay logic is triggered properly.
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout').mockImplementation((_cb: string | ((...args: unknown[]) => void)) => {
      // By NOT calling cb(), we prevent apiClient(original) from being called recursively
      // and therefore prevent the network ECONNREFUSED error entirely.
      return 1 as unknown as ReturnType<typeof setTimeout>;
    });

    // We do not await this, because the promise will never resolve since we intercepted setTimeout and didn't call cb.
    void responseInterceptor(error);

    // We just verify that setTimeout was called correctly
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Object.getPrototypeOf(function(){}).constructor), 2000); // 2^1 * 1000
    expect(config._retryCount).toBe(1);

    setTimeoutSpy.mockRestore();
  });
});