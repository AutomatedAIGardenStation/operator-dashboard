import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import { useSensorStore } from '../../../store/sensorStore';

vi.mock('../../../store/sensorStore', () => {
  return {
    useSensorStore: vi.fn(),
  };
});

describe('DashboardPage', () => {
  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls connect on mount and disconnect on unmount', () => {
    (useSensorStore as any).mockReturnValue({
      connected: true,
      readings: null,
      lastUpdated: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    const { unmount } = render(<DashboardPage />);

    expect(mockConnect).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('shows disconnected banner when connected is false', () => {
    (useSensorStore as any).mockReturnValue({
      connected: false,
      readings: null,
      lastUpdated: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<DashboardPage />);

    expect(screen.getByTestId('disconnected-banner')).toBeInTheDocument();
  });

  it('renders sensor cards with mock store data', () => {
    (useSensorStore as any).mockReturnValue({
      connected: true,
      readings: {
        temp: 23.5,
        humidity: 60,
        ph: 6.2,
        ec: 1.5,
        tank_level_pct: 85,
        soil_moisture: [40, 42],
        actuator_status: { pump: true, light: false }
      },
      lastUpdated: new Date('2023-01-01T12:00:00Z'),
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<DashboardPage />);

    // Ensure disconnected banner is NOT shown
    expect(screen.queryByTestId('disconnected-banner')).toBeNull();

    // Check temp
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('23.5 °C')).toBeInTheDocument();

    // Check humidity
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('60 %')).toBeInTheDocument();

    // Check pH
    expect(screen.getByText('pH Level')).toBeInTheDocument();
    expect(screen.getByText('6.2')).toBeInTheDocument();

    // Check EC
    expect(screen.getByText('EC')).toBeInTheDocument();
    expect(screen.getByText('1.5 mS/cm')).toBeInTheDocument();

    // Check Tank Level (rendered as progress type)
    expect(screen.getByText('Tank Level')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();

    // Check soil moisture array
    expect(screen.getByText('Z1: 40%')).toBeInTheDocument();
    expect(screen.getByText('Z2: 42%')).toBeInTheDocument();

    // Check actuators
    expect(screen.getByText('pump: Active')).toBeInTheDocument();
    expect(screen.getByText('light: Idle')).toBeInTheDocument();
  });
});
