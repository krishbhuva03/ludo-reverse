import React from 'react';
import './Board.css';
import { cellInfos } from './path';

const GRID_SIZE = 15;
const CENTER = 7;

// Entry points for each player (v1.0)
export const entryCells = {
  green: { row: 6, col: 1 },
  yellow: { row: 1, col: 8 },
  blue: { row: 8, col: 13 },
  red: { row: 13, col: 6 },
};

// Safe star coordinates (v1.0)
const safeStarCoords = new Set([
  '6-1','1-8','8-13','13-6',
  '12-8','8-2','2-6','6-12'
]);

function Cell({ r, c, highlight }) {
  const inTop = r < 6;
  const inBottom = r >= GRID_SIZE - 6;
  const inLeft = c < 6;
  const inRight = c >= GRID_SIZE - 6;
  const isCenterBlock = r >= 6 && r <= 8 && c >= 6 && c <= 8;

  let className = 'cell';

  const isGreenEntry = r === 6 && c === 1;
  const isYellowEntry = r === 1 && c === 8;
  const isBlueEntry = r === 8 && c === 13;
  const isRedEntry = r === 13 && c === 6;

  // NOTE: path color rotation applied here (v1.0)
  // Top path -> Yellow, Right -> Blue, Bottom -> Red, Left -> Green
  if (isCenterBlock) {
    className += ' center-block';
  } else if (inTop && inLeft) {
    className += ' home green-home';
  } else if (inTop && inRight) {
    className += ' home yellow-home';
  } else if (inBottom && inRight) {
    className += ' home blue-home';
  } else if (inBottom && inLeft) {
    className += ' home red-home';
  } else if (c === CENTER && r < CENTER && !(r === 0 && c === 7)) {
    className += ' path yellow-path'; // top vertical now yellow
  } else if (r === CENTER && c > CENTER && !(r === 7 && c === 14)) {
    className += ' path blue-path'; // right horizontal now blue
  } else if (c === CENTER && r > CENTER && !(r === 14 && c === 7)) {
    className += ' path red-path'; // bottom vertical now red
  } else if (r === CENTER && c < CENTER && !(r === 7 && c === 0)) {
    className += ' path green-path'; // left horizontal now green
  } else if (isGreenEntry) {
    className += ' path green-path';
  } else if (isYellowEntry) {
    className += ' path yellow-path';
  } else if (isBlueEntry) {
    className += ' path blue-path';
  } else if (isRedEntry) {
    className += ' path red-path';
  }

  if (highlight) {
    className += ' cell-highlight';
  }

  const isSafeStar = safeStarCoords.has(`${r}-${c}`);

  let arrow = null;
  if (r === 7 && c === 14) {
    arrow = <div className="arrow arrow-left blue">⟵</div>;
  } else if (r === 14 && c === 7) {
    arrow = <div className="arrow arrow-up red">⟵</div>;
  } else if (r === 7 && c === 0) {
    arrow = <div className="arrow arrow-right green">⟵</div>;
  } else if (r === 0 && c === 7) {
    arrow = <div className="arrow arrow-down yellow">⟵</div>;
  }

  return (
    <div
      className={className}
      data-row={r}
      data-col={c}
      role="gridcell"
      aria-label={`Cell ${r + 1},${c + 1}`}
    >
      {isSafeStar && <div className="safe-star" aria-label="Safe Star" />}
      {arrow}
    </div>
  );
}

function Token({ color, number, isMovable, onClick, style, animate }) {
  // SVG Ludo piece
  const pieceColor = {
    red: '#e63946',
    green: '#39a56a',
    yellow: '#f3a712',
    blue: '#2f80ed',
  }[color.toLowerCase()] || '#888';
  const textColor = color.toLowerCase() === 'yellow' ? '#222' : '#fff';
  return (
    <div
      className={`token token-${color.toLowerCase()} ${isMovable ? 'movable' : ''} ${animate ? 'token-animate' : ''}`}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={isMovable ? 0 : -1}
      aria-label={`Token ${color} ${number}${isMovable ? ' (movable)' : ''}`}
      onKeyDown={isMovable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <svg width="100%" height="100%" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill={pieceColor} stroke="#222" strokeWidth="2" />
        <circle cx="20" cy="15" r="6" fill="#fff" fillOpacity="0.18" />
        <circle cx="20" cy="20" r="10" fill="#fff" fillOpacity="0.08" />
      </svg>
      <span className="token-label" style={{ color: textColor }}>{color[0].toUpperCase()}{number}</span>
    </div>
  );
}

function TokensOnCell({ tokens, moveToken }) {
  const { row, col } = cellInfos[tokens[0].position];
  const count = tokens.length;

  let tokenStyle;
  if (count <= 1) {
    tokenStyle = { width: '80%', height: '80%' };
  } else {
    const columns = count <= 4 ? 2 : Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);
    tokenStyle = {
      width: `${100 / columns}%`,
      height: `${100 / rows}%`,
    };
  }

  return (
    <div 
      className="tokens-on-cell"
      style={{ gridRow: row + 1, gridColumn: col + 1 }}
    >
      {tokens.map(({ color, number, possibleMove }) => (
        <Token
          key={`${color}-${number}`}
          color={color}
          number={number}
          isMovable={!!possibleMove}
          onClick={() => possibleMove && moveToken(possibleMove)}
          style={tokenStyle}
          animate={!!possibleMove}
        />
      ))}
    </div>
  );
}

