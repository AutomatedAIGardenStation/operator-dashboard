import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface SensorReadings {
  temp: number;
  humidity: number;
  ph: number;
  ec: number;
  soil_moisture: number[];
  tank_level_pct: number;
  actuator_status: Record<string, boolean>;
}

interface SensorState {
  readings: SensorReadings | null;
  lastUpdated: Date | null;
  connected: boolean;

  connect: () => void;
  disconnect: () => void;
}

let socket: Socket | null = null;

export const useSensorStore = create<SensorState>()((set) => ({
  readings: null,
  lastUpdated: null,
  connected: false,

  connect: () => {
    if (socket) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    socket = io(wsUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      set({ connected: true });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('sensor_update', (data: Partial<SensorReadings>) => {
      set((state) => ({
        readings: {
          ...state.readings,
          ...data,
          // ensure arrays and objects are merged properly if needed, but for now just spread
          soil_moisture: data.soil_moisture || state.readings?.soil_moisture || [],
          actuator_status: {
            ...(state.readings?.actuator_status || {}),
            ...(data.actuator_status || {}),
          },
        } as SensorReadings,
        lastUpdated: new Date(),
      }));
    });

    socket.on('actuator_update', (data: Record<string, boolean>) => {
      set((state) => ({
        readings: {
          ...state.readings,
          actuator_status: {
            ...(state.readings?.actuator_status || {}),
            ...data,
          },
        } as SensorReadings,
        lastUpdated: new Date(),
      }));
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    set({ connected: false });
  },
}));
