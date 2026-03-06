import { create } from 'zustand';
import { getSocket } from '../hooks/useWebSocket';

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

// References to the handlers so we can remove them later
let handleConnect: (() => void) | null = null;
let handleDisconnect: (() => void) | null = null;
let handleSensorUpdate: ((data: Partial<SensorReadings>) => void) | null = null;
let handleActuatorUpdate: ((data: Record<string, boolean>) => void) | null = null;

export const useSensorStore = create<SensorState>()((set) => ({
  readings: null,
  lastUpdated: null,
  connected: false,

  connect: () => {
    // If we've already attached our listeners, skip re-attaching
    if (handleConnect !== null) return;

    const socket = getSocket();
    if (!socket) return;

    // We update connected state when socket connects or if it's already connected
    if (socket.connected) {
      set({ connected: true });
    }

    handleConnect = () => set({ connected: true });
    handleDisconnect = () => set({ connected: false });

    handleSensorUpdate = (data: Partial<SensorReadings>) => {
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
    };

    handleActuatorUpdate = (data: Record<string, boolean>) => {
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
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('sensor.update', handleSensorUpdate);
    socket.on('actuator.update', handleActuatorUpdate);
  },

  disconnect: () => {
    const socket = getSocket();
    if (socket && handleConnect && handleDisconnect && handleSensorUpdate && handleActuatorUpdate) {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('sensor.update', handleSensorUpdate);
      socket.off('actuator.update', handleActuatorUpdate);
    }
    handleConnect = null;
    handleDisconnect = null;
    handleSensorUpdate = null;
    handleActuatorUpdate = null;
    set({ connected: false });
  },
}));
