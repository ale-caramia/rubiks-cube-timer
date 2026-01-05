export const generateScramble = (length: number = 30): string => {
  const moves: string[] = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers: string[] = ['', "'", '2'];
  const scrambleArray: string[] = [];
  let lastMove = '';
  let lastAxis = '';

  const getAxis = (move: string): string => {
    if (move === 'R' || move === 'L') return 'RL';
    if (move === 'U' || move === 'D') return 'UD';
    if (move === 'F' || move === 'B') return 'FB';
    return '';
  };

  for (let i = 0; i < length; i++) {
    let move: string, modifier: string;
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
