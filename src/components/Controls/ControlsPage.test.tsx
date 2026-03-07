import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ControlsPage } from './ControlsPage';
import * as actuators from '../../api/actuators';
import * as system from '../../api/system';
import { getSocket } from '../../hooks/useWebSocket';
import { useCapabilitiesStore } from '../../store/capabilitiesStore';

vi.mock('../../store/capabilitiesStore', () => ({
  useCapabilitiesStore: vi.fn(),
}));

vi.mock('../../api/actuators', () => ({
  waterStart: vi.fn(),
  waterStopAll: vi.fn(),
  setLight: vi.fn(),
  setFan: vi.fn(),
}));

vi.mock('../../api/system', () => ({
  getStatus: vi.fn(),
}));

vi.mock('../../hooks/useWebSocket', () => ({
  getSocket: vi.fn(),
}));

vi.mock('./GantryPanel', () => ({
  GantryPanel: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="gantry-panel" data-disabled={disabled}>GantryPanel</div>
  ),
}));

vi.mock('./ToolPanel', () => ({
  ToolPanel: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="tool-panel" data-disabled={disabled}>ToolPanel</div>
  ),
}));

vi.mock('./ValvePanel', () => ({
  ValvePanel: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="valve-panel" data-disabled={disabled}>ValvePanel</div>
  ),
}));

vi.mock('./DosingPanel', () => ({
  DosingPanel: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="dosing-panel" data-disabled={disabled}>DosingPanel</div>
  ),
}));

vi.mock('./PumpPanel', () => ({
  PumpPanel: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="pump-panel" data-disabled={disabled}>PumpPanel</div>
  ),
}));

describe('ControlsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (system.getStatus as any).mockResolvedValue({ status: 'MANUAL_CONTROL' });
    (getSocket as any).mockReturnValue({
      on: vi.fn(),
      off: vi.fn(),
    });
    (useCapabilitiesStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
            return selector({
                isCapabilityMissing: vi.fn().mockReturnValue(false)
            });
        }
        return { isCapabilityMissing: vi.fn().mockReturnValue(false) };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('disables panels when system state is not MANUAL_CONTROL or MONITORING', async () => {
    (system.getStatus as any).mockResolvedValue({ status: 'AUTO' });

    render(<ControlsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('gantry-panel')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('tool-panel')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('valve-panel')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('dosing-panel')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('pump-panel')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('calls waterStart with selected zone on Start button click', async () => {
    (actuators.waterStart as any).mockResolvedValueOnce();

    render(<ControlsPage />);

    // Default zone is 1
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(actuators.waterStart).toHaveBeenCalledWith(1);

    // Since state update happens asynchronously, we wrap in waitFor
    await waitFor(() => {
      // It should display success toast
      expect(document.querySelector('ion-toast')).toHaveAttribute('message', 'Started watering zone 1');
    });
  });

  it('debounces the light slider onChange event', async () => {
    vi.useFakeTimers();
    (actuators.setLight as any).mockResolvedValueOnce();

    render(<ControlsPage />);

    // Get the first range input (Channel 1)
    // Ionic ranges can be tricky, but we can target the element
    const channel1Range = document.querySelectorAll('ion-range')[0] as any;

    // Fire multiple change events
    fireEvent(channel1Range, new CustomEvent('ionChange', { detail: { value: 10 } }));
    fireEvent(channel1Range, new CustomEvent('ionChange', { detail: { value: 20 } }));
    fireEvent(channel1Range, new CustomEvent('ionChange', { detail: { value: 50 } }));

    // Should not have been called yet because of debounce
    expect(actuators.setLight).not.toHaveBeenCalled();

    // Fast-forward 300ms
    vi.advanceTimersByTime(300);

    // Should only be called once with the last value (50)
    expect(actuators.setLight).toHaveBeenCalledTimes(1);
    expect(actuators.setLight).toHaveBeenCalledWith(1, 50); // Channel 1, Value 50
  });

  it('shows error toast on API failure', async () => {
    (actuators.waterStart as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ControlsPage />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(actuators.waterStart).toHaveBeenCalledWith(1);

    await waitFor(() => {
      // It should display error toast
      expect(document.querySelector('ion-toast')).toHaveAttribute('message', 'Failed to execute command');
    });
  });

  it('handles fetchStatus API failure, shows offline banner, and disables controls', async () => {
    (system.getStatus as any).mockRejectedValueOnce(new Error('Backend offline'));

    const { act } = await import('@testing-library/react');
    render(<ControlsPage />);

    await act(async () => {
        // Wait 500ms to let the promise resolve and React commit the batch update
        await new Promise((resolve) => setTimeout(resolve, 500));
    });

    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByText(/Unable to communicate with the system/i)).toBeInTheDocument();

    expect(screen.getByText('Start').closest('ion-button')).toHaveAttribute('disabled');
    expect(screen.getByText('Stop All').closest('ion-button')).toHaveAttribute('disabled');
    expect(screen.getByTestId('gantry-panel')).toHaveAttribute('data-disabled', 'true');
  });
});
