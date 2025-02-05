let selectedPiece = null;
let currentPlayer = "white";
let whiteCapturedPieces = 0;
let blackCapturedPieces = 0;

// Check if the current player has any mandatory capture moves
function hasMandatoryCapture() {
    if (!currentPlayer) {
        console.error("Error: currentPlayer is not defined.");
        return false;
    }

    const pieces = document.querySelectorAll(`.${currentPlayer}-piece`);
    
    return Array.from(pieces).some(piece => {
        if (!piece.parentElement) {
            console.warn("Warning: A piece is missing its parent element.");
            return false;
        }

        const isQueen = piece.classList.contains("queen");

        // Ensure required capture functions are defined
        if (typeof hasMoreCaptures !== "function" || typeof hasMoreCapturesQueen !== "function") {
            console.error("Error: Required capture functions are missing.");
            return false;
        }

        // Determine if the piece has mandatory capture (Queen or regular piece)
        return isQueen ? hasMoreCapturesQueen(piece.parentElement) : hasMoreCaptures(piece.parentElement);
    });
}

// Handle the removal of captured pieces
function capturePiece(piece) {
    piece.remove();
    if (piece.classList.contains("white-piece")) {
        blackCapturedPieces++;
        debugInfo(`Black player captured a white piece. Total captured: ${blackCapturedPieces}`);
    } else if (piece.classList.contains("black-piece")) {
        whiteCapturedPieces++;
        debugInfo(`White player captured a black piece. Total captured: ${whiteCapturedPieces}`);
    }
    checkWinner();
}

// Check if there is a winner based on captured pieces
function checkWinner() {
    debugInfo(`Checking winner. White captured: ${whiteCapturedPieces}, Black captured: ${blackCapturedPieces}`);
    if (whiteCapturedPieces === 12) {
        alert("White player wins!");
        displayWinner("White");
        resetGame();
    } else if (blackCapturedPieces === 12) {
        alert("Black player wins!");
        displayWinner("Black");
        resetGame();
    }
}

// Display the winner's name on the screen
function displayWinner(winner) {
    const winnerDisplay = document.getElementById("winner-display");
    if (winnerDisplay) {
        winnerDisplay.textContent = `${winner} player wins!`;
    }
}

