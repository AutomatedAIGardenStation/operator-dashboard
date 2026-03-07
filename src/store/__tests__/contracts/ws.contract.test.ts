import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSensorStore } from '../../sensorStore';
import { useActuatorStore } from '../../actuatorStore';

import { sensorUpdateFixture, actuatorUpdateFixture } from '../../../api/__tests__/contracts/fixtures';
import * as useWebSocketModule from '../../../hooks/useWebSocket';

const mockOn = vi.fn();
const mockOff = vi.fn();

vi.mock('../../../hooks/useWebSocket', () => {
  return {
    getSocket: vi.fn(() => ({
      on: mockOn,
      off: mockOff,
      connected: true,
    })),
  };
});

describe('WebSocket Contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useWebSocketModule.getSocket as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      on: mockOn,
      off: mockOff,
      connected: true,
    });

    useSensorStore.getState().disconnect();
    useActuatorStore.getState().disconnect();

    useSensorStore.setState({
      readings: null,
      lastUpdated: null,
      connected: false,
    });

    useActuatorStore.setState({
      actuators: new Map(),
    });
  });

  it('sensorStore parses and handles sensor.update payload correctly', () => {
    useSensorStore.getState().connect();

    const sensorUpdateHandler = mockOn.mock.calls.find(call => call[0] === 'sensor.update')?.[1] as (data: unknown) => void;
    expect(sensorUpdateHandler).toBeDefined();

    // Emit the fixture payload
    sensorUpdateHandler(sensorUpdateFixture);

    const state = useSensorStore.getState();
    const readings = state.readings;

    // Verify it matches the fixture structure correctly
    expect(readings).not.toBeNull();
    expect(readings?.temp).toBe(sensorUpdateFixture.temp);
    expect(readings?.humidity).toBe(sensorUpdateFixture.humidity);
    expect(readings?.ph).toBe(sensorUpdateFixture.ph);
    expect(readings?.ec).toBe(sensorUpdateFixture.ec);
    expect(readings?.soil_moisture).toEqual(sensorUpdateFixture.soil_moisture);
    expect(readings?.tank_level_pct).toBe(sensorUpdateFixture.tank_level_pct);
    expect(readings?.actuator_status).toEqual(sensorUpdateFixture.actuator_status);
  });

  it('actuatorStore parses and handles actuator.update payload correctly', () => {
    // Pre-populate actuator store to see the update
    useActuatorStore.setState({
      actuators: new Map([
        [actuatorUpdateFixture.actuator_id, {
          id: actuatorUpdateFixture.actuator_id,
          name: 'Test Pump',
          type: 'pump',
          chamber_id: 1,
          status: 'idle',
          current_state: { enabled: false }
        }]
      ])
    });

    useActuatorStore.getState().connect();

    const actuatorUpdateHandler = mockOn.mock.calls.find(call => call[0] === 'actuator.update')?.[1] as (data: unknown) => void;
    expect(actuatorUpdateHandler).toBeDefined();

    // Emit the fixture payload
    actuatorUpdateHandler(actuatorUpdateFixture);

    const state = useActuatorStore.getState();
    const actuator = state.actuators.get(actuatorUpdateFixture.actuator_id);

    // Verify status was updated according to the payload
    expect(actuator).toBeDefined();
    expect(actuator?.status).toBe(actuatorUpdateFixture.status);
  });

  it('sensorStore parses actuator.update payload and updates actuator_status correctly', () => {
    // Pre-populate actuator store because sensorStore's handleActuatorUpdate looks up the actuator name from useActuatorStore
    useActuatorStore.setState({
      actuators: new Map([
        [actuatorUpdateFixture.actuator_id, {
          id: actuatorUpdateFixture.actuator_id,
          name: 'pump_1',
          type: 'pump',
          chamber_id: 1,
          status: 'idle',
          current_state: { enabled: false }
        }]
      ])
    });

    useSensorStore.getState().connect();

    const actuatorUpdateHandler = mockOn.mock.calls.find(call => call[0] === 'actuator.update')?.[1] as (data: unknown) => void;
    expect(actuatorUpdateHandler).toBeDefined();

    // Emit the fixture payload
    actuatorUpdateHandler(actuatorUpdateFixture);

    const state = useSensorStore.getState();
    const readings = state.readings;

    // Verify it maps actuator_id to name and updates actuator_status to boolean true (since status is running)
    expect(readings?.actuator_status).toEqual({
      pump_1: true
    });
  });
});
