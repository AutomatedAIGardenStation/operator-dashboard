import { create } from 'zustand';

export interface SensorLocation {
  x: number;
  y: number;
  z: number;
}

export type SensorType =
  | 'soil_moisture'
  | 'temperature'
  | 'humidity'
  | 'light'
  | 'ph'
  | 'ec';

export type SensorStatus = 'active' | 'inactive' | 'error' | 'calibrating';

export interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  chamber_id: number;
  current_value: number;
  unit: string;
  status: SensorStatus;
  last_reading: string;
  location?: SensorLocation;
}

export interface SensorReading {
  timestamp: string;
  value: number;
  quality: 'good' | 'suspect' | 'bad';
}

interface SensorState {
  sensors: Map<number, Sensor>;
  loading: boolean;
  error: string | null;

  setSensors: (sensors: Sensor[]) => void;
  updateSensor: (id: number, data: Partial<Sensor>) => void;
  updateSensorValue: (id: number, value: number, timestamp: string) => void;
  removeSensor: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSensorStore = create<SensorState>()((set) => ({
  sensors: new Map(),
  loading: false,
  error: null,

  setSensors: (sensors) =>
    set({
      sensors: new Map(sensors.map((s) => [s.id, s])),
      loading: false,
      error: null,
    }),

  updateSensor: (id, data) =>
    set((state) => {
      const existing = state.sensors.get(id);
      if (!existing) return state;
      const updated = new Map(state.sensors);
      updated.set(id, { ...existing, ...data });
      return { sensors: updated };
    }),

  updateSensorValue: (id, value, timestamp) =>
    set((state) => {
      const existing = state.sensors.get(id);
      if (!existing) return state;
      const updated = new Map(state.sensors);
      updated.set(id, {
        ...existing,
        current_value: value,
        last_reading: timestamp,
      });
      return { sensors: updated };
    }),

  removeSensor: (id) =>
    set((state) => {
      const updated = new Map(state.sensors);
      updated.delete(id);
      return { sensors: updated };
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),
}));
