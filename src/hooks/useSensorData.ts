import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import type {
  Sensor,
  SensorListParams,
  SensorListResponse,
  SensorReading,
  SensorHistoryParams,
  SensorHistoryResponse,
} from '../api/types';
import { getSocket, type SensorUpdateEvent } from './useWebSocket';

// ── Types ───────────────────────────────────────────────────────────────────

interface UseSensorListResult {
  sensors: Sensor[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSensorHistoryResult {
  readings: SensorReading[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ── useSensorList ───────────────────────────────────────────────────────────

/**
 * Fetches the sensor list via REST and keeps it up-to-date via WebSocket
 * `sensor.update` events.  Real-time updates are merged into the list so
 * `current_value` and `last_reading` stay fresh without polling.
 */
export function useSensorList(params?: SensorListParams): UseSensorListResult {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<SensorListResponse>('/sensors', {
        params: paramsRef.current,
      });
      setSensors(data.sensors);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sensors');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    void fetch();
  }, [fetch]);

  // Subscribe to real-time sensor updates via the shared socket.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleUpdate(raw: string | SensorUpdateEvent) {
      const payload: SensorUpdateEvent =
        typeof raw === 'string' ? (JSON.parse(raw) as { data: SensorUpdateEvent }).data : raw;

      setSensors((prev) =>
        prev.map((s) =>
          s.id === payload.sensor_id
            ? { ...s, current_value: payload.value, last_reading: payload.timestamp }
            : s,
        ),
      );
    }

    socket.on('sensor.update', handleUpdate);
    return () => {
      socket.off('sensor.update', handleUpdate);
    };
  }, []);

  return { sensors, total, loading, error, refetch: fetch };
}

// ── useSensorHistory ────────────────────────────────────────────────────────

/**
 * Fetches historical readings for a single sensor.  Append real-time
 * readings received while the component is mounted.
 */
export function useSensorHistory(
  sensorId: number | undefined,
  params?: SensorHistoryParams,
): UseSensorHistoryResult {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetch = useCallback(async () => {
    if (sensorId === undefined) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<SensorHistoryResponse>(
        `/sensors/${sensorId}/history`,
        { params: paramsRef.current },
      );
      setReadings(data.readings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor history');
    } finally {
      setLoading(false);
    }
  }, [sensorId]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  // Append live readings for this sensor.
  useEffect(() => {
    if (sensorId === undefined) return;
    const socket = getSocket();
    if (!socket) return;

    function handleUpdate(raw: string | SensorUpdateEvent) {
      const payload: SensorUpdateEvent =
        typeof raw === 'string' ? (JSON.parse(raw) as { data: SensorUpdateEvent }).data : raw;

      if (payload.sensor_id !== sensorId) return;

      setReadings((prev) => [
        ...prev,
        { timestamp: payload.timestamp, value: payload.value, quality: 'live' },
      ]);
    }

    socket.on('sensor.update', handleUpdate);
    return () => {
      socket.off('sensor.update', handleUpdate);
    };
  }, [sensorId]);

  return { readings, loading, error, refetch: fetch };
}
