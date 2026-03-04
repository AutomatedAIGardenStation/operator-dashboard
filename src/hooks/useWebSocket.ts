import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { tokenStore } from '../api/client';

// ── WebSocket event types matching the backend protocol ─────────────────────

export interface SensorUpdateEvent {
  sensor_id: number;
  value: number;
  timestamp: string;
}

export interface ActuatorStatusEvent {
  actuator_id: number;
  status: string;
  progress: number;
}

export interface NotificationEvent {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
}

// ── Shared connection state store ───────────────────────────────────────────

interface WsState {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  setConnected: (v: boolean) => void;
  setReconnecting: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useWsState = create<WsState>((set) => ({
  connected: false,
  reconnecting: false,
  error: null,
  setConnected: (connected) => set({ connected, reconnecting: false }),
  setReconnecting: (reconnecting) => set({ reconnecting }),
  setError: (error) => set({ error }),
}));

// ── Singleton socket reference ──────────────────────────────────────────────

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://garden.local:8000';

let sharedSocket: Socket | null = null;

export function getSocket(): Socket | null {
  return sharedSocket;
}

// Default channels the app subscribes to on connect.
const DEFAULT_CHANNELS = ['sensors', 'actuators', 'system.status'];

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * Initialises and manages the socket.io connection for the entire app.
 *
 * Call once at the top level (e.g. in `App.tsx`). The underlying socket
 * instance is a module-level singleton so other hooks (e.g. `useSensorData`)
 * can access it via `getSocket()` without creating duplicate connections.
 */
export function useWebSocket(): void {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const { setConnected, setReconnecting, setError } = useWsState.getState();

    const token = tokenStore.getAccess();

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 30_000,
      timeout: 20_000,
      autoConnect: true,
    });

    sharedSocket = socket;

    // ── Connection lifecycle ──────────────────────────────────────────────

    socket.on('connect', () => {
      setConnected(true);
      setError(null);

      socket.emit('message', JSON.stringify({
        type: 'subscribe',
        channels: DEFAULT_CHANNELS,
      }));
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') {
        // Server forced the disconnect – try reconnecting after refreshing auth.
        const freshToken = tokenStore.getAccess();
        if (freshToken) {
          socket.auth = { token: freshToken };
          socket.connect();
        }
      }
    });

    socket.on('reconnect_attempt', () => {
      setReconnecting(true);
      const freshToken = tokenStore.getAccess();
      if (freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.on('reconnect', () => {
      setConnected(true);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
    });

    // ── Re-auth when session refreshes elsewhere ─────────────────────────

    function handleSessionExpired() {
      socket.disconnect();
      setConnected(false);
    }

    window.addEventListener('gs:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('gs:session-expired', handleSessionExpired);
      socket.disconnect();
      sharedSocket = null;
      setConnected(false);
    };
  }, []);
}
