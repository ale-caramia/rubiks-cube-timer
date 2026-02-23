import type { TimerSettings } from '../types/timer';

export const TIMER_SETTINGS_LIMITS = {
  inspectionSeconds: { min: 5, max: 60 },
  launchCountdownSeconds: { min: 1, max: 10 },
  scrambleMoveCount: { min: 10, max: 30 },
  autoSessionAfterHours: { min: 1, max: 24 }
} as const;

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  inspectionEnabled: true,
  inspectionSeconds: 15,
  launchCountdownEnabled: true,
  launchCountdownSeconds: 5,
  scrambleMoveCount: 25,
  autoSessionAfterHours: 6
};

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(value)));
};

export const normalizeTimerSettings = (raw?: Partial<TimerSettings> | null): TimerSettings => ({
  inspectionEnabled: raw?.inspectionEnabled ?? DEFAULT_TIMER_SETTINGS.inspectionEnabled,
  inspectionSeconds: clamp(
    raw?.inspectionSeconds,
    TIMER_SETTINGS_LIMITS.inspectionSeconds.min,
    TIMER_SETTINGS_LIMITS.inspectionSeconds.max,
    DEFAULT_TIMER_SETTINGS.inspectionSeconds
  ),
  launchCountdownEnabled: raw?.launchCountdownEnabled ?? DEFAULT_TIMER_SETTINGS.launchCountdownEnabled,
  launchCountdownSeconds: clamp(
    raw?.launchCountdownSeconds,
    TIMER_SETTINGS_LIMITS.launchCountdownSeconds.min,
    TIMER_SETTINGS_LIMITS.launchCountdownSeconds.max,
    DEFAULT_TIMER_SETTINGS.launchCountdownSeconds
  ),
  scrambleMoveCount: clamp(
    raw?.scrambleMoveCount,
    TIMER_SETTINGS_LIMITS.scrambleMoveCount.min,
    TIMER_SETTINGS_LIMITS.scrambleMoveCount.max,
    DEFAULT_TIMER_SETTINGS.scrambleMoveCount
  ),
  autoSessionAfterHours: clamp(
    raw?.autoSessionAfterHours,
    TIMER_SETTINGS_LIMITS.autoSessionAfterHours.min,
    TIMER_SETTINGS_LIMITS.autoSessionAfterHours.max,
    DEFAULT_TIMER_SETTINGS.autoSessionAfterHours
  )
});

