import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { SettingsPage } from '../SettingsPage';
import { updateThresholds } from '../../../api/system';
import { useCapability } from '../../../store/capabilitiesStore';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../../api/system', () => ({
  updateThresholds: vi.fn(),
}));

vi.mock('../../../store/capabilitiesStore', () => ({
  useCapability: vi.fn(),
}));

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react');
  return {
    ...actual,
    useIonToast: () => [vi.fn(), vi.fn()],
  };
});

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Preferences.get as any).mockResolvedValue({ value: 'false' });
    (useCapability as any).mockReturnValue(true);
  });

  it('renders and persists notification toggles via Capacitor Preferences', async () => {
    render(<SettingsPage />);

    // Wait for the component to mount and fetch initial preferences
    await waitFor(() => {
      expect(Preferences.get).toHaveBeenCalledWith({ key: 'notify_low_tank' });
    });

    const lowTankToggle = screen.getByText('Low Tank').closest('ion-item')?.querySelector('ion-toggle');
    expect(lowTankToggle).toBeInTheDocument();

    // Simulate user toggling
    if (lowTankToggle) {
        // IonToggle custom element events in JSDOM might be tricky, directly call onIonChange if needed
        // Since we are using standard event testing, let's dispatch an event
        const event = new CustomEvent('ionChange', { detail: { checked: true } });
        lowTankToggle.dispatchEvent(event);
    }

    await waitFor(() => {
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'notify_low_tank', value: 'true' });
    });
  });

  it('calls updateThresholds API when save button is clicked', async () => {
    const { container } = render(<SettingsPage />);

    // In Ionic React with JSDOM, inputs are custom elements, we can simulate onIonInput
    // Ionic 8 label-placement label text might not be queried successfully with getByLabelText easily
    const maxTempInput = container.querySelector('#temp_max');

    if (maxTempInput) {
        const event = new CustomEvent('ionInput', { detail: { value: '30' } });
        maxTempInput.dispatchEvent(event);
    }

    const saveButton = await screen.findByText(/Save Thresholds/i);
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(updateThresholds).toHaveBeenCalledWith(expect.objectContaining({
        temp_max: '30'
      }));
    });
  });
});
