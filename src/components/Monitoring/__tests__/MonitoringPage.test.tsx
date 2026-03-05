import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MonitoringPage } from '../MonitoringPage';
import { useMonitoringStore } from '../../../store/monitoringStore';

// Mock Recharts to avoid issues with ResponsiveContainer in JSDOM
vi.mock('recharts', async () => {
  const OriginalRecharts = await vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

vi.mock('../../../store/monitoringStore', () => ({
  useMonitoringStore: vi.fn(),
}));

describe('MonitoringPage', () => {
  let mockSetZone: ReturnType<typeof vi.fn>;
  let mockSetRange: ReturnType<typeof vi.fn>;
  let mockFetchHistory: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetZone = vi.fn();
    mockSetRange = vi.fn();
    mockFetchHistory = vi.fn();

    // Reset window.matchMedia mock for Ionic
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('shows loading skeleton when loading is true', () => {
    vi.mocked(useMonitoringStore).mockReturnValue({
      zone: 1,
      range: '1h',
      history: [],
      loading: true,
      error: null,
      setZone: mockSetZone,
      setRange: mockSetRange,
      fetchHistory: mockFetchHistory,
    });

    render(<MonitoringPage />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('sensor-chart')).not.toBeInTheDocument();
  });

  it('renders SensorCharts with mock data and verifies Recharts rendering', () => {
    const mockHistory = [
      { timestamp: '10:00', temp: 25, humidity: 60, ph: 6.5, ec: 1.2, soil_moisture: 45 },
      { timestamp: '11:00', temp: 26, humidity: 58, ph: 6.4, ec: 1.3, soil_moisture: 43 },
    ];

    vi.mocked(useMonitoringStore).mockReturnValue({
      zone: 1,
      range: '1h',
      history: mockHistory,
      loading: false,
      error: null,
      setZone: mockSetZone,
      setRange: mockSetRange,
      fetchHistory: mockFetchHistory,
    });

    const { container } = render(<MonitoringPage />);

    // Should render 3 charts
    expect(screen.getAllByTestId('sensor-chart')).toHaveLength(3);

    // Verify Recharts LineChart rendered by checking for recharts-wrapper
    expect(container.querySelectorAll('.recharts-wrapper').length).toBeGreaterThan(0);
  });

  it('calls setZone when chamber selector changes', () => {
    vi.mocked(useMonitoringStore).mockReturnValue({
      zone: 1,
      range: '1h',
      history: [],
      loading: false,
      error: null,
      setZone: mockSetZone,
      setRange: mockSetRange,
      fetchHistory: mockFetchHistory,
    });

    render(<MonitoringPage />);

    const select = screen.getByTestId('zone-select');

    // Simulate IonSelect change event
    act(() => {
      fireEvent(select, new CustomEvent('ionChange', { detail: { value: 3 } }));
    });

    expect(mockSetZone).toHaveBeenCalledWith(3);
  });
});
