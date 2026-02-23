import React from 'react';
import Dice from './Dice';
import './ControlPanel.css';

const playerColorMap = {
  1: 'red',
  2: 'green',
  3: 'yellow',
  4: 'blue',
};

const positionClassMap = {
  1: 'bottom-left', // Red
  2: 'top-left',    // Green
  3: 'top-right',   // Yellow
  4: 'bottom-right',// Blue
};

function PlayerCorner({ 
  positionClass, 
  color, 
  name, 
  isCurrent, 
  isWinner, 
  reverseCount, 
  // Dice props
  diceValue, 
  rolling, 
  rollDice, 
  possibleMoves,
  // Toggle props
  isReverseMode,
  setIsReverseMode,
  showReverseToggle
}) {
  const textColor = color === 'yellow' ? '#222' : '#fff';

  return (
    <div className={`player-corner ${positionClass} ${isCurrent ? 'is-current' : ''} ${isWinner ? 'is-winner' : ''} color-${color}`}>
      <div className="corner-hud-content">
        <div className="avatar-section">
          <div className="player-avatar" style={{ background: isWinner ? 'var(--color-secondary)' : color }}>
             <span className="player-avatar-label" style={{ color: textColor }}>{name[0].toUpperCase()}</span>
          </div>
          <div className="player-info">
             <div className="player-name">{name}</div>
             <div className="player-reverse-left">Reverse: {reverseCount}</div>
          </div>
        </div>

        {isWinner && <div className="winner-badge">WINNER</div>}

        {isCurrent && !isWinner && (
           <div className="active-player-controls">
              <div className="dice-container">
                 <Dice 
                   value={diceValue} 
                   rolling={rolling} 
                   color={color} 
                   onClick={rollDice} 
                   disabled={rolling || (diceValue && possibleMoves && possibleMoves.length > 0)} 
                 />
              </div>
              
              <div className="toggle-wrapper" style={{ minHeight: '30px' }}>
                {showReverseToggle && reverseCount > 0 && diceValue && (
                  <label className="toggle-label neon-toggle">
                    <input
                      type="checkbox"
                      checked={isReverseMode}
                      onChange={() => setIsReverseMode(!isReverseMode)}
                      disabled={!diceValue || reverseCount === 0}
                    />
                    <span className="slider"></span>
                    Reverse
                  </label>
                )}
              </div>
           </div>
        )}
      </div>
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
  setDiceManually,
  winner,
  numPlayers,
  showReverseToggle,
  possibleMoves,
  isMuted,
  setIsMuted
}) => {
  return (
    <div className="control-panel-wrapper">
      {/* Sound Control Toggle */}
      <button 
        className="mute-btn"
        onClick={() => setIsMuted(!isMuted)}
        title={isMuted ? "Unmute Sound" : "Mute Sound"}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Render 4 corners */}
      {[1, 2, 3, 4].slice(0, numPlayers).map((i) => (
        <PlayerCorner
          key={i}
          positionClass={positionClassMap[i]}
          color={playerColorMap[i]}
          name={playerNames[i]}
          isCurrent={currentPlayer === i}
          isWinner={winner === playerNames[i]}
          reverseCount={playerStats[i]?.reverseCount}
          
          diceValue={diceValue}
          rolling={rolling}
          rollDice={rollDice}
          possibleMoves={possibleMoves}
          
          isReverseMode={isReverseMode}
          setIsReverseMode={setIsReverseMode}
          showReverseToggle={showReverseToggle}
        />
      ))}

    </div>
  );
};

export default ControlPanel;
