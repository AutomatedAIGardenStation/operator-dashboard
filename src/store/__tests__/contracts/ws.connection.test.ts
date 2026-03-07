import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebSocket, useWsState } from '../../../hooks/useWebSocket';
import { useAuthStore } from '../../../store/authStore';
import * as socketIoClientModule from 'socket.io-client';

vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(),
  };
});

interface MockedSocket {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  auth: { token?: string };
}

describe('useWebSocket Connections', () => {
  let mockSocket: MockedSocket;

  beforeEach(() => {
    vi.clearAllMocks();

    // reset singletons
    useWsState.setState({ connected: false, reconnecting: false, error: null });

    // mock auth store to return a specific token
    useAuthStore.setState({ token: 'mock-jwt-token', user: null, isAuthenticated: true });

    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connect: vi.fn(),
      auth: {},
    };

    (socketIoClientModule.io as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSocket);
  });

  it('connects with correct auth token and sets up lifecycle listeners', () => {
    renderHook(() => useWebSocket());

    // Check that io was called correctly with auth token
    expect(socketIoClientModule.io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'mock-jwt-token' }
      })
    );

    // Verify correct event handlers are registered
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect_attempt', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
  });

  it('subscribes to DEFAULT_CHANNELS upon connection', () => {
    renderHook(() => useWebSocket());

    const connectHandler = mockSocket.on.mock.calls.find((call: unknown[]) => call[0] === 'connect')?.[1] as () => void;
    expect(connectHandler).toBeDefined();

    // Trigger the connect event
    connectHandler();

    // Verify connected state is true
    expect(useWsState.getState().connected).toBe(true);

    // Verify it emits the subscribe message correctly
    expect(mockSocket.emit).toHaveBeenCalledWith('message', JSON.stringify({
      type: 'subscribe',
      channels: ['sensors', 'actuators', 'system.status', 'gantry', 'tools'],
    }));
  });

  it('re-establishes connection and updates token when server disconnects', () => {
    renderHook(() => useWebSocket());

    const disconnectHandler = mockSocket.on.mock.calls.find((call: unknown[]) => call[0] === 'disconnect')?.[1] as (reason: string) => void;
    expect(disconnectHandler).toBeDefined();

    // Set a new token simulating a session refresh
    useAuthStore.setState({ token: 'new-refreshed-token' });

    // Trigger disconnect due to io server disconnect
    disconnectHandler('io server disconnect');

    expect(useWsState.getState().connected).toBe(false);
    expect(mockSocket.auth.token).toBe('new-refreshed-token');
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('updates token during reconnect_attempt', () => {
    renderHook(() => useWebSocket());

    const reconnectAttemptHandler = mockSocket.on.mock.calls.find((call: unknown[]) => call[0] === 'reconnect_attempt')?.[1] as () => void;
    expect(reconnectAttemptHandler).toBeDefined();

    useAuthStore.setState({ token: 'attempt-token' });

    reconnectAttemptHandler();

    expect(useWsState.getState().reconnecting).toBe(true);
    expect(mockSocket.auth.token).toBe('attempt-token');
  });
});
