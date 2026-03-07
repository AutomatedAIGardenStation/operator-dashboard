import type {
  AuthTokens,
  SensorListResponse,
  SensorHistoryResponse,
  ActuatorListResponse,
  ActuatorStatusResponse,
  SystemStatus,
} from "../../types";

export const authTokensFixture: AuthTokens = {
  access_token: "mock_access_token",
  refresh_token: "mock_refresh_token",
  token_type: "bearer",
  expires_in: 3600,
};

export const sensorListFixture: SensorListResponse = {
  sensors: [
    {
      id: 1,
      name: "Temp Sensor",
      type: "temperature",
      chamber_id: 1,
      current_value: 25.5,
      unit: "C",
      status: "active",
      last_reading: "2023-10-01T12:00:00Z",
      location: { x: 0, y: 0, z: 0 },
    },
  ],
  total: 1,
};

export const sensorHistoryFixture: SensorHistoryResponse = {
  sensor_id: 1,
  readings: [
    {
      timestamp: "2023-10-01T12:00:00Z",
      value: 25.5,
      quality: "good",
    },
  ],
  count: 1,
};

export const actuatorListFixture: ActuatorListResponse = {
  actuators: [
    {
      id: 1,
      name: "Water Pump",
      type: "pump",
      chamber_id: 1,
      status: "idle",
      current_state: {
        enabled: false,
      },
    },
  ],
};

export const actuatorStatusFixture: ActuatorStatusResponse = {
  id: 1,
  status: "active",
  current_state: {
    enabled: true,
    flow_rate: 1.5,
  },
};

export const systemStatusFixture: SystemStatus = {
  status: "online",
  version: "1.0.0",
  uptime_seconds: 3600,
  components: {
    db: "ok",
    mqtt: "ok",
  },
  resources: {
    cpu_usage: 10,
    memory_usage: 20,
    disk_usage: 30,
  },
  last_updated: "2023-10-01T12:00:00Z",
};

// WebSocket Payloads

export const sensorUpdateFixture = {
  temp: 24.5,
  humidity: 50.0,
  ph: 6.0,
  ec: 1.2,
  soil_moisture: [40, 45],
  tank_level_pct: 80,
  actuator_status: { pump_1: true },
};

export const actuatorUpdateFixture = {
  actuator_id: 1,
  status: "running",
  progress: 50,
};
