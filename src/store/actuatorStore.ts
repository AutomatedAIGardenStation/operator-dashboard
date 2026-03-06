import { create } from 'zustand';

export type ActuatorType = 'pump' | 'light' | 'fan' | 'heater' | 'robot_arm';

export type ActuatorStatus =
  | 'idle'
  | 'running'
  | 'error'
  | 'maintenance'
  | 'disabled';

export interface ActuatorState {
  enabled: boolean;
  flow_rate?: number;
  total_volume?: number;
  elapsed_time?: number;
  volume_delivered?: number;
}

export interface ActuatorCapabilities {
  max_flow_rate?: number;
  min_flow_rate?: number;
}

export interface ActuatorTask {
  id: string;
  started_at: string;
  estimated_completion: string;
}

export interface Actuator {
  id: number;
  name: string;
  type: ActuatorType;
  chamber_id: number;
  status: ActuatorStatus;
  current_state: ActuatorState;
  capabilities?: ActuatorCapabilities;
  task?: ActuatorTask;
}

import { getSocket, type ActuatorStatusEvent } from '../hooks/useWebSocket';

interface ActuatorStoreState {
  actuators: Map<number, Actuator>;
  loading: boolean;
  error: string | null;

  setActuators: (actuators: Actuator[]) => void;
  updateActuator: (id: number, data: Partial<Actuator>) => void;
  updateActuatorStatus: (
    id: number,
    status: ActuatorStatus,
    progress?: number,
  ) => void;
  removeActuator: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  connect: () => void;
  disconnect: () => void;
}

let handleActuatorUpdate: ((raw: string | ActuatorStatusEvent) => void) | null = null;

export const useActuatorStore = create<ActuatorStoreState>()((set) => ({
  actuators: new Map(),
  loading: false,
  error: null,

  setActuators: (actuators) =>
    set({
      actuators: new Map(actuators.map((a) => [a.id, a])),
      loading: false,
      error: null,
    }),

  updateActuator: (id, data) =>
    set((state) => {
      const existing = state.actuators.get(id);
      if (!existing) return state;
      const updated = new Map(state.actuators);
      updated.set(id, { ...existing, ...data });
      return { actuators: updated };
    }),

  updateActuatorStatus: (id, status, _progress) =>
    set((state) => {
      const existing = state.actuators.get(id);
      if (!existing) return state;
      const updated = new Map(state.actuators);
      updated.set(id, { ...existing, status });
      return { actuators: updated };
    }),

  removeActuator: (id) =>
    set((state) => {
      const updated = new Map(state.actuators);
      updated.delete(id);
      return { actuators: updated };
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  connect: () => {
    if (handleActuatorUpdate !== null) return;

    const socket = getSocket();
    if (!socket) return;

    handleActuatorUpdate = (raw: string | ActuatorStatusEvent) => {
      const payload: ActuatorStatusEvent =
        typeof raw === 'string' ? (JSON.parse(raw) as { data: ActuatorStatusEvent }).data : raw;

      set((state) => {
        const existing = state.actuators.get(payload.actuator_id);
        if (!existing) return state;

        const updated = new Map(state.actuators);
        updated.set(payload.actuator_id, {
          ...existing,
          status: payload.status as ActuatorStatus,
        });

        return { actuators: updated };
      });
    };

    socket.on('actuator.update', handleActuatorUpdate);
  },

  disconnect: () => {
    const socket = getSocket();
    if (socket && handleActuatorUpdate) {
      socket.off('actuator.update', handleActuatorUpdate);
    }
    handleActuatorUpdate = null;
  },
}));
