import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LogSettings {
  autoCleanupPeriod: number;
  errorThresholdPercentage: number;
  errorCountThreshold: number;
  visibleColumns: Record<string, boolean>;
}

interface LogSettingsStore {
  settings: LogSettings;
  updateSettings: (newSettings: Partial<LogSettings>) => void;
  updateVisibleColumns: (column: keyof LogSettings['visibleColumns'], value: boolean) => void;
}

export const useLogSettings = create<LogSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        autoCleanupPeriod: 30,
        errorThresholdPercentage: 10,
        errorCountThreshold: 100,
        visibleColumns: {
          timestamp: true,
          level: true,
          message: true,
          source: true,
        },
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      updateVisibleColumns: (column, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            visibleColumns: {
              ...state.settings.visibleColumns,
              [column]: value,
            },
          },
        })),
    }),
    {
      name: 'log-settings-storage',
    }
  )
);