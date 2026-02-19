import type { CubeMode } from '../types/timer';
import { DEFAULT_CUBE_MODE } from './cubeModes';

const standardMoves = ['R', 'L', 'U', 'D', 'F', 'B'];
const modifiers = ['', "'", '2'];

const getAxis = (move: string): string => {
  if (move === 'R' || move === 'L') return 'RL';
  if (move === 'U' || move === 'D') return 'UD';
  if (move === 'F' || move === 'B') return 'FB';
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

const generatePyraminx = (): string => {
  const moves = ['R', 'L', 'U', 'B'];
  return generateNxNScramble(11, moves);
};

const generateSkewb = (): string => {
  const moves = ['R', 'L', 'U', 'B'];
  return generateNxNScramble(10, moves);
};

const generateMegaminx = (): string => {
  const moves = ['R++', 'R--', 'D++', 'D--'];
  const lines = Array.from({ length: 7 }, () => {
    const sequence = Array.from({ length: 10 }, () => moves[Math.floor(Math.random() * moves.length)]).join(' ');
    const suffix = Math.random() > 0.5 ? 'U' : "U'";
    return `${sequence} ${suffix}`;
  });
  return lines.join(' / ');
};

const generateSquare1 = (): string => {
  const step = (): string => `(${Math.floor(Math.random() * 7) - 3},${Math.floor(Math.random() * 7) - 3})`;
  return Array.from({ length: 12 }, () => `${step()} /`).join(' ');
};

export const generateScramble = (mode: CubeMode = DEFAULT_CUBE_MODE): string => {
  switch (mode) {
    case '2x2x2':
      return generateNxNScramble(11, standardMoves);
    case '3x3x3':
      return generateNxNScramble(20, standardMoves);
    case '4x4x4':
      return generateNxNScramble(40, [...standardMoves, 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw']);
    case '5x5x5':
      return generateNxNScramble(60, [...standardMoves, 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw']);
    case 'pyraminx':
      return generatePyraminx();
    case 'skewb':
      return generateSkewb();
    case 'megaminx':
      return generateMegaminx();
    case 'square-1':
      return generateSquare1();
    default:
      return generateNxNScramble(20, standardMoves);
  }
};
