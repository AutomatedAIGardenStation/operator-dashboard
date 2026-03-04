import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Language = 'en' | 'ru';

interface SettingsState {
  theme: ThemeMode;
  temperatureUnit: TemperatureUnit;
  language: Language;
  notificationsEnabled: boolean;
  sensorPollingInterval: number;
  dashboardLayout: string[];

  setTheme: (theme: ThemeMode) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setLanguage: (language: Language) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSensorPollingInterval: (interval: number) => void;
  setDashboardLayout: (layout: string[]) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: Pick<
  SettingsState,
  | 'theme'
  | 'temperatureUnit'
  | 'language'
  | 'notificationsEnabled'
  | 'sensorPollingInterval'
  | 'dashboardLayout'
> = {
  theme: 'system',
  temperatureUnit: 'celsius',
  language: 'en',
  notificationsEnabled: true,
  sensorPollingInterval: 5000,
  dashboardLayout: [
    'sensors-overview',
    'actuator-status',
    'plant-health',
    'recent-alerts',
  ],
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  ...DEFAULT_SETTINGS,

  setTheme: (theme) => set({ theme }),

  setTemperatureUnit: (temperatureUnit) => set({ temperatureUnit }),

  setLanguage: (language) => set({ language }),

  setNotificationsEnabled: (notificationsEnabled) =>
    set({ notificationsEnabled }),

  setSensorPollingInterval: (sensorPollingInterval) =>
    set({ sensorPollingInterval }),

  setDashboardLayout: (dashboardLayout) => set({ dashboardLayout }),

  resetToDefaults: () => set(DEFAULT_SETTINGS),
}));