// Handle when a player clicks a square on the board
function handleSquareClick(event) {
    let square = event.target;
    let piece = square.querySelector(".white-piece, .black-piece");

    // If a piece is clicked, get its parent square
    if (square.classList.contains("white-piece") || square.classList.contains("black-piece")) {
        piece = square;
        square = piece.parentElement;
    }

    debugInfo(`Square clicked. Target is: ${square}, Piece: ${piece}`);

    // If the player selects their own piece
    if (piece && piece.classList.contains(`${currentPlayer}-piece`)) {
        if (selectedPiece) selectedPiece.classList.remove("selected");
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        debugInfo(`${currentPlayer} player selected a piece.`);
    } 
    // If the player deselects the selected piece
    else if (selectedPiece === piece) {
        selectedPiece.classList.remove("selected");
        selectedPiece = null;
        debugInfo("Selection cleared.");
    } 
    // If a move is attempted when a piece is selected
    else if (selectedPiece && !piece) {
        const selectedRow = parseInt(selectedPiece.parentElement.dataset.row);
        const selectedCol = parseInt(selectedPiece.parentElement.dataset.col);
        const targetRow = parseInt(square.dataset.row);
        const targetCol = parseInt(square.dataset.col);

        debugInfo(`Attempting move. Selected: (${selectedRow}, ${selectedCol}), Target: (${targetRow}, ${targetCol})`);

        // Block normal moves if the player must capture a piece
        if (hasMandatoryCapture() && !isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
            && !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol)) {
            debugInfo("You must capture a piece if possible!");
            return;
        }

        if (gameMode === 'offline') {
            // Handle Queen's move (can move multiple squares in any direction)
            if (selectedPiece.classList.contains("queen")) {
                if (
                    square.classList.contains("black-square") &&
                    isValidQueenMove(selectedRow, selectedCol, targetRow, targetCol) &&
                    !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) &&
                    !square.hasChildNodes()
                ) {
                    movePiece(square, true);
                } 
                // Handle Queen's capture
                else if (isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol)) {
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 
                // Invalid move
                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            } else {
                // Handle normal piece moves
                if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("white-piece") &&
                    targetRow - selectedRow === -1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    movePiece(square, true);
                } else if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("black-piece") &&
                    targetRow - selectedRow === 1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    movePiece(square, true);
                }
                // Handle capture (diagonal 2 squares)
                else if (
                    Math.abs(targetRow - selectedRow) === 2 &&
                    Math.abs(targetCol - selectedCol) === 2 &&
                    isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
                ) {
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 
                // Invalid move
                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            }
        } else if (gameMode === 'online') {
            // Handle online gameplay, Queen's move
            if (selectedPiece.classList.contains("queen")) {
                if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    isValidQueenMove(selectedRow, selectedCol, targetRow, targetCol) &&
                    !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) &&
                    !square.hasChildNodes()
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } 
                // Handle online Queen's capture
                else if (
                    isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) &&
                    selectedPiece.classList.contains(`${yourColor}-piece`)
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 
                // Invalid move
                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            } else {
                // Handle online normal piece moves
                if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("white-piece") &&
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    targetRow - selectedRow === -1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } else if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("black-piece") &&
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    targetRow - selectedRow === 1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } 
                // Handle online capture
                else if (
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    Math.abs(targetRow - selectedRow) === 2 &&
                    Math.abs(targetCol - selectedCol) === 2 &&
                    isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 
                // Invalid move
                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            }
        }
    }
    // If no piece is selected, move is attempted
    else {
        const selectedRow = parseInt(selectedPiece.parentElement.dataset.row);
        const selectedCol = parseInt(selectedPiece.parentElement.dataset.col);
        const targetRow = parseInt(square.dataset.row);
        const targetCol = parseInt(square.dataset.col);

        debugInfo(`Attempting move. Selected: (${selectedRow}, ${selectedCol}), Target: (${targetRow}, ${targetCol})`);

        // Block normal moves if the player must capture a piece
        if (hasMandatoryCapture() && !isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
            && !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol)) {
            debugInfo("You must capture a piece if possible!");
            return;
        }

        // Normal move (diagonal 1 square)
        if (
            square.classList.contains("black-square") &&
            !square.hasChildNodes()
        ) {
            movePiece(square, true);
        } 
        else {
            debugInfo("Invalid move.");
            clearSelection();
        }
    }
}
function handleOpponentMove(fromRow, fromCol, toRow, toCol) {
    // Select the source and target squares based on the given coordinates
    const square = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}']`);
    const squareTo = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
    const piece = square ? square.querySelector(".white-piece, .black-piece") : null;

    // If there is no piece in the source square, log an error and return
    if (!piece) {
        console.error("Invalid move: No piece at the source square.");
        return;
    }

    debugInfo(`Opponent move: (${fromRow}, ${fromCol}) -> (${toRow}, ${toCol})`);

    // If the selected piece is from the current player, allow it to be selected
    if (piece && piece.classList.contains(`${currentPlayer}-piece`)) {
        if (selectedPiece) selectedPiece.classList.remove("selected");
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        debugInfo(`${currentPlayer} player selected a piece.`);
    }

    // Handle Queen piece movement
    if (selectedPiece.classList.contains("queen")) {
        // Check if the move is valid for a Queen piece and it's not a capture move
        if (
            squareTo.classList.contains("black-square") &&
            isValidQueenMove(fromRow, fromCol, toRow, toCol) &&
            !isValidQueenCapture(fromRow, fromCol, toRow, toCol) &&
            !squareTo.hasChildNodes()
        ) {
            movePiece(squareTo, true); // Move the Queen piece
        } 
        // If it's a valid capture move
        else if (isValidQueenCapture(fromRow, fromCol, toRow, toCol)) {
            handleCapture(fromRow, fromCol, toRow, toCol, squareTo); // Handle capture
        } else {
            debugInfo("Invalid move.");
            clearSelection(); // Clear selection if the move is invalid
        }
    } else {
        // Handle normal piece movement (one diagonal square forward)
        if (
            squareTo.classList.contains("black-square") &&
            Math.abs(toRow - fromRow) === 1 &&
            Math.abs(toCol - fromCol) === 1 &&
            !squareTo.hasChildNodes()
        ) {
            movePiece(squareTo, true); // Move the piece
        } 
        // Handle capture (two diagonal squares forward)
        else if (
            Math.abs(toRow - fromRow) === 2 &&
            Math.abs(toCol - fromCol) === 2 &&
            isValidCapture(fromRow, fromCol, toRow, toCol)
        ) {
            handleCapture(fromRow, fromCol, toRow, toCol, squareTo); // Handle capture
        } else {
            debugInfo("Invalid move.");
            clearSelection(); // Clear selection if the move is invalid
        }
    }
}

