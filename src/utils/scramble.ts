import type { CubeMode } from '../types/timer';
import { DEFAULT_CUBE_MODE } from './cubeModes';
import { DEFAULT_TIMER_SETTINGS, TIMER_SETTINGS_LIMITS } from './timerSettings';

const standardMoves = ['R', 'L', 'U', 'D', 'F', 'B'];
const modifiers = ['', "'", '2'];

const getAxis = (move: string): string => {
  const normalized = move.replace(/[^A-Za-z]/g, '').toUpperCase();
  const primary = normalized.charAt(0);
  if (primary === 'R' || primary === 'L') return 'RL';
  if (primary === 'U' || primary === 'D') return 'UD';
  if (primary === 'F' || primary === 'B') return 'FB';
  return '';
};

const generateNxNScramble = (length: number, moves: string[]): string => {
  const scrambleArray: string[] = [];
  let lastMove = '';
  let lastAxis = '';

  for (let i = 0; i < length; i++) {
    let move: string;
    let modifier: string;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
      modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    } while (move === lastMove || getAxis(move) === lastAxis);

    scrambleArray.push(move + modifier);
    lastMove = move;
    lastAxis = getAxis(move);
  }

  return scrambleArray.join(' ');
};

const generatePyraminx = (length: number): string => {
  const moves = ['R', 'L', 'U', 'B'];
  return generateNxNScramble(length, moves);
};

const generateSkewb = (length: number): string => {
  const moves = ['R', 'L', 'U', 'B'];
  return generateNxNScramble(length, moves);
};

const generateMegaminx = (length: number): string => {
  const moves = ['R++', 'R--', 'D++', 'D--'];
  const lineCount = Math.max(1, Math.round(length / 8));
  const lines = Array.from({ length: lineCount }, () => {
    const sequence = Array.from({ length: 10 }, () => moves[Math.floor(Math.random() * moves.length)]).join(' ');
    const suffix = Math.random() > 0.5 ? 'U' : "U'";
    return `${sequence} ${suffix}`;
  });
  return lines.join(' / ');
};

const generateSquare1 = (length: number): string => {
  const step = (): string => `(${Math.floor(Math.random() * 7) - 3},${Math.floor(Math.random() * 7) - 3})`;
  return Array.from({ length }, () => `${step()} /`).join(' ');
};

export const generateScramble = (
  mode: CubeMode = DEFAULT_CUBE_MODE,
  moveCount: number = DEFAULT_TIMER_SETTINGS.scrambleMoveCount
): string => {
  const normalizedMoves = Math.max(
    TIMER_SETTINGS_LIMITS.scrambleMoveCount.min,
    Math.min(TIMER_SETTINGS_LIMITS.scrambleMoveCount.max, Math.round(moveCount))
  );

  switch (mode) {
    case '2x2x2':
      return generateNxNScramble(normalizedMoves, standardMoves);
    case '3x3x3':
      return generateNxNScramble(normalizedMoves, standardMoves);
    case '4x4x4':
      return generateNxNScramble(normalizedMoves, [...standardMoves, 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw']);
    case '5x5x5':
      return generateNxNScramble(normalizedMoves, [...standardMoves, 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw']);
    case 'pyraminx':
      return generatePyraminx(normalizedMoves);
    case 'skewb':
      return generateSkewb(normalizedMoves);
    case 'megaminx':
      return generateMegaminx(normalizedMoves);
    case 'square-1':
      return generateSquare1(normalizedMoves);
    default:
      return generateNxNScramble(normalizedMoves, standardMoves);
  }
};
