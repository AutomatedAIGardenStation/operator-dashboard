import { create } from 'zustand';
import { getHistory } from '../api/sensors';
import type { SensorHistory } from '../api/types';

interface MonitoringState {
  history: SensorHistory[];
  zone: number;
  range: string;
  loading: boolean;
  error: string | null;

  setZone: (zone: number) => void;
  setRange: (range: string) => void;
  fetchHistory: () => Promise<void>;
}

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
}));
