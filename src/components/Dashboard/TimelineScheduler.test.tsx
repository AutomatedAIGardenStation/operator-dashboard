import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { TimelineScheduler } from './TimelineScheduler';
import { usePlantsStore } from '../../store/plantsStore';

// Mock the Ionic React module
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react');
  return {
    ...actual,
    IonCard: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-card">{children}</div>,
    IonCardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-card-header">{children}</div>,
    IonCardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="ion-card-title">{children}</h2>,
    IonCardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-card-content">{children}</div>,
    IonList: ({ children }: { children: React.ReactNode }) => <ul data-testid="ion-list">{children}</ul>,
    IonItem: ({ children }: { children: React.ReactNode }) => <li data-testid="ion-item">{children}</li>,
    IonLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-label">{children}</div>,
    IonBadge: ({ children }: { children: React.ReactNode }) => <span data-testid="ion-badge">{children}</span>,
    IonText: ({ children, color }: { children: React.ReactNode; color?: string }) => <span data-testid="ion-text" data-color={color}>{children}</span>,
    IonIcon: () => <span data-testid="ion-icon" />,
  };
});

// Mock the store
vi.mock('../../store/plantsStore', () => ({
  usePlantsStore: vi.fn(),
}));

describe('TimelineScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a message when no tasks are scheduled in the next 24 hours', async () => {
    const fetchHarvestQueue = vi.fn();
    const fetchPlants = vi.fn();

    (usePlantsStore as any).mockReturnValue({
      harvestQueue: [],
      plants: [],
      fetchHarvestQueue,
      fetchPlants,
    });

    render(<TimelineScheduler />);

    expect(fetchPlants).toHaveBeenCalled();
    expect(fetchHarvestQueue).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('No tasks scheduled for the next 24 hours.')).toBeInTheDocument();
    });
  });

  it('renders tasks scheduled within the next 24 hours chronologically', async () => {
    const now = new Date('2026-03-06T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const fetchHarvestQueue = vi.fn().mockResolvedValue(undefined);
    const fetchPlants = vi.fn().mockResolvedValue(undefined);

    const mockPlants = [
      { id: 1, name: 'Tomato' },
      { id: 2, name: 'Basil' },
    ];

    const mockHarvestQueue = [
      {
        id: 'job-1',
        plant_id: 1,
        status: 'ready',
        confidence: 0.9,
        scheduled_at: '2026-03-06T14:00:00Z', // In 2 hours (within 24 hours)
      },
      {
        id: 'job-2',
        plant_id: 2,
        status: 'pending',
        confidence: 0.8,
        scheduled_at: '2026-03-07T13:00:00Z', // In 25 hours (outside 24 hours)
      },
      {
        id: 'job-3',
        plant_id: 2,
        status: 'in_progress',
        confidence: 0.8,
        scheduled_at: '2026-03-06T13:00:00Z', // In 1 hour (within 24 hours)
      },
    ];

    (usePlantsStore as any).mockReturnValue({
      harvestQueue: mockHarvestQueue,
      plants: mockPlants,
      fetchHarvestQueue,
      fetchPlants,
    });

    render(<TimelineScheduler />);

    const items = screen.getAllByTestId('ion-item');
    expect(items).toHaveLength(2); // Only job-1 and job-3 should be rendered

    // job-3 should be first because it's scheduled earlier
    expect(items[0]).toHaveTextContent('Basil Harvest');
    // time depends on the local timezone, but we can just check if Basil is first
    expect(items[1]).toHaveTextContent('Tomato Harvest');
  });

  it('falls back to Plant #ID if plant name is not found', async () => {
    const now = new Date('2026-03-06T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const fetchHarvestQueue = vi.fn().mockResolvedValue(undefined);
    const fetchPlants = vi.fn().mockResolvedValue(undefined);

    const mockHarvestQueue = [
      {
        id: 'job-1',
        plant_id: 99,
        status: 'ready',
        confidence: 0.9,
        scheduled_at: '2026-03-06T14:00:00Z',
      },
    ];

    (usePlantsStore as any).mockReturnValue({
      harvestQueue: mockHarvestQueue,
      plants: [],
      fetchHarvestQueue,
      fetchPlants,
    });

    render(<TimelineScheduler />);

    expect(screen.getByText('Plant #99 Harvest')).toBeInTheDocument();
  });
});
