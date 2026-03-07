import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ValvePanel } from './ValvePanel';
import * as valves from '../../api/valves';

vi.mock('../../api/valves', () => ({
  setValve: vi.fn(),
}));

vi.mock('../../hooks/useConfirmAction', () => ({
  useConfirmAction: () => {
    return (action: any) => {
      // Auto-confirm in tests
      action();
    };
  },
}));

describe('ValvePanel', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setValve on toggle change', async () => {
    (valves.setValve as any).mockResolvedValueOnce(undefined);
    render(<ValvePanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    const toggles = document.querySelectorAll('ion-toggle');
    // NutA
    fireEvent(toggles[0] as any, new CustomEvent('ionChange', { detail: { checked: true } }));

    expect(valves.setValve).toHaveBeenCalledWith({ valve_id: 'NutA', state: true });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Toggled valve NutA to ON');
    });
  });

  it('calls onError on API failure', async () => {
    (valves.setValve as any).mockRejectedValueOnce(new Error('Network error'));
    render(<ValvePanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    const toggles = document.querySelectorAll('ion-toggle');
    // NutB
    fireEvent(toggles[1] as any, new CustomEvent('ionChange', { detail: { checked: false } }));

    expect(valves.setValve).toHaveBeenCalledWith({ valve_id: 'NutB', state: false });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to toggle valve NutB');
    });
  });
});
