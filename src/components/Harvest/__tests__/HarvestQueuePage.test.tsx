import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HarvestQueuePage } from '../HarvestQueuePage';
import { usePlantsStore } from '../../../store/plantsStore';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();

vi.mock('../../../store/plantsStore', () => ({
  usePlantsStore: vi.fn(),
}));

const mockFetchPlants = vi.fn();
const mockFetchHarvestQueue = vi.fn();
const mockTriggerHarvest = vi.fn();

describe('HarvestQueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePlantsStore as any).mockReturnValue({
      plants: [],
      harvestQueue: [],
      loading: false,
      error: null,
      fetchPlants: mockFetchPlants,
      fetchHarvestQueue: mockFetchHarvestQueue,
      triggerHarvest: mockTriggerHarvest,
    });
  });

  it('renders an empty state message when there are no jobs', () => {
    render(<HarvestQueuePage />);
    expect(screen.getByText('No harvest jobs in the queue.')).toBeInTheDocument();
  });

  it('renders a list of harvest jobs with correct confidence value', () => {
    (usePlantsStore as any).mockReturnValue({
      plants: [
        { id: 1, name: 'Tomato' },
      ],
      harvestQueue: [
        { id: 'job-1', plant_id: 1, status: 'ready', confidence: 0.95, created_at: '2023-01-01' }
      ],
      loading: false,
      error: null,
      fetchPlants: mockFetchPlants,
      fetchHarvestQueue: mockFetchHarvestQueue,
      triggerHarvest: mockTriggerHarvest,
    });

    render(<HarvestQueuePage />);
    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 95%')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('calls triggerHarvest when button is clicked', async () => {
    (usePlantsStore as any).mockReturnValue({
      plants: [
        { id: 1, name: 'Tomato' },
      ],
      harvestQueue: [
        { id: 'job-1', plant_id: 1, status: 'ready', confidence: 0.95, created_at: '2023-01-01' }
      ],
      loading: false,
      error: null,
      fetchPlants: mockFetchPlants,
      fetchHarvestQueue: mockFetchHarvestQueue,
      triggerHarvest: mockTriggerHarvest,
    });

    render(<HarvestQueuePage />);

    const triggerBtn = screen.getByTestId('trigger-harvest-button');
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(mockTriggerHarvest).toHaveBeenCalledWith('job-1');
    });
  });
});
