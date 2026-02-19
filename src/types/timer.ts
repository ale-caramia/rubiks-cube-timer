export type TimerState = 'idle' | 'ready' | 'inspection' | 'countdown' | 'running' | 'stopped';

export type CubeMode =
  | '2x2x2'
  | '3x3x3'
  | '4x4x4'
  | '5x5x5'
  | 'pyraminx'
  | 'skewb'
  | 'megaminx'
  | 'square-1';

export interface TimeEntry {
  time: number;
  timestamp: number;
  scramble?: string;
}

export interface Session {
  id: number;
  name: string;
  date: string;
  cubeMode: CubeMode;
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
  preferredCubeMode?: CubeMode;
  migrationVersion?: number;
}
