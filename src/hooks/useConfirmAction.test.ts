import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConfirmAction } from './useConfirmAction';
import { useIonAlert } from '@ionic/react';

vi.mock('@ionic/react', () => ({
  useIonAlert: vi.fn(),
}));

describe('useConfirmAction', () => {
  const presentAlertMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useIonAlert as unknown as ReturnType<typeof vi.fn>).mockReturnValue([presentAlertMock]);
  });

  it('calls presentAlert with correct options', () => {
    const { result } = renderHook(() => useConfirmAction());
    const action = vi.fn();
    const options = {
      header: 'Test Header',
      message: 'Test Message',
      confirmText: 'Yes',
      cancelText: 'No',
      color: 'danger',
    };

    result.current(action, options);

    expect(presentAlertMock).toHaveBeenCalledTimes(1);

    // Check arguments passed to presentAlert
    const callArgs = (presentAlertMock.mock.calls as any)[0][0] as any;

    expect(callArgs?.header).toBe(options.header);
    expect(callArgs?.message).toBe(options.message);

    // Cancel button
    expect(callArgs?.buttons?.[0]?.text).toBe(options.cancelText);
    expect(callArgs?.buttons?.[0]?.role).toBe('cancel');

    // Confirm button
    expect(callArgs?.buttons?.[1]?.text).toBe(options.confirmText);
    expect(callArgs?.buttons?.[1]?.role).toBe('confirm');
    expect(callArgs?.buttons?.[1]?.cssClass).toBe('alert-button-danger');
    expect(callArgs?.buttons?.[1]?.handler).toBe(action);
  });

  it('uses default options when not provided', () => {
    const { result } = renderHook(() => useConfirmAction());
    const action = vi.fn();
    const options = {
      message: 'Only message provided',
    };

    result.current(action, options);

    expect(presentAlertMock).toHaveBeenCalledTimes(1);

    const callArgs = (presentAlertMock.mock.calls as any)[0][0] as any;

    expect(callArgs?.header).toBe('Confirm Action');
    expect(callArgs?.message).toBe(options.message);

    expect(callArgs?.buttons?.[0]?.text).toBe('Cancel');
    expect(callArgs?.buttons?.[1]?.text).toBe('Confirm');
    expect(callArgs?.buttons?.[1]?.cssClass).toBe('');
  });

  it('cancel handler has zero side effects', () => {
    const { result } = renderHook(() => useConfirmAction());
    const action = vi.fn();
    const options = {
      message: 'Test',
    };

    result.current(action, options);

    const callArgs = (presentAlertMock.mock.calls as any)[0][0] as any;
    const cancelHandler = callArgs?.buttons?.[0]?.handler;

    // Calling it shouldn't throw or trigger anything
    if (cancelHandler) cancelHandler();
    expect(action).not.toHaveBeenCalled();
  });
});