// Check if the Queen's move is valid (diagonal, vertical, or horizontal)
function isValidQueenMove(selectedRow, selectedCol, targetRow, targetCol) {
    const rowDiff = Math.abs(targetRow - selectedRow);
    const colDiff = Math.abs(targetCol - selectedCol);
    return rowDiff === colDiff || targetRow === selectedRow || targetCol === selectedCol;
}

// Check if the Queen can capture an opponent's piece
function isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) {
    debugInfo(`Checking Queen capture from (${selectedRow}, ${selectedCol}) to (${targetRow}, ${targetCol})`);
    const rowDiff = targetRow - selectedRow;
    const colDiff = targetCol - selectedCol;
    if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false; // Not a valid diagonal move
    
    // Determine the direction of movement
    const rowDirection = rowDiff > 0 ? 1 : -1;
    const colDirection = colDiff > 0 ? 1 : -1;
    let currentRow = selectedRow + rowDirection;
    let currentCol = selectedCol + colDirection;
    let capturedPiece = null, middleSquare = null;

    // Check all squares in the path for a captured piece
    while (currentRow !== targetRow && currentCol !== targetCol) {
        const currentSquare = document.querySelector(`[data-row='${currentRow}'][data-col='${currentCol}']`);
        const currentPiece = currentSquare?.querySelector(".white-piece, .black-piece");
        if (currentPiece) {
            if (capturedPiece) return false; // Invalid if a second piece is encountered
            capturedPiece = currentPiece;
            middleSquare = currentSquare;
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }
    
    // Validate if the captured piece is an opponent's and the target square is empty
    const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);
    if (capturedPiece && targetSquare && !targetSquare.querySelector(".white-piece, .black-piece")) {
        return true; // Valid capture move
    }
    return false; // Invalid capture move
}

// Capture an opponent's piece by removing it from the board
function captureQueenPiece(capturedPiece) {
    capturedPiece.remove(); // Remove the captured piece
    if (capturedPiece.classList.contains("white-piece")) {
        blackCapturedPieces++; // Increment the count for black pieces captured
        debugInfo(`Black player captured a white piece. Total captured: ${blackCapturedPieces}`);
    } else if (capturedPiece.classList.contains("black-piece")) {
        whiteCapturedPieces++; // Increment the count for white pieces captured
        debugInfo(`White player captured a black piece. Total captured: ${whiteCapturedPieces}`);
    }
    checkWinner(); // Check if there's a winner
}

// Move a piece to the target square
function movePiece(targetSquare, switchTurn = true) {
    debugInfo(`Moving piece to square: ${targetSquare.dataset.row}, ${targetSquare.dataset.col}`);
    targetSquare.appendChild(selectedPiece); // Move the selected piece
    selectedPiece.classList.remove("selected");

    // Check for promotion to Queen if the piece reaches the last row
    const targetRow = parseInt(targetSquare.dataset.row);
    if (
        (currentPlayer === "white" && targetRow === 1) ||
        (currentPlayer === "black" && targetRow === 8)
    ) {
        selectedPiece.classList.add("queen"); // Add the Queen class
        debugInfo(`${currentPlayer} piece became a queen!`);
    }

    selectedPiece = null;
    if (switchTurn) switchPlayer(); // Switch turn if necessary
}

