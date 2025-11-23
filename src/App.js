import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import Board from './Board';
import ControlPanel from './ControlPanel';
import SetupScreen from './SetupScreen';
import { initialPositions, playerColors, getPossibleMoves } from './game';
import { cellInfos } from './path';


function getWinner(tokenPositions, playerNames) {
  for (const color in tokenPositions) {
    const allFinished = Object.values(tokenPositions[color]).every(pos => pos === 'finished');
    if (allFinished) {
      // Find player number by color
      const playerNum = Object.entries(playerColors).find(([num, c]) => c === color);
      if (playerNum) return playerNames[playerNum[0]];
    }
  }
  return null;
}


function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState({});

  const [tokenPositions, setTokenPositions] = useState(initialPositions);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [isReverseMode, setIsReverseMode] = useState(false);
  const [showReverseToggle, setShowReverseToggle] = useState(false);
  const [manualDiceValue, setManualDiceValue] = useState('');
  const [showGrid, setShowGrid] = useState(false);
  // Store the static highlight cell for the last selected move
  const [playerStats, setPlayerStats] = useState({});
  const [lockedHighlightCell, setLockedHighlightCell] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your game progress will be lost.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleStartGame = (e) => {
    e.preventDefault();
    const newPlayerNames = { ...playerNames };
    const newPlayerStats = {};
    for (let i = 1; i <= numPlayers; i++) {
      if (!newPlayerNames[i] || newPlayerNames[i].trim() === '') {
        newPlayerNames[i] = `Player ${i}`;
      }
      newPlayerStats[i] = { reverseCount: 10 };
    }
    setPlayerNames(newPlayerNames);
    setPlayerStats(newPlayerStats);
    setGameStarted(true);
  };

  // Helper to check if a player is a winner (all tokens at final cell)
  function isPlayerWinner(playerNum) {
    const color = playerColors[playerNum];
    const finalCells = {
      red: 'rh6',
      green: 'gh6',
      yellow: 'yh6',
      blue: 'bh6',
    };
    return Object.values(tokenPositions[color]).every(pos => pos === finalCells[color]);
  }

  // Next player logic: skip winners
  const nextPlayer = () => {
    let next = currentPlayer;
    for (let i = 0; i < numPlayers; i++) {
      next = (next % numPlayers) + 1;
      if (!isPlayerWinner(next)) {
        setCurrentPlayer(next);
        return;
      }
    }
    // If all players are winners, keep current
    setCurrentPlayer(currentPlayer);
  };

  React.useEffect(() => {
    // Only update highlight if not already locked for an active move
    if (lockedHighlightCell !== null) return;
    if (diceValue) {
      const moves = getPossibleMoves(currentPlayer, diceValue, tokenPositions, isReverseMode, playerStats);
      const landingCells = moves.map(move => move.newPositionId).filter(id => id && id !== 'finished');
      if (landingCells.length > 0) {
        setLockedHighlightCell(landingCells);
      } else {
        setLockedHighlightCell(null);
      }
    } else {
      setLockedHighlightCell(null);
    }
  }, [diceValue, isReverseMode, tokenPositions, numPlayers, currentPlayer, lockedHighlightCell, playerStats]);

  const handleManualDiceRoll = (value) => {
    setManualDiceValue(value);
    rollDice();
  };

  const rollDice = () => {
    setRolling(true);
    setTimeout(() => {
      const manualValue = parseInt(manualDiceValue, 10);
      const value = (!isNaN(manualValue) && manualValue > 0)
        ? manualValue
        : Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setRolling(false);

      // Show reverse toggle after dice roll
      setShowReverseToggle(true);

      // Calculate possible moves for the current player
      const moves = getPossibleMoves(currentPlayer, value, tokenPositions, isReverseMode, playerStats);
      setPossibleMoves(moves);

      // If no moves and dice is not 6, immediately advance to next player
      if (moves.length === 0 && value !== 6) {
        setTimeout(() => {
          setDiceValue(null);
          setManualDiceValue('');
          setPossibleMoves([]);
          setShowReverseToggle(false);
          nextPlayer();
        }, 700); // short delay so user can see dice result
      }
    }, 500);
  };

  const resetGame = () => {
    if (window.confirm('This action will lead to losing the current game. Are you sure you want to continue?')) {
      setTokenPositions(initialPositions);
      setCurrentPlayer(1);
      setDiceValue(null);
      setRolling(false);
      setPossibleMoves([]);
      setIsReverseMode(false);
      setManualDiceValue('');
      setGameStarted(false);
    }
  };

  const moveToken = async (possibleMove) => {
    // Lock the highlight to the landing cell for the entire move (array for consistency)
    if (possibleMove.newPositionId && possibleMove.newPositionId !== 'finished') {
      setLockedHighlightCell([possibleMove.newPositionId]);
    } else {
      setLockedHighlightCell(null);
    }
    const { tokenNumber, newPositionId, color, captured } = possibleMove;
    const originalPositionId = tokenPositions[color][tokenNumber];
    let aCaptureOccurred = false;

    setShowReverseToggle(false); // Hide reverse toggle after move
    setIsReverseMode(false); // Reset reverse mode to forward after move

    if (isReverseMode) {
      const newPlayerStats = { ...playerStats };
      newPlayerStats[currentPlayer].reverseCount -= 1;
      setPlayerStats(newPlayerStats);
    }

    // If moving from home or to finished, no animation needed
    if (originalPositionId === 'home' || newPositionId === 'finished') {
      const newPositions = { ...tokenPositions };
      newPositions[color][tokenNumber] = newPositionId;
      if (captured) {
        newPositions[captured.color][captured.number] = 'home';
        aCaptureOccurred = true;
      }
      setTokenPositions(newPositions);
      setPossibleMoves([]);
      setTimeout(() => setLockedHighlightCell(null), 200); // Clear highlight after move completes

      // Extra turn logic: check if token landed on its final cell
      const finalCells = {
        red: 'rh6',
        green: 'gh6',
        yellow: 'yh6',
        blue: 'bh6',
      };
      let extraTurns = 0;
      if (newPositionId === finalCells[color]) {
        extraTurns += 1;
      }
      if (diceValue === 6) {
        extraTurns += 1;
      }
      // If a capture occurred, do not skip turn (original logic)
      if (extraTurns > 0 && !aCaptureOccurred) {
        // Stay on current player for extra turn(s)
        // If both conditions, player gets two turns in a row
        // (Handled by not calling nextPlayer, so currentPlayer remains the same)
        // If you want to show a message for double turn, you can add it here
      } else if (!aCaptureOccurred && newPositionId !== 'finished') {
        nextPlayer();
      }
      setDiceValue(null);
      setManualDiceValue('');
      return;
    }

    // Animate step-by-step movement
    const { paths } = require('./game');
    const path = paths[color];
    const startIdx = path.indexOf(originalPositionId);
    const endIdx = path.indexOf(newPositionId);
    const step = endIdx > startIdx ? 1 : -1;
    const steps = [];
    for (let i = startIdx + step; step > 0 ? i <= endIdx : i >= endIdx; i += step) {
      steps.push(path[i]);
    }

    let currentPositions = { ...tokenPositions };
    for (let i = 0; i < steps.length; i++) {
      const tempPositions = JSON.parse(JSON.stringify(currentPositions));
      tempPositions[color][tokenNumber] = steps[i];
      setTokenPositions(tempPositions);
      currentPositions = tempPositions;
      // Wait for 180ms between steps
      // eslint-disable-next-line no-loop-func
      await new Promise(res => setTimeout(res, 180));
    }

    // After animation, handle capture/block logic as before
    const newPositions = { ...currentPositions };
    // Block/capture logic
    const { row, col } = cellInfos[newPositionId];
    const tokensAtDest = [];
    for (const c in tokenPositions) {
      for (const n in tokenPositions[c]) {
        const posId = newPositions[c][n];
        if (posId !== 'home' && posId !== 'finished') {
          const currentCoords = cellInfos[posId];
          if (currentCoords.row === row && currentCoords.col === col) {
            tokensAtDest.push({ color: c, number: n });
          }
        }
      }
    }
    const myColorTokensAtDest = tokensAtDest.filter(t => t.color === color);
    if (myColorTokensAtDest.length === 2) {
      tokensAtDest.forEach(token => {
        if (token.color !== color) {
          newPositions[token.color][token.number] = 'home';
          aCaptureOccurred = true;
        }
      });
    }
    newPositions[color][tokenNumber] = newPositionId;
    if (captured) {
      newPositions[captured.color][captured.number] = 'home';
      aCaptureOccurred = true;
    }
    setTokenPositions(newPositions);
    setPossibleMoves([]);
    setTimeout(() => setLockedHighlightCell(null), 200); // Clear highlight after move completes

    // Extra turn logic for animated moves
    const finalCells = {
      red: 'rh6',
      green: 'gh6',
      yellow: 'yh6',
      blue: 'bh6',
    };
    let extraTurns = 0;
    if (newPositionId === finalCells[color]) {
      extraTurns += 1;
    }
    if (diceValue === 6) {
      extraTurns += 1;
    }
    if (extraTurns > 0 && !aCaptureOccurred) {
      // Stay on current player for extra turn(s)
    } else if (!aCaptureOccurred && newPositionId !== 'finished') {
      nextPlayer();
    }
    setDiceValue(null);
    setManualDiceValue('');
  };

  const winner = getWinner(tokenPositions, playerNames);

  if (!gameStarted) {
    return (
      <SetupScreen
        numPlayers={numPlayers}
        setNumPlayers={setNumPlayers}
        playerNames={playerNames}
        setPlayerNames={setPlayerNames}
        handleStartGame={handleStartGame}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="board-area">
        <Board 
          tokenPositions={tokenPositions}
          possibleMoves={possibleMoves}
          moveToken={moveToken}
          showGrid={showGrid}
          lockedHighlightCell={lockedHighlightCell}
        />
      </div>
      <ControlPanel
        currentPlayer={currentPlayer}
        playerNames={playerNames}
        playerStats={playerStats}
        diceValue={diceValue}
        rolling={rolling}
        isReverseMode={isReverseMode}
        setIsReverseMode={(val) => {
          setIsReverseMode(val);
          // Update possible moves and highlight for the current direction
          if (diceValue) {
            const moves = getPossibleMoves(currentPlayer, diceValue, tokenPositions, val, playerStats);
            setPossibleMoves(moves);
            const landingCells = moves.map(move => move.newPositionId).filter(id => id && id !== 'finished');
            setLockedHighlightCell(landingCells.length > 0 ? landingCells : null);
          }
        }}
        manualDiceValue={manualDiceValue}
        setManualDiceValue={setManualDiceValue}
        rollDice={rollDice}
        resetGame={resetGame}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        setDiceManually={handleManualDiceRoll}
        winner={winner}
        numPlayers={numPlayers}
        showReverseToggle={showReverseToggle}
        possibleMoves={possibleMoves}
      />
    </div>
  );
}

export default App;
