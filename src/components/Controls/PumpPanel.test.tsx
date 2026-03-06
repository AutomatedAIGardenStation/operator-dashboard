import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PumpPanel } from './PumpPanel';
import * as dosing from '../../api/dosing';

vi.mock('../../api/dosing', () => ({
  runPump: vi.fn(),
}));

describe('PumpPanel', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls runPump on Run Pump click with duration', async () => {
    (dosing.runPump as any).mockResolvedValueOnce(undefined);
    render(<PumpPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    const input = document.querySelector('ion-input') as any;
    fireEvent(input, new CustomEvent('ionInput', { detail: { value: '5000' } }));

    fireEvent.click(screen.getByText('Run Pump'));

    expect(dosing.runPump).toHaveBeenCalledWith({ duration_ms: 5000 });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Running pump for 5000ms');
    });
  });

  it('calls onError on API failure', async () => {
    (dosing.runPump as any).mockRejectedValueOnce(new Error('Network error'));
    render(<PumpPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    fireEvent.click(screen.getByText('Run Pump'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to run pump');
    });
  });
});