// Handle piece capture (non-Queen pieces)
function handleCapture(selectedRow, selectedCol, targetRow, targetCol, targetSquare) {
    if (!selectedPiece.classList.contains("queen")) {
        const middleRow = (selectedRow + targetRow) / 2;
        const middleCol = (selectedCol + targetCol) / 2;
        const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
        const capturedPiece = middleSquare ? middleSquare.querySelector(".white-piece, .black-piece") : null;

        debugInfo(`Attempting capture. Middle square: (${middleRow}, ${middleCol}), Captured piece: ${capturedPiece}`);

        // Validate if the piece can be captured
        if (capturedPiece && capturedPiece.classList.contains(`${currentPlayer === "white" ? "black" : "white"}-piece`)) {
            capturePiece(capturedPiece); // Capture the opponent's piece
            movePiece(targetSquare, false); // Move the selected piece

            // If no more captures are possible, switch turn
            if (!hasMoreCaptures(targetSquare)) {
                switchPlayer();
            } else {
                debugInfo(`${currentPlayer} can capture again.`);
                selectedPiece = targetSquare.querySelector(".white-piece, .black-piece");
                selectedPiece.classList.add("selected"); // Keep the piece selected if another capture is possible
            }
        } else {
            debugInfo("Invalid capture attempt.");
            clearSelection(); // Clear selection if the capture is invalid
        }
    } else {
        // Handle Queen capture logic (diagonal movement over multiple squares)
        let rowDirection = targetRow > selectedRow ? 1 : -1;
        let colDirection = targetCol > selectedCol ? 1 : -1;
        let row = selectedRow + rowDirection;
        let col = selectedCol + colDirection;
        let capturedPiece = null;
        let middleSquare = null;
    
        // Traverse the path to check for any captured piece
        while (row !== targetRow || col !== targetCol) {
            middleSquare = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            if (middleSquare && middleSquare.hasChildNodes()) {
                capturedPiece = middleSquare.querySelector(".white-piece, .black-piece");
                break;
            }
            row += rowDirection;
            col += colDirection;
        }
    
        // Validate if the captured piece is an opponent's and move the Queen
        if (capturedPiece && capturedPiece.classList.contains(`${currentPlayer === "white" ? "black" : "white"}-piece`)) {
            captureQueenPiece(capturedPiece); // Capture the piece

            movePiece(targetSquare, false); // Move the Queen piece

            // If no further captures are possible, switch turn
            if (!hasMoreCapturesQueen(targetSquare)) {
                switchPlayer();
            } else {
                debugInfo(`${currentPlayer} can capture again.`);
                selectedPiece = targetSquare.querySelector(".white-piece, .black-piece");
                selectedPiece.classList.add("selected");
            }
            
        } else {
            debugInfo("Invalid queen capture attempt.");
            clearSelection(); // Clear selection if the capture is invalid
        }
    }
}
function isValidCapture(selectedRow, selectedCol, targetRow, targetCol) {
    debugInfo(`Starting isValidCapture function for selected square: (${selectedRow}, ${selectedCol}) and target square: (${targetRow}, ${targetCol})`);

    // Calculate the middle square (rounding down)
    const middleRow = Math.floor((selectedRow + targetRow) / 2);
    const middleCol = Math.floor((selectedCol + targetCol) / 2);
    debugInfo(`Calculated middle square: (${middleRow}, ${middleCol})`);

    // Select the middle square
    const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
    
    // If there's no middle square, it's not a valid capture move
    if (!middleSquare) {
        debugInfo("Middle square not found. Invalid capture.");
        return false;
    }

    debugInfo("Middle square found.");

    // Check if there's a piece in the middle square
    const capturedPiece = middleSquare.querySelector(".white-piece, .black-piece");
    
    if (capturedPiece) {
        debugInfo("Captured piece found:", capturedPiece);
    } else {
        debugInfo("No captured piece found in the middle square.");
    }

    // If there is a piece in the middle, check if it belongs to the opponent
    const opponentPiece = capturedPiece && capturedPiece.classList.contains(`${currentPlayer === "white" ? "black" : "white"}-piece`);
    
    if (opponentPiece) {
        debugInfo("Captured piece belongs to the opponent.");
    } else {
        debugInfo("Captured piece does not belong to the opponent or no piece to capture.");
    }

    return opponentPiece;
}

