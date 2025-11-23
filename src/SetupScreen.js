import React from 'react';
import './SetupScreen.css';


// List of random names for prefill
const RANDOM_NAMES = [
  "Tiger", "Lion", "Eagle", "Panther", "Wolf", "Falcon", "Bear", "Shark", "Cobra", "Jaguar",
  "Hawk", "Rhino", "Fox", "Otter", "Moose", "Puma", "Viper", "Crane", "Bison", "Orca"
];

function getRandomName(existingNames = []) {
  // Pick a random name not already used
  const available = RANDOM_NAMES.filter(n => !existingNames.includes(n));
  if (available.length === 0) return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  return available[Math.floor(Math.random() * available.length)];
}

const SetupScreen = ({
  numPlayers,
  setNumPlayers,
  playerNames,
  setPlayerNames,
  handleStartGame,
}) => {
  // Prefill playerNames with random names if not set
  React.useEffect(() => {
    const newNames = { ...playerNames };
    const usedNames = Object.values(playerNames).filter(Boolean);
    let changed = false;
    for (let i = 1; i <= numPlayers; i++) {
      if (!newNames[i] || newNames[i].trim() === '') {
        newNames[i] = getRandomName(usedNames.concat(Object.values(newNames)));
        changed = true;
      }
    }
    if (changed) setPlayerNames(newNames);
    // eslint-disable-next-line
  }, [numPlayers]);

  const isStartDisabled = () => {
    for (let i = 1; i <= numPlayers; i++) {
      if (!playerNames[i] || playerNames[i].trim() === '') {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-title">
          <span role="img" aria-label="Ludo Icon" className="ludo-icon">🎲</span>
          <h3>Ludo Reverse</h3>
        </div>
        <p className="setup-subtitle">
          Set up your game and get ready to roll!
        </p>

        <form onSubmit={handleStartGame} className="setup-form">
          <div className="form-section">
            <h2 className="form-section-title">How Many Players?</h2>
            <div className="player-count-selector">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`player-count-button ${numPlayers === count ? 'active' : ''}`}
                  onClick={() => setNumPlayers(count)}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Player Names</h2>
            <div className="player-inputs">
              {Array.from({ length: numPlayers }, (_, i) => i + 1).map((playerNum) => (
                <div key={playerNum} className="player-input-group">
                  <div className={`player-avatar player-${playerNum}`}>{playerNum}</div>
                  <input
                    id={`player${playerNum}`}
                    type="text"
                    placeholder={`Player ${playerNum}`}
                    value={playerNames[playerNum] || ''}
                    onChange={(e) =>
                      setPlayerNames({ ...playerNames, [playerNum]: e.target.value })
                    }
                    className="setup-input"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="start-game-button"
            disabled={isStartDisabled()}
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;
