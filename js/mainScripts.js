document.getElementById('checkerStyles').disabled = true;
let gameMode = 'offline'; // Default game mode set to offline
let yourColor; // Variable to store the player's color
let selectedRoomId; // Variable to store the selected room ID

// Switches between different menus and refreshes the game list when needed
function switchMenu(menuId) {
    if (menuId === 'gameListMenu' || menuId === 'quickMatchMenu') {
        refreshGameList(); // Refresh the list of rooms if in the game or quick match menu
    }
    // Remove active class from all containers and add it to the selected menu
    document.querySelectorAll('.container').forEach(container => container.classList.remove('active'));
    document.getElementById(menuId).classList.add('active');
}

// Handles switching from the game container back to the main menu
function switchMenuFromGameContainer() {
    if (gameMode === 'online') {
        leaveRoom(); // Leave the room if the game mode is online
    }
    document.getElementById('mainMenuStyles').disabled = false;
    document.getElementById('checkerStyles').disabled = true;
}

// Placeholder function for playing against a bot (currently under development)
function playWithBot() {
    alert("Bota karşı oyun modu geliştiriliyor!"); // Game mode against the bot is under development!
}

// Starts a two-player offline game
function playTwoPlayer() {
    gameMode = 'offline'; // Set game mode to offline
    document.getElementById('mainMenuStyles').disabled = true;
    document.getElementById('checkerStyles').disabled = false;
    resetGame('white'); // Reset the game with the white player starting
}

// Initiates a quick match by checking the available rooms and joining one
async function quickMatch() {
    await getRoomList(); // Fetch the list of available rooms
    gameMode = 'online'; // Set game mode to online

    if (activeRooms.length === 0) {
        alert('Boş oda yok'); // If no available rooms, show an alert
        return;
    }

    for (let i = 0; i < activeRooms.length; i++) {
        selectedRoomId = activeRooms[i]['roomId']; // Use the roomId directly as it’s already a string

        console.log("Odaya bağlanmaya çalışılıyor, roomId:", selectedRoomId);

        try {
            yourColor = activeRooms[i]['nextColor']; // Get the next available color for the player

            if (joinGame(selectedRoomId, yourColor)) {
                console.log(`Başarıyla ${selectedRoomId} odasına katıldın!`); // Successfully joined the room
                document.getElementById('mainMenuStyles').disabled = true;
                document.getElementById('checkerStyles').disabled = false;
                resetGame(yourColor); // Reset the game with the assigned color
                return; // Exit the loop once the game starts
            } else {
                console.log(`joinGame başarısız oldu: roomId=${selectedRoomId}, color=${yourColor}`);
            }
        } catch (error) {
            console.error(`Renk alınırken hata oluştu: ${error}`); // Handle any errors when fetching the color
        }
    }
}

// Starts a new game by creating a random room and joining with a selected color
function startNewGame() {
    gameMode = 'online'; // Set game mode to online
    yourColor = document.getElementById("side").value; // Get the selected color from the dropdown
    let roomId = Math.random().toString(36).substr(2, 9); // Generate a random room ID
    console.log("Seçilen taraf:", yourColor);
    joinGame(roomId, yourColor); // Join the new game with the generated room ID
    document.getElementById('mainMenuStyles').disabled = true;
    document.getElementById('checkerStyles').disabled = false;
    resetGame(yourColor); // Reset the game with the selected color
}

// Joins an existing game from the list of available rooms
function joinGameFromList() {
    gameMode = 'online'; // Set game mode to online
    let roomId = selectedRoomId; // Use the selected room ID
    console.log("Seçilen taraf:", yourColor);
    joinGame(roomId, yourColor); // Join the selected game with the assigned color
    document.getElementById('mainMenuStyles').disabled = true;
    document.getElementById('checkerStyles').disabled = false;
    resetGame(yourColor); // Reset the game with the selected color
}

// Placeholder function for adjusting sound settings
function adjustSound() {
    alert("Ses ayarları açılıyor!"); // Sound settings are opening!
}

// Placeholder function for adjusting graphics settings
function adjustGraphics() {
    alert("Grafik ayarları açılıyor!"); // Graphics settings are opening!
}

// Placeholder function for exiting the game
function exitGame() {
    alert("Oyundan çıkılıyor!"); // Exiting the game!
}

// Refreshes the list of available rooms
function refreshGameList() {
    getRoomList(); // Fetch the list of available rooms
}

// Updates the UI with the list of active game rooms
function updateGameListUI() {
    const gameListContainer = document.getElementById("gameListContainer");
    gameListContainer.innerHTML = ""; // Clear the current list

    // Iterate through the active rooms and create UI elements for each
    activeRooms.forEach(room => {
        const roomDiv = document.createElement("div");
        roomDiv.classList.add("game-room"); // Add a CSS class for styling
        roomDiv.textContent = room['roomId']; // Set the room name as text

        // Add a click event listener to select the room when clicked
        roomDiv.addEventListener("click", () => selectFromList(room['roomId'], roomDiv));

        gameListContainer.appendChild(roomDiv);
    });
}

// Selects a room from the game list and updates the UI
function selectFromList(roomId, roomElement) {
    // Remove the 'selected-room' class from all rooms
    document.querySelectorAll(".game-room").forEach(div => {
        div.classList.remove("selected-room");
    });

    // Update the selected room and fetch the color
    selectedRoomId = roomId;
    getColor(); // Get the color of the player for this room
    roomElement.classList.add("selected-room"); // Add the selected class to the clicked room

    console.log(`Seçilen oda: ${selectedRoomId}`);
}
