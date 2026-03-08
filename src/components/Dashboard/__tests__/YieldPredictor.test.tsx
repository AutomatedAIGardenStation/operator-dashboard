import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YieldPredictor } from '../YieldPredictor';

describe('YieldPredictor', () => {
  it('renders loading state initially', () => {
    render(<YieldPredictor />);
    expect(screen.getByText('Loading predictions...')).toBeInTheDocument();
  });

  it('renders mock data after loading', async () => {
    vi.useFakeTimers();
    render(<YieldPredictor />);

    // Fast-forward the setTimeout in the hook
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Yield Predictor (MVP)')).toBeInTheDocument();
    expect(screen.getByText('Tomato - Alpha')).toBeInTheDocument();
    expect(screen.getByText('4.2 kg')).toBeInTheDocument();
    expect(screen.getByText('85% Confidence')).toBeInTheDocument();

    expect(screen.getByText('Lettuce - Beta')).toBeInTheDocument();
    expect(screen.getByText('1.1 kg')).toBeInTheDocument();
    expect(screen.getByText('92% Confidence')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
