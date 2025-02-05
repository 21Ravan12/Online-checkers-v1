const socket = io("");
let activeRooms = [];
let activeRoomId = null;

// Function to log debug information
function debugInfo(message, data) {
    console.log(`[DEBUG] ${message}:`, data);
}

// Function to join a game room with a specified color
function joinGame(roomId, color) {
    if (!roomId || !color) {
        console.error("[ERROR] Room ID or color is missing!");
        return;
    }

    activeRoomId = roomId;
    debugInfo("Sending joinRoom event for room", { roomId, color });
    socket.emit("joinRoom", { roomId, color });
    return true;
}

function leaveRoom() {
    socket.emit("leaveRoom");
}

// Function to request the list of available rooms
function getRoomList() {
    debugInfo("Requesting room list", {});
    socket.emit("getRooms");
}

// Function to request assigned color for the player
function getColor() {
    socket.emit("getColor", selectedRoomId);
}

// Event listener for receiving assigned color from the server
socket.on("yourColor", (color) => {
    debugInfo("Assigned color", color);
    yourColor = color;
});

// Event listener for color assignment
socket.on("assignColor", (color) => {
    debugInfo("Assigned color", color);
});

// Event listener for errors received from the server
socket.on("error", (message) => {
    console.error(`[ERROR] ${message}`);
});

// Event listener for receiving the opponent's move
socket.on("move", (move) => {
    if (move && move.from && move.to) {
        debugInfo("Opponent move received", move);
        handleOpponentMove(move.from.row, move.from.col, move.to.row, move.to.col);
    } else {
        console.error("[ERROR] Invalid move data received", move);
    }
});

// Event listener for receiving the list of available rooms
socket.on("roomsList", (roomInfo) => {
    activeRooms = roomInfo;
    debugInfo("Updated room list", activeRooms);
    updateGameListUI(); 
});

// Event listener for when the game starts
socket.on("gameStart", () => {
    debugInfo("Game started", {});
});

// Event listener for updating the player count
socket.on("playerCount", (count) => {
    debugInfo("Player count updated", count);
});

// Function to send a move action to the server
function movePieceSocket(fromRow, fromCol, toRow, toCol) {
    if (!activeRoomId) {
        console.error("[ERROR] No game room selected!");
        return;
    }
    const moveData = { roomId: activeRoomId, from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
    debugInfo("Sending move data", moveData);
    socket.emit("move", moveData);
}
