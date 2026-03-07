import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Testing Caveats and Required Mocks
 *
 * - `matchMedia` is mocked globally here because JSDOM does not implement it,
 *   and Ionic React components rely heavily on it for responsive behavior.
 * - Unhandled promise rejections and uncaught exceptions will intentionally
 *   crash the test process to prevent silent failures in CI.
 * - Ensure asynchronous React state updates in tests are wrapped in `act(...)`
 *   to avoid "not wrapped in act" warnings.
 * - Always run `vi.clearAllMocks()` and `vi.clearAllTimers()` between tests
 *   to prevent leaked state and timers.
 */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
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

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Fail the test process if there's an unhandled rejection to prevent CI from hanging or silently passing
  throw reason;
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Fail the test process if there's an uncaught exception
  throw error;
});

// Harden test setup teardown to avoid leaked timers/subscriptions
import { afterEach } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Add CI check that fails on console error/warning classes deemed critical
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  // In CI or strict test environment, fail on 'act(...)' warnings or critical React errors
  if (message.includes('not wrapped in act(...)') || message.includes('Warning: React does not recognize')) {
    throw new Error(`Test failed due to critical console.error: ${message}`);
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('not wrapped in act(...)')) {
    throw new Error(`Test failed due to critical console.warn: ${message}`);
  }
  originalConsoleWarn(...args);
};
