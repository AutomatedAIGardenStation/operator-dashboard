import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ControlsPage } from './ControlsPage';
import * as actuators from '../../api/actuators';

vi.mock('../../api/actuators', () => ({
  waterStart: vi.fn(),
  waterStopAll: vi.fn(),
  setLight: vi.fn(),
  setFan: vi.fn(),
}));

describe('ControlsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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
    // We cast to any here to satisfy both TypeScript (it expects Element | Node)
    // and ESLint (which complains about HTMLIonRangeElement not being defined globally)
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
});
