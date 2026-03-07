import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DosingPanel } from './DosingPanel';
import * as dosing from '../../api/dosing';

vi.mock('../../api/dosing', () => ({
  triggerDosingRecipe: vi.fn(),
  runPump: vi.fn(),
}));

vi.mock('../../hooks/useConfirmAction', () => ({
  useConfirmAction: () => {
    return (action: any) => {
      // Auto-confirm in tests
      action();
    };
  },
}));

describe('DosingPanel', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls triggerDosingRecipe on Dose click with correct values', async () => {
    (dosing.triggerDosingRecipe as any).mockResolvedValueOnce(undefined);
    render(<DosingPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    const inputs = document.querySelectorAll('ion-input') as any;
    fireEvent(inputs[0] as any, new CustomEvent('ionInput', { detail: { value: '1000' } })); // nutA
    fireEvent(inputs[1] as any, new CustomEvent('ionInput', { detail: { value: '500' } }));  // nutB
    fireEvent(inputs[2] as any, new CustomEvent('ionInput', { detail: { value: '200' } }));  // phUp
    fireEvent(inputs[3] as any, new CustomEvent('ionInput', { detail: { value: '0' } }));    // phDown

    fireEvent.click(screen.getByText('Trigger Dose'));

    expect(dosing.triggerDosingRecipe).toHaveBeenCalledWith({
      nut_a_ms: 1000,
      nut_b_ms: 500,
      ph_up_ms: 200,
      ph_down_ms: 0,
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Dosing recipe triggered');
    });
  });

  it('calls onError on API failure', async () => {
    (dosing.triggerDosingRecipe as any).mockRejectedValueOnce(new Error('Network error'));
    render(<DosingPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    fireEvent.click(screen.getByText('Trigger Dose'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to trigger dosing recipe');
    });
  });
});
