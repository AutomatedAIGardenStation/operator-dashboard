import { describe, it, expect, beforeEach } from 'vitest';
import { useCapabilitiesStore } from '../capabilitiesStore';

describe('useCapabilitiesStore', () => {
  beforeEach(() => {
    useCapabilitiesStore.getState().resetCapabilities();
  });

  it('initCapabilities correctly identifies missing capabilities', () => {
    // Let's pass a small subset of capabilities
    const supported = ['GET /sensors', 'POST /actuators/water/start'];
    useCapabilitiesStore.getState().initCapabilities(supported);

    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /sensors')).toBe(false);
    expect(useCapabilitiesStore.getState().isCapabilityMissing('POST /actuators/water/start')).toBe(false);

    // Check something that wasn't passed and is in ALL_CAPABILITIES
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /actuators')).toBe(true);
    expect(useCapabilitiesStore.getState().isCapabilityMissing('POST /actuators/water/stop')).toBe(true);
    expect(useCapabilitiesStore.getState().isCapabilityMissing('POST /notifications/register')).toBe(true);
  });

  it('markCapabilityMissing correctly adds capabilities to missing list and generalizes them', () => {
    // Specific URL
    useCapabilitiesStore.getState().markCapabilityMissing('GET /sensors/123');
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /sensors/123')).toBe(true);
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /sensors/456')).toBe(true);

    // UUID format
    useCapabilitiesStore.getState().markCapabilityMissing('GET /actuators/123e4567-e89b-12d3-a456-426614174000/status');
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /actuators/123e4567-e89b-12d3-a456-426614174000/status')).toBe(true);
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /actuators/987e6543-e21b-12d3-a456-426614174000/status')).toBe(true);
  });

  it('resetCapabilities clears the missing capabilities set', () => {
    useCapabilitiesStore.getState().markCapabilityMissing('GET /system/config');
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /system/config')).toBe(true);

    useCapabilitiesStore.getState().resetCapabilities();
    expect(useCapabilitiesStore.getState().isCapabilityMissing('GET /system/config')).toBe(false);
  });
});
