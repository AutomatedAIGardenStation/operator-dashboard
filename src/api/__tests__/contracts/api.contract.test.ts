import { describe, it, expect, vi } from "vitest";
import { login } from "../../auth";
import { getSensors, getSensorHistory } from "../../sensors";
import { getActuators, getActuatorStatus } from "../../actuators";
import { getStatus, getConfig } from "../../system";
import { getGantryPosition } from "../../gantry";

import {
  authTokensFixture,
  sensorListFixture,
  sensorHistoryFixture,
  actuatorListFixture,
  actuatorStatusFixture,
  systemStatusFixture,
} from "./fixtures";
import type { SystemConfig, GantryPosition } from "../../types";

import axios from "axios";
import apiClient from "../../axios";

// Mock both the bare axios instance and the custom apiClient
vi.mock("axios");
vi.mock("../../axios", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("API Contracts (REST)", () => {
  it("auth.login returns AuthTokens schema", async () => {
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: authTokensFixture });

    const result = await login({ email: "test@example.com", password: "password" });

    // Explicit shape snapshot validation
    expect(result).toMatchSnapshot();
  });

  it("sensors.getSensors returns SensorListResponse schema", async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: sensorListFixture });

    const result = await getSensors();

    expect(result).toMatchSnapshot();
  });

  it("sensors.getSensorHistory returns SensorHistoryResponse schema", async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: sensorHistoryFixture });

    const result = await getSensorHistory(1);

    expect(result).toMatchSnapshot();
  });

  it("actuators.getActuators returns ActuatorListResponse schema", async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: actuatorListFixture });

    const result = await getActuators();

    expect(result).toMatchSnapshot();
  });

  it("actuators.getActuatorStatus returns ActuatorStatusResponse schema", async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: actuatorStatusFixture });

    const result = await getActuatorStatus(1);

    expect(result).toMatchSnapshot();
  });

  it("system.getStatus returns SystemStatus schema", async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: systemStatusFixture });

    const result = await getStatus();

    expect(result).toMatchSnapshot();
  });

  it("system.getConfig uses canonical endpoint and returns SystemConfig", async () => {
    const mockConfig: SystemConfig = { sensor_reading_interval: 60, auto_watering_enabled: true };
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockConfig });

    const result = await getConfig();

    expect(apiClient.get).toHaveBeenCalledWith("/system/config");
    expect(result).toEqual(mockConfig);
  });

  it("gantry.getGantryPosition uses canonical endpoint and returns GantryPosition", async () => {
    const mockPosition: GantryPosition = { x: 10, y: 20, z: 30, status: "IDLE" };
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPosition });

    const result = await getGantryPosition();

    expect(apiClient.get).toHaveBeenCalledWith("/gantry/position");
    expect(result).toEqual(mockPosition);
  });
});
