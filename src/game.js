import { cellInfos } from './path';

export const initialPositions = {
  red: { 1: 'home', 2: 'home', 3: 'home', 4: 'home' },
  green: { 1: 'home', 2: 'home', 3: 'home', 4: 'home' },
  blue: { 1: 'home', 2: 'home', 3: 'home', 4: 'home' },
  yellow: { 1: 'home', 2: 'home', 3: 'home', 4: 'home' },
};

export const playerColors = {
  1: 'red',
  2: 'green',
  3: 'yellow',
  4: 'blue',
};


export const paths = {
    green: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'r16', 'r17', 'r18', 'r19', 'r20', 'r21', 'r22', 'r23', 'r24', 'r25', 'r26', 'r27', 'r28', 'r29', 'r30', 'r31', 'r32', 'r33', 'r34', 'r35', 'r36', 'r37', 'r38', 'r39', 'r40', 'r41', 'r42', 'r43', 'r44', 'r45', 'r46', 'r47', 'r48', 'r49', 'r50', 'r51', 'rh1', 'rh2', 'rh3', 'rh4', 'rh5', 'rh6'],
    yellow: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13', 'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20', 'g21', 'g22', 'g23', 'g24', 'g25', 'g26', 'g27', 'g28', 'g29', 'g30', 'g31', 'g32', 'g33', 'g34', 'g35', 'g36', 'g37', 'g38', 'g39', 'g40', 'g41', 'g42', 'g43', 'g44', 'g45', 'g46', 'g47', 'g48', 'g49', 'g50', 'g51', 'gh1', 'gh2', 'gh3', 'gh4', 'gh5', 'gh6'],
    blue: ['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12', 'y13', 'y14', 'y15', 'y16', 'y17', 'y18', 'y19', 'y20', 'y21', 'y22', 'y23', 'y24', 'y25', 'y26', 'y27', 'y28', 'y29', 'y30', 'y31', 'y32', 'y33', 'y34', 'y35', 'y36', 'y37', 'y38', 'y39', 'y40', 'y41', 'y42', 'y43', 'y44', 'y45', 'y46', 'y47', 'y48', 'y49', 'y50', 'y51', 'yh1', 'yh2', 'yh3', 'yh4', 'yh5', 'yh6'],
    red: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'b14', 'b15', 'b16', 'b17', 'b18', 'b19', 'b20', 'b21', 'b22', 'b23', 'b24', 'b25', 'b26', 'b27', 'b28', 'b29', 'b30', 'b31', 'b32', 'b33', 'b34', 'b35', 'b36', 'b37', 'b38', 'b39', 'b40', 'b41', 'b42', 'b43', 'b44', 'b45', 'b46', 'b47', 'b48', 'b49', 'b50', 'b51', 'bh1', 'bh2', 'bh3', 'bh4', 'bh5', 'bh6'],
};

export const entryPoints = {
  green: 'r1',
  yellow: 'g1',
  blue: 'y1',
  red: 'b1',
};

export function getPossibleMoves(player, diceValue, tokenPositions, isReverseMode, playerStats) {
  const moves = [];
  const color = playerColors[player];
  const playerTokenPositions = tokenPositions[color];
  const reverseCount = playerStats[player]?.reverseCount;

  // Pre-analyze the board to find token locations and blocks
  const cellAnalysis = {};
  for (const c in tokenPositions) {
    for (const n in tokenPositions[c]) {
      const posId = tokenPositions[c][n];
      if (posId !== 'home' && posId !== 'finished') {
        const { row, col } = cellInfos[posId];
        const coordKey = `${row}-${col}`;
        if (!cellAnalysis[coordKey]) {
          cellAnalysis[coordKey] = { tokens: [] };
        }
        cellAnalysis[coordKey].tokens.push({ color: c, number: n });
      }
    }
  }

  // Identify blocks
  for (const coordKey in cellAnalysis) {
    const cell = cellAnalysis[coordKey];
    if (cell.tokens.length >= 2) {
      const firstTokenColor = cell.tokens[0].color;
      if (cell.tokens.every(t => t.color === firstTokenColor)) {
        cell.isBlock = true;
        cell.blockingColor = firstTokenColor;
      }
    }
  }

  // Define final cells for each color
  const finalCells = {
    green: 'rh6',
    yellow: 'gh6',
    blue: 'yh6',
    red: 'bh6',
  };

  for (const tokenNumber in playerTokenPositions) {
    const currentPositionId = playerTokenPositions[tokenNumber];

    // If token is on its final cell, do not allow any more moves
    if (currentPositionId === finalCells[color]) {
      continue;
    }

    if (currentPositionId === 'home') {
      if (diceValue === 6) {
        const newPositionId = entryPoints[color];
        moves.push({ tokenNumber, newPositionId, color });
      }
    } else if (currentPositionId !== 'finished') {
      const path = paths[color];
      const currentIndex = path.indexOf(currentPositionId);
      let newIndex;

      if (isReverseMode) {
        if (reverseCount > 0) {
          newIndex = currentIndex - diceValue;
        } else {
          continue;
        }
      } else {
        newIndex = currentIndex + diceValue;
      }

      // Only allow move if it lands exactly on the final cell (not overshoot)
      if (newIndex >= 0 && newIndex < path.length) {
        const newPositionId = path[newIndex];
        // If the final cell is in the path, check if this move lands on it
        if (newPositionId === finalCells[color] || newPositionId !== finalCells[color]) {
          // Only allow if not overshooting the final cell
          if (newPositionId === finalCells[color] || path.indexOf(finalCells[color]) > newIndex) {
            const { row, col } = cellInfos[newPositionId];
            const newCoordKey = `${row}-${col}`;
            const cellInfo = cellAnalysis[newCoordKey];

            // Capture logic: capture is only possible on non-safe, non-block cells with a single opponent
            const isSafeStar = cellInfos[newPositionId].isSafe;
            if (!isSafeStar && cellInfo && !cellInfo.isBlock && cellInfo.tokens.length === 1 && cellInfo.tokens[0].color !== color) {
              moves.push({ tokenNumber, newPositionId, color, captured: cellInfo.tokens[0] });
            } else {
              moves.push({ tokenNumber, newPositionId, color });
            }
          }
        }
      }
      // Do not allow overshooting the final cell, so do not push 'finished' if not exact
      // Only allow 'finished' if the move lands exactly on the final cell
      if (!isReverseMode && currentIndex + diceValue === path.indexOf(finalCells[color])) {
        moves.push({ tokenNumber, newPositionId: finalCells[color], color });
      }
    }
  }

  return moves;
}
