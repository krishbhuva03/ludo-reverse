import React from 'react';
import Dice from './Dice';
import './ControlPanel.css';


const playerColorMap = {
  1: 'red',
  2: 'green',
  3: 'yellow',
  4: 'blue',
};

function PlayerAvatar({ color, name, isCurrent, isWinner, reverseCount }) {
  // Set text color to dark for yellow, white otherwise
  const textColor = color === 'yellow' ? '#222' : '#fff';
  return (
    <div className="player-avatar-container">
      <div
        className="player-avatar"
        style={{
          background: color,
          border: isCurrent ? '3px solid #2f80ed' : '2px solid #fff',
          boxShadow: isWinner ? '0 0 0 4px #ffe066' : undefined,
          opacity: isWinner ? 1 : isCurrent ? 1 : 0.7,
        }}
        title={name}
        aria-label={isWinner ? `${name} (Winner)` : isCurrent ? `${name} (Current Turn)` : name}
      >
        <span className="player-avatar-label" style={{ color: textColor }}>{name[0]}</span>
      </div>
      <div className="player-reverse-count">{reverseCount}</div>
    </div>
  );
}

const ControlPanel = ({
  currentPlayer,
  playerNames,
  playerStats,
  diceValue,
  rolling,
  isReverseMode,
  setIsReverseMode,
  manualDiceValue,
  setManualDiceValue,
  rollDice,
  resetGame,
  showGrid,
  setShowGrid,
  setDiceManually,
  winner,
  numPlayers,
  showReverseToggle,
  possibleMoves,
}) => {
  const currentPlayerName = playerNames[currentPlayer];
  const currentPlayerColor = playerColorMap[currentPlayer];
  const reverseCount = playerStats[currentPlayer]?.reverseCount;

  return (
    <div className="control-panel-wrapper">
      <div className="control-panel">
        <div className="player-status-bar">
          {[1,2,3,4].slice(0, numPlayers).map((i) => (
            <PlayerAvatar
              key={i}
              color={playerColorMap[i]}
              name={playerNames[i]}
              isCurrent={currentPlayer === i}
              isWinner={winner === playerNames[i]}
              reverseCount={playerStats[i]?.reverseCount}
            />
          ))}
        </div>
        <div className="player-turn-indicator" aria-live="polite">
          {winner ? (
            <h2 style={{ color: '#ffe066' }}>{winner} Wins!</h2>
          ) : (
            <h2 style={{ color: currentPlayerColor }}>{`${currentPlayerName}'s Turn`}</h2>
          )}
        </div>

        <div className="dice-display-area">
          <Dice value={diceValue} rolling={rolling} color={currentPlayerColor} onClick={rollDice} disabled={rolling || !!winner || (diceValue && possibleMoves && possibleMoves.length > 0)} />
        </div>

        <div className="toggles-section">
          <label className="toggle-label" aria-label="Toggle Reverse Game">
            <input
              type="checkbox"
              checked={isReverseMode}
              onChange={() => setIsReverseMode(!isReverseMode)}
              aria-checked={isReverseMode}
              disabled={!diceValue || !!winner || reverseCount === 0}
            />
            <span className="slider"></span>
            Reverse Game ({reverseCount} left)
          </label>
        </div>

        <div className="manual-dice-section">
          <input
            type="number"
            value={manualDiceValue}
            onChange={(e) => setManualDiceValue(e.target.value)}
            className="manual-dice-input"
            placeholder="Manual"
            aria-label="Set dice manually"
            disabled={!!winner}
          />
          <button
            onClick={() => setDiceManually(manualDiceValue)}
            className="set-manual-dice-button"
            aria-label="Set manual dice value"
            disabled={!!winner}
          >
            Set
          </button>
        </div>

        <div className="game-actions-section">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset the game? All progress will be lost.')) {
                resetGame();
              }
            }}
            className="reset-game-button"
            aria-label="Reset Game"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