function TokensInHome({ color, tokens, possibleMove, moveToken }) {
  return (
    <div className="tokens-grid" aria-hidden="true">
      {tokens.map((n) => {
        const isMovable = possibleMove && possibleMove.tokenNumber === n;
        const handleClick = () => {
          if (isMovable) {
            moveToken(possibleMove);
          }
        };
        return (
          <div 
            key={n} 
            className={`token token-${color.toLowerCase()} ${isMovable ? 'movable token-animate' : ''}`}
            onClick={handleClick}
          >
            <span className="token-label">{color[0].toUpperCase()}{n}</span>
          </div>
        )
      })}
    </div>
  );
}

export default function Board({ tokenPositions, currentPlayer, diceValue, possibleMoves, moveToken, showGrid, lockedHighlightCell }) {
  // Highlight all locked cells if present (array), else none
  let highlightCells;
  if (Array.isArray(lockedHighlightCell) && lockedHighlightCell.length > 0) {
    highlightCells = new Set(lockedHighlightCell.map(id => {
      const { row, col } = cellInfos[id];
      return `${row}-${col}`;
    }));
  } else if (lockedHighlightCell && typeof lockedHighlightCell === 'string' && lockedHighlightCell !== 'finished') {
    const { row, col } = cellInfos[lockedHighlightCell];
    highlightCells = new Set([`${row}-${col}`]);
  } else {
    highlightCells = new Set();
  }

  const grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const highlight = highlightCells.has(`${r}-${c}`);
      grid.push(<Cell key={`${r}-${c}`} r={r} c={c} highlight={highlight} />);
    }
  }

  const cellOccupants = {};
  for (const color in tokenPositions) {
    for (const number in tokenPositions[color]) {
      const positionId = tokenPositions[color][number];
      if (positionId !== 'home' && positionId !== 'finished') {
        const { row, col } = cellInfos[positionId];
        const coordKey = `${row}-${col}`;

        if (!cellOccupants[coordKey]) {
          cellOccupants[coordKey] = [];
        }
        
        cellOccupants[coordKey].push({
          color,
          number,
          position: positionId,
          possibleMove: possibleMoves.find(move => move.tokenNumber === number && move.color === color)
        });
      }
    }
  }

  const homeMoveFor = (color) => {
    return possibleMoves.find(move => move.color === color && tokenPositions[color][move.tokenNumber] === 'home');
  }

  return (
    <div className="board-wrap">
      <div className={`board ${showGrid ? 'show-grid' : ''}`}>
        {grid}

        <div className="tokens-container">
          {Object.keys(cellOccupants).map(coordKey => (
            <TokensOnCell 
              key={coordKey}
              tokens={cellOccupants[coordKey]}
              moveToken={moveToken}
            />
          ))}
        </div>

        {/* Centered home tokens in corners */}
        <div className="home-tokens home-green"><TokensInHome color="Green" tokens={Object.keys(tokenPositions.green).filter(n => tokenPositions.green[n] === 'home')} possibleMove={homeMoveFor('green')} moveToken={moveToken} /></div>
        <div className="home-tokens home-yellow"><TokensInHome color="Yellow" tokens={Object.keys(tokenPositions.yellow).filter(n => tokenPositions.yellow[n] === 'home')} possibleMove={homeMoveFor('yellow')} moveToken={moveToken} /></div>
        <div className="home-tokens home-blue"><TokensInHome color="Blue" tokens={Object.keys(tokenPositions.blue).filter(n => tokenPositions.blue[n] === 'home')} possibleMove={homeMoveFor('blue')} moveToken={moveToken} /></div>
        <div className="home-tokens home-red"><TokensInHome color="Red" tokens={Object.keys(tokenPositions.red).filter(n => tokenPositions.red[n] === 'home')} possibleMove={homeMoveFor('red')} moveToken={moveToken} /></div>

        {/* Center star (triangles colored to match attached paths) */}
        <div className="center-star" aria-hidden="true">
          <div className="triangle top" />
          <div className="triangle right" />
          <div className="triangle bottom" />
          <div className="triangle left" />
        </div>

        {/* Floating debug toggle */}
      </div>
    </div>
  );
}
