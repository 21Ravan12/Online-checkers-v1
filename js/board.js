const board = document.getElementById("board");

// Function to create the board
function createBoard(color) {
    const boardFragment = document.createDocumentFragment(); // Using DocumentFragment for performance optimization
    const boardArray = []; // Array to hold the squares of the board

    // If the color is 'white', set up the board for a white player's perspective
    if (color === 'white') {

        // Loop through each row and column to create the squares
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const square = document.createElement("div"); // Create a new square div
                square.dataset.row = row; // Set row number as data attribute
                square.dataset.col = col; // Set column number as data attribute
                square.classList.add("square"); // Add base "square" class to each square

                // Alternate the square colors based on the row and column sum
                if ((row + col) % 2 === 0) {
                    square.classList.add("white-square"); // White square for even row+col sum
                } else {
                    square.classList.add("black-square"); // Black square for odd row+col sum

                    // Add pieces on black squares (positioned for checkers)
                    if (row < 4) { // Add black pieces to the first three rows
                        const piece = document.createElement("div");
                        piece.classList.add("black-piece"); // Class for black piece
                        square.appendChild(piece); // Append the piece to the square
                    } else if (row > 5) { // Add white pieces to the last three rows
                        const piece = document.createElement("div");
                        piece.classList.add("white-piece"); // Class for white piece
                        square.appendChild(piece); // Append the piece to the square
                    }
                }

                boardFragment.appendChild(square); // Append the square to the fragment
                boardArray.push(square); // Add the square to the board array
            }
        }

    } else { // If the color is not 'white', set up the board for black player's perspective

        // Loop through each row and column to create the squares in reverse
        for (let row = 8; row >= 1; row--) {
            for (let col = 8; col >= 1; col--) {
                const square = document.createElement("div"); // Create a new square div
                square.dataset.row = row; // Set row number as data attribute
                square.dataset.col = col; // Set column number as data attribute
                square.classList.add("square"); // Add base "square" class to each square

                // Alternate the square colors based on the row and column sum
                if ((row + col) % 2 === 0) {
                    square.classList.add("white-square"); // White square for even row+col sum
                } else {
                    square.classList.add("black-square"); // Black square for odd row+col sum

                    // Add pieces on black squares (positioned for checkers)
                    if (row < 4) { // Add black pieces to the first three rows
                        const piece = document.createElement("div");
                        piece.classList.add("black-piece"); // Class for black piece
                        square.appendChild(piece); // Append the piece to the square
                    } else if (row > 5) { // Add white pieces to the last three rows
                        const piece = document.createElement("div");
                        piece.classList.add("white-piece"); // Class for white piece
                        square.appendChild(piece); // Append the piece to the square
                    }
                }

                boardFragment.appendChild(square); // Append the square to the fragment
                boardArray.push(square); // Add the square to the board array
            }
        }
    }

    board.appendChild(boardFragment); // Append the fragment (with all squares) to the DOM in one go
    return boardArray; // Return the array of squares
}
