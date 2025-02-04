const socket = io("http://192.168.1.102:3002");
let roomId = "room1"; // Varsayılan oda

function debugInfo(message, data) {
    console.log(`[DEBUG] ${message}:`, data);
}

function joinGame() {
    debugInfo("Sending joinRoom event for room", roomId);
    socket.emit("joinRoom", roomId);
}

// Rakibin hamlesini dinle
socket.on("move", (move) => {
    debugInfo("Opponent move received", move);

    if (move && move.from && move.to) {  // Hata kontrolü eklendi
        debugInfo("Handling opponent move from", move.from, "to", move.to);
        handleOpponentMove(move.from.row, move.from.col, move.to.row, move.to.col);
    } else {
        console.error("[ERROR] Invalid move data received", move);
    }
});

socket.on("gameStart", () => {
    debugInfo("Game start event received", {});
});

socket.on("playerCount", (count) => {
    debugInfo("Player count updated", count);
});

// Taş hareketini gönder
function movePieceSocket(fromRow, fromCol, toRow, toCol) {
    const moveData = { roomId, from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
    debugInfo("Sending move data", moveData);
    socket.emit("move", moveData);
}

joinGame();