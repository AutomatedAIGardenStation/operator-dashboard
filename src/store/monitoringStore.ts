import { create } from 'zustand';
import { getHistory } from '../api/sensors';
import type { SensorHistory } from '../api/types';
import { getSocket, type SensorUpdateEvent } from '../hooks/useWebSocket';

interface MonitoringState {
  history: SensorHistory[];
  zone: number;
  range: string;
  loading: boolean;
  error: string | null;

  setZone: (zone: number) => void;
  setRange: (range: string) => void;
  fetchHistory: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

let handleSensorUpdate: ((raw: string | SensorUpdateEvent) => void) | null = null;
let refetchTimeout: ReturnType<typeof setTimeout> | null = null;

export const useMonitoringStore = create<MonitoringState>()((set, get) => ({
  history: [],
  zone: 1,
  range: '1h',
  loading: false,
  error: null,

  setZone: (zone: number) => {
    set({ zone });
    get().fetchHistory();
  },

  setRange: (range: string) => {
    set({ range });
    get().fetchHistory();
  },

  fetchHistory: async () => {
    const { zone, range } = get();
    set({ loading: true, error: null });
    try {
      const data = await getHistory(zone, range);
      set({ history: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch history', loading: false });
    }
  },

  connect: () => {
    if (handleSensorUpdate !== null) return;

    const socket = getSocket();
    if (!socket) return;

    handleSensorUpdate = (_raw: string | SensorUpdateEvent) => {
      if (refetchTimeout) return; // Throttle: ignore new events if a fetch is already scheduled

      refetchTimeout = setTimeout(() => {
        refetchTimeout = null;
        void get().fetchHistory();
      }, 5000);
    };

    socket.on('sensor.update', handleSensorUpdate);
  },

  disconnect: () => {
    const socket = getSocket();
    if (socket && handleSensorUpdate) {
      socket.off('sensor.update', handleSensorUpdate);
    }
    handleSensorUpdate = null;
    if (refetchTimeout) {
      clearTimeout(refetchTimeout);
      refetchTimeout = null;
    }
  },
}));
