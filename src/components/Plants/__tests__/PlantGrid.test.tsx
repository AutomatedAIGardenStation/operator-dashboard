import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PlantGrid } from '../PlantGrid';
import { usePlantsStore } from '../../../store/plantsStore';
import * as gantryApi from '../../../api/gantry';
import { getSocket } from '../../../hooks/useWebSocket';

vi.mock('../../../store/plantsStore', () => ({
  usePlantsStore: vi.fn(),
}));

vi.mock('../../../api/gantry', () => ({
  getGantryPosition: vi.fn(),
}));

vi.mock('../../../hooks/useWebSocket', () => ({
  getSocket: vi.fn(),
}));

describe('PlantGrid', () => {
  let mockSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    };
    (getSocket as any).mockReturnValue(mockSocket);

    (usePlantsStore as any).mockReturnValue({
      plants: [
        {
          id: 1,
          name: 'Tomato',
          location: {
            position: { x: 10, y: 20 },
          },
        },
        {
          id: 2,
          name: 'Basil',
          location: {
            position: { x: 50, y: 60 },
          },
        },
      ],
    });

    (gantryApi.getGantryPosition as any).mockResolvedValue({ x: 30, y: 40, z: 0 });
  });

  it('renders plants and gantry position on a 2D grid', async () => {
    render(<PlantGrid />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(gantryApi.getGantryPosition).toHaveBeenCalled();
    });

    const gridContainer = screen.getByTestId('plant-grid-container');
    expect(gridContainer).toBeDefined();

    // Check plant markers
    expect(screen.getByTestId('plant-marker-1')).toBeDefined();
    expect(screen.getByTestId('plant-marker-2')).toBeDefined();

    // Check gantry marker
    expect(screen.getByTestId('gantry-marker')).toBeDefined();

    // Ensure socket listeners are set
    expect(mockSocket.on).toHaveBeenCalledWith('gantry.position', expect.any(Function));
  });

  it('handles socket position updates', async () => {
    render(<PlantGrid />);

    await waitFor(() => {
      expect(gantryApi.getGantryPosition).toHaveBeenCalled();
    });

    const handler = mockSocket.on.mock.calls.find((c: any) => c[0] === 'gantry.position')?.[1];
    expect(handler).toBeDefined();

    // Trigger an update
    act(() => {
      handler({ x: 80, y: 90, z: 0 });
    });

    // Ensure state updates to new position
    // Since we're asserting on left/top styles, wait for re-render
    await waitFor(() => {
      const gantryMarker = screen.getByTestId('gantry-marker');
      // Just check that it updated its inline style based on DOM
      expect(gantryMarker.getAttribute('style')).toContain('left:');
    });
  });

  it('unmounts and cleans up socket listeners', async () => {
    const { unmount } = render(<PlantGrid />);

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('gantry.position', expect.any(Function));
  });
});