function debugInfo(message) {
    console.log(`DEBUG INFO: ${message}`);
}

function hasMoreCaptures(pieceSquare) {
    const row = parseInt(pieceSquare.dataset.row);
    const col = parseInt(pieceSquare.dataset.col);
    
    if (isNaN(row) || isNaN(col)) {
        console.error("Invalid row or column value:", row, col);
        return false;
    }

    // Define all possible directions for capturing
    const directions = [
        { row: -2, col: -2 }, { row: -2, col: 2 }, 
        { row: 2, col: -2 }, { row: 2, col: 2 }
    ];

    // Check each direction to see if another capture is possible
    return directions.some(({ row: dr, col: dc }) => {
        const midRow = row + dr / 2;
        const midCol = col + dc / 2;
        const targetRow = row + dr;
        const targetCol = col + dc;

        const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
        const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);

        if (!midSquare || !targetSquare) return false; // Check if the move is within the bounds of the board

        const midPiece = midSquare.querySelector(".white-piece, .black-piece");
        if (!midPiece) return false; // If there's no piece to capture, the move is invalid

        if (!midPiece.classList.contains(currentPlayer === "white" ? "black-piece" : "white-piece")) return false; // Check if it's the opponent's piece

        return targetSquare.children.length === 0; // Target square must be empty
    });
}

function hasMoreCapturesQueen(pieceSquare) {
    const row = parseInt(pieceSquare.dataset.row);
    const col = parseInt(pieceSquare.dataset.col);
    
    if (isNaN(row) || isNaN(col)) {
        console.error("Invalid row or column value:", row, col);
        return false;
    }

    // Directions for capturing with a queen
    const directions = [
        { row: -1, col: -1 }, { row: -1, col: 1 }, 
        { row: 1, col: -1 }, { row: 1, col: 1 }
    ];

    // Check each direction for possible captures
    return directions.some(({ row: dr, col: dc }) => {
        let step = 1;
        let foundOpponent = false; // Flag to check if an opponent's piece is found

        while (true) {
            const midRow = row + dr * step;
            const midCol = col + dc * step;
            const targetRow = row + dr * (step + 1);
            const targetCol = col + dc * (step + 1);

            // If out of bounds, stop
            if (midRow < 1 || midRow > 8 || midCol < 1 || midCol > 8) break;
            if (targetRow < 1 || targetRow > 8 || targetCol < 1 || targetCol > 8) break;

            const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
            const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);

            if (!midSquare || !targetSquare) break; // Stop if a square is invalid

            const midPiece = midSquare.querySelector(".white-piece, .black-piece");

            if (midPiece) {
                // If an opponent piece has already been found, stop
                if (foundOpponent) break;

                // If the piece is an opponent's, check if there is an empty space ahead
                if (midPiece.classList.contains(currentPlayer === "white" ? "black-piece" : "white-piece")) {
                    foundOpponent = true; // Found an opponent piece
                } else {
                    break; // Can't move if it's a friendly piece
                }
            }

            // If an opponent's piece is found and there is space ahead, capture is possible
            if (foundOpponent && targetSquare.children.length === 0) return true;

            step++;
        }
        return false;
    });
}

function switchPlayer() {
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    debugInfo(`Next player: ${currentPlayer}`);
}

function clearSelection() {
    if (selectedPiece) selectedPiece.classList.remove("selected");
    selectedPiece = null;
}

function resetGame(color) {
    whiteCapturedPieces = 0;
    blackCapturedPieces = 0;
    selectedPiece = null;
    currentPlayer = "white";
    debugInfo("Game reset.");
    document.getElementById("board").innerHTML = "";
    createBoard(color);
    addSquareEventListeners();
}

function addSquareEventListeners() {
    document.querySelectorAll(".square").forEach(square => {
        square.addEventListener("click", handleSquareClick);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    addSquareEventListeners();
});



