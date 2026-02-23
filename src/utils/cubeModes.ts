import type { CubeMode } from '../types/timer';

export interface CubeModeMeta {
  id: CubeMode;
  label: string;
  shortLabel: string;
  accentClass: string;
}

export const DEFAULT_CUBE_MODE: CubeMode = '3x3x3';

export const CUBE_MODES: CubeModeMeta[] = [
  { id: '2x2x2', label: '2x2x2 Pocket Cube', shortLabel: '2x2', accentClass: 'bg-lime-200' },
  { id: '3x3x3', label: '3x3x3 Standard', shortLabel: '3x3', accentClass: 'bg-yellow-200' },
  { id: '4x4x4', label: '4x4x4 Revenge', shortLabel: '4x4', accentClass: 'bg-cyan-200' },
  { id: '5x5x5', label: '5x5x5 Professor', shortLabel: '5x5', accentClass: 'bg-pink-200' },
  { id: 'pyraminx', label: 'Pyraminx', shortLabel: 'PYRA', accentClass: 'bg-orange-200' },
  { id: 'skewb', label: 'Skewb', shortLabel: 'SKEWB', accentClass: 'bg-violet-200' },
  { id: 'megaminx', label: 'Megaminx', shortLabel: 'MEGA', accentClass: 'bg-emerald-200' },
  { id: 'square-1', label: 'Square-1', shortLabel: 'SQ-1', accentClass: 'bg-blue-200' }
];

export const isCubeMode = (value: unknown): value is CubeMode => {
  return CUBE_MODES.some(mode => mode.id === value);
};

export const getCubeModeMeta = (mode: CubeMode): CubeModeMeta => {
  return CUBE_MODES.find(item => item.id === mode) ?? CUBE_MODES.find(item => item.id === DEFAULT_CUBE_MODE)!;
};
