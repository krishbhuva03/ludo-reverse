# Ludo Reverse Game

This is a classic Ludo board game implemented in React, with a fun twist! This project was built as a web-based application, allowing users to play against each other in a local multiplayer setting.

## Features

*   **Classic Ludo Gameplay:** Supports 2-4 players, each with four tokens.
*   **Reverse Mode:** Players have a limited ability to move their tokens backward, adding a strategic layer to the game.
*   **Interactive UI:** A visually appealing and interactive game board with animations for token movement.
*   **Player Customization:** Players can set their names before the game starts.
*   **Manual Dice Control:** A feature for testing and development that allows manually setting the dice value.
*   **Winner Detection:** The game automatically detects when a player has won and displays a winning message.

## How to Play

1.  **Setup:**
    *   Choose the number of players (2, 3, or 4).
    *   Enter the names for each player.
    *   Click "Start Game".

2.  **Gameplay:**
    *   Players take turns rolling the dice.
    *   To move a token out of the home base, a player must roll a 6.
    *   Tokens move around the board according to the dice value.
    *   If a player's token lands on a square occupied by an opponent's token, the opponent's token is sent back to their home base.
    *   Landing on a star is a "safe" spot where tokens cannot be captured.

3.  **Reverse Mode:**
    *   Each player has a limited number of "reverse" moves.
    *   After rolling the dice, a player can choose to toggle "Reverse Game" to move their token backward by the rolled dice value.

4.  **Winning:**
    *   To win the game, a player must move all four of their tokens into their home column.
    *   The first player to get all four tokens to the end is the winner.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine. You can download them from [https://nodejs.org/](https://nodejs.org/).

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/your-username/ludo-game.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd ludo-game
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Running the Application

To run the app in development mode, use the following command. This will open the app in your default browser at `http://localhost:3000`.

```sh
npm start
```

## Available Scripts

In the project directory, you can run:

*   `npm start`: Runs the app in the development mode.
*   `npm test`: Launches the test runner in the interactive watch mode.
*   `npm run build`: Builds the app for production to the `build` folder.
*   `npm run eject`: This is a one-way operation. Once you `eject`, you can’t go back! It will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them.


## Try it out at 

* https://ludo-reverse-jk.netlify.app

