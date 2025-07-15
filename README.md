
# Checkers Game

![Checkers](https://img.shields.io/badge/Checkers-Game-brightgreen)

## Description
Checkers Game is a web-based multiplayer game built with HTML, CSS, JavaScript, and Socket.IO for real-time communication. Players can join game rooms, make moves on the board, and compete with each other in a classic checkers game.

## Features
- **Multiplayer**: Play against other users in real-time.
- **Room Management**: Create and join game rooms.
- **Piece Movement**: Move pieces on the checkers board and capture opponent's pieces.
- **Color Assignment**: Players are assigned a color (black or white) upon joining a room.
- **Responsive Design**: The game is fully responsive and works on both desktop and mobile devices.

## Technologies Used
- **HTML**: Markup structure of the game.
- **CSS**: Styling for the game board and pieces, including animations.
- **JavaScript**: Handles game logic, including piece movement and socket communication.
- **Socket.IO**: Enables real-time communication between the server and the clients for multiplayer functionality.

## Setup Instructions
To run the game on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/21Ravan12/My-online-checkers-incomplete.git
   cd My-online-checkers-incomplete
   ```

2. **Install dependencies**:
   Ensure you have [Node.js](https://nodejs.org/) installed. Run the following command in the project directory:
   ```bash
   npm install
   ```

3. **Run the server:**
   Start the server using the following command:
   ```bash
   node server.js
   ```

   This will start the server on port 3002 by default.

4. **Open the game in your browser**:
   Visit `http://localhost:3002` in your browser to play the game.

## How to Play
1. **Join a Room**: Click on the room to join, or create a new room.
2. **Make a Move**: Once in the game, click on a piece and select where to move it. Your opponent will make their move after you.
3. **Capture Pieces**: If you land on an opponent's piece, it will be captured and removed from the board.
4. **Win the Game**: The game ends when a player captures all of the opponent's pieces or blocks them from making a valid move.

## Event Listeners
- **joinRoom**: Allows the player to join a game room with a specified color.
- **move**: Sends a player's move to the server.
- **gameStart**: Starts the game once both players are ready.
- **playerCount**: Updates the player count in the room.
- **yourColor**: Sends the player's assigned color (black or white).
- **roomsList**: Displays the list of active rooms available to join.

## Development
Feel free to fork the project and make contributions. If you'd like to add features or fix bugs, submit a pull request, and I'll review it.

## License
This project is open-source and available under the [MIT License](LICENSE).
