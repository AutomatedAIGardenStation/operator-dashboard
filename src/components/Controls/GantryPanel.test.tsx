import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GantryPanel } from './GantryPanel';
import * as gantry from '../../api/gantry';
import { getSocket } from '../../hooks/useWebSocket';

vi.mock('../../api/gantry', () => ({
  moveGantry: vi.fn(),
  homeGantry: vi.fn(),
  getGantryPosition: vi.fn(),
}));

vi.mock('../../hooks/useWebSocket', () => ({
  getSocket: vi.fn(),
}));

describe('GantryPanel', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (gantry.getGantryPosition as any).mockResolvedValue({ x: 10, y: 20, z: 30, status: 'IDLE' });
    (getSocket as any).mockReturnValue({
      on: vi.fn(),
      off: vi.fn(),
    });
  });

  it('renders correctly and fetches initial position', async () => {
    render(<GantryPanel disabled={false} onSuccess={onSuccess} onError={onError} />);
    await waitFor(() => {
      expect(gantry.getGantryPosition).toHaveBeenCalled();
      expect(screen.getByText(/X: 10.00 mm/)).toBeInTheDocument();
      expect(screen.getByText(/Y: 20.00 mm/)).toBeInTheDocument();
      expect(screen.getByText(/Z: 30.00 mm/)).toBeInTheDocument();
      expect(screen.getByText(/Status: IDLE/)).toBeInTheDocument();
    });
  });

  it('calls moveGantry with input values on Move click', async () => {
    (gantry.moveGantry as any).mockResolvedValueOnce(undefined);
    render(<GantryPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    await waitFor(() => {
      expect(gantry.getGantryPosition).toHaveBeenCalled();
    });

    const inputs = document.querySelectorAll('ion-input');
    // Change X
    fireEvent(inputs[0] as any, new CustomEvent('ionInput', { detail: { value: '50' } }));
    // Change Y
    fireEvent(inputs[1] as any, new CustomEvent('ionInput', { detail: { value: '60' } }));
    // Change Z
    fireEvent(inputs[2] as any, new CustomEvent('ionInput', { detail: { value: '70' } }));

    fireEvent.click(screen.getByText('Move'));

    expect(gantry.moveGantry).toHaveBeenCalledWith({ x: 50, y: 60, z: 70 });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Moving gantry to X:50 Y:60 Z:70');
    });
  });

  it('calls homeGantry on Home Axes click', async () => {
    (gantry.homeGantry as any).mockResolvedValueOnce(undefined);
    render(<GantryPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    await waitFor(() => {
      expect(gantry.getGantryPosition).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Home Axes'));

    expect(gantry.homeGantry).toHaveBeenCalled();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Homing gantry axes');
    });
  });
});
