export type TimerState = 'idle' | 'ready' | 'running' | 'stopped';

export interface TimeEntry {
  time: number;
  timestamp: number;
  scramble?: string;
}

export interface Session {
  id: number;
  name: string;
  date: string;
  times: TimeEntry[];
}

export interface Stats {
  best: number;
  worst: number;
  average: number;
  count: number;
}

export interface StorageData {
  sessions: Session[];
  currentSessionId: number | null;
}
