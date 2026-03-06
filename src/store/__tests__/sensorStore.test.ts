import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSensorStore } from '../sensorStore';

import * as useWebSocketModule from '../../hooks/useWebSocket';

// Mock useWebSocket
const mockOn = vi.fn();
const mockOff = vi.fn();

vi.mock('../../hooks/useWebSocket', () => {
  return {
    getSocket: vi.fn(() => ({
      on: mockOn,
      off: mockOff,
      connected: false,
    })),
  };
});

describe('sensorStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Ensure getSocket returns our mocked socket
    (useWebSocketModule.getSocket as any).mockReturnValue({
      on: mockOn,
      off: mockOff,
      connected: false,
    });

    useSensorStore.getState().disconnect();

    useSensorStore.setState({
      readings: null,
      lastUpdated: null,
      connected: false,
    });
  });

  it('initial state is correct', () => {
    const state = useSensorStore.getState();
    expect(state.readings).toBeNull();
    expect(state.connected).toBe(false);
  });

  it('connect calls socket.io and sets up listeners', () => {
    useSensorStore.getState().connect();

    // Verify listeners were added
    expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('sensor.update', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('actuator.update', expect.any(Function));
  });

  it('updates state on connect event', () => {
    useSensorStore.getState().connect();

    const connectHandler = mockOn.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectHandler();

    expect(useSensorStore.getState().connected).toBe(true);
  });

  it('updates state on disconnect event', () => {
    // Set connected first so connect() doesn't return early
    useSensorStore.setState({ connected: false });
    useSensorStore.getState().connect();
    useSensorStore.setState({ connected: true });

    const disconnectHandler = mockOn.mock.calls.find(call => call[0] === 'disconnect')?.[1];
    disconnectHandler();

    expect(useSensorStore.getState().connected).toBe(false);
  });

  it('updates readings on sensor.update event', () => {
    useSensorStore.getState().connect();

    const sensorUpdateHandler = mockOn.mock.calls.find(call => call[0] === 'sensor.update')?.[1];

    const mockData = {
      temp: 25.5,
      humidity: 60,
      ph: 6.5,
      ec: 1.2,
      soil_moisture: [45, 50],
      tank_level_pct: 80,
      actuator_status: { pump1: true },
    };

    sensorUpdateHandler(mockData);

    const state = useSensorStore.getState();
    expect(state.readings?.temp).toBe(25.5);
    expect(state.readings?.humidity).toBe(60);
    expect(state.readings?.actuator_status.pump1).toBe(true);
    expect(state.lastUpdated).toBeInstanceOf(Date);
  });

  it('merges actuator_status on actuator.update event', () => {
    useSensorStore.setState({
      readings: {
        temp: 25,
        humidity: 50,
        ph: 7,
        ec: 1,
        soil_moisture: [],
        tank_level_pct: 100,
        actuator_status: { actuator_1: true },
      }
    });

    useSensorStore.getState().connect();

    const actuatorUpdateHandler = mockOn.mock.calls.find(call => call[0] === 'actuator.update')?.[1];

    // Pump 2 turns on, Pump 1 stays on
    actuatorUpdateHandler({ actuator_id: 2, status: 'running', progress: 50 });

    const state = useSensorStore.getState();
    expect(state.readings?.actuator_status).toEqual({
      actuator_1: true,
      actuator_2: true,
    });
  });

  it('disconnect() clears socket listeners and connected state', () => {
    useSensorStore.setState({ connected: false });
    useSensorStore.getState().connect();
    useSensorStore.setState({ connected: true });

    useSensorStore.getState().disconnect();

    expect(mockOff).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockOff).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockOff).toHaveBeenCalledWith('sensor.update', expect.any(Function));
    expect(mockOff).toHaveBeenCalledWith('actuator.update', expect.any(Function));
    expect(useSensorStore.getState().connected).toBe(false);
  });
});
