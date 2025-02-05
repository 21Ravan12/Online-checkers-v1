        const socket = io("");
        let activeRooms = [];
        let activeRoomId = null;
    
        function debugInfo(message, data) {
            console.log(`[DEBUG] ${message}:`, data);
        }
    
        function joinGame(roomId, color) {
            if (!roomId || !color) {
                console.error("[ERROR] Oda ID veya renk eksik!");
                return;
            }

            activeRoomId = roomId;
            debugInfo("Sending joinRoom event for room", { roomId, color });
            socket.emit("joinRoom", { roomId, color });
            return true;
        }
    
        function getRoomList() {
            debugInfo("Requesting room list", {});
            socket.emit("getRooms");
        }
    
        function getColor() {
            socket.emit("getColor",selectedRoomId);
            
        }

        socket.on("yourColor", (color) => {
            debugInfo("Assigned color", color);
            yourColor=color;
        });

        socket.on("assignColor", (color) => {
            debugInfo("Assigned color", color);

        });
    
        socket.on("error", (message) => {
            console.error(`[ERROR] ${message}`);
        });
    
        // Rakibin hamlesini dinle
        socket.on("move", (move) => {
            if (move && move.from && move.to) {
                debugInfo("Opponent move received", move);
                handleOpponentMove(move.from.row, move.from.col, move.to.row, move.to.col);
            } else {
                console.error("[ERROR] Invalid move data received", move);
            }
        });
    
        socket.on("roomsList", (roomInfo) => {
            activeRooms = roomInfo;
            debugInfo(activeRooms);
            updateGameListUI(); 
        });
    
        socket.on("gameStart", () => {
            debugInfo("Game started", {});
        });
    
        socket.on("playerCount", (count) => {
            debugInfo("Player count updated", count);
        });
    
        // Taş hareketini gönder
        function movePieceSocket(fromRow, fromCol, toRow, toCol) {
            if (!activeRoomId) {
                console.error("[ERROR] Oyun odası seçilmemiş!");
                return;
            }
            const moveData = { roomId: activeRoomId, from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
            debugInfo("Sending move data", moveData);
            socket.emit("move", moveData);
        }
