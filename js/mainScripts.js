document.getElementById('checkerStyles').disabled = true;
let gameMode='offline';
let yourColor;
let selectedRoomId;

function switchMenu(menuId) {
    if (menuId==='gameListMenu' || menuId==='quickMatchMenu') {
        refreshGameList();
    }
    document.querySelectorAll('.container').forEach(container => container.classList.remove('active'));
    document.getElementById(menuId).classList.add('active');
}

function switchMenuFromGameContainer(){
    document.getElementById('mainMenuStyles').disabled = false;
    document.getElementById('checkerStyles').disabled = true;
}

function playWithBot() {
    alert("Bota karşı oyun modu geliştiriliyor!");
}

function playTwoPlayer() {
    gameMode='offline';
    document.getElementById('mainMenuStyles').disabled = true;
    document.getElementById('checkerStyles').disabled = false;
    resetGame('white');
}

function quickMatch() {
refreshGameList();    
gameMode = 'online';
// Eğer boş bir oda bulunamazsa yeni bir oda oluştur
if (activeRooms.length === 0) {
alert('Boş oda yok')
return;
}
// Boş odalar arasında dön ve ilk uygun olanına oyuncuyu ekle
for (let i = 0; i < activeRooms.length; i++) {
let roomId = activeRooms[i];
if (joinGame(roomId)) {
    return; // Odaya katılınca fonksiyondan çık
}
} 
}

function joinGameFromQuickMatch() {
gameMode='online';
let roomId = selectedRoomId; 
console.log("Seçilen taraf:", yourColor);
joinGame(roomId,yourColor);
document.getElementById('mainMenuStyles').disabled = true;
document.getElementById('checkerStyles').disabled = false;
resetGame(yourColor);
}

function startNewGame() {
gameMode='online';
yourColor = document.getElementById("side").value;
let roomId = Math.random().toString(36).substr(2, 9); // Rastgele bir oda ID'si oluştur
console.log("Seçilen taraf:", yourColor);
joinGame(roomId,yourColor);
document.getElementById('mainMenuStyles').disabled = true;
document.getElementById('checkerStyles').disabled = false;
resetGame(yourColor);

}

function joinGameFromList() {
gameMode='online';
let roomId = selectedRoomId; 
console.log("Seçilen taraf:", yourColor);
joinGame(roomId,yourColor);
document.getElementById('mainMenuStyles').disabled = true;
document.getElementById('checkerStyles').disabled = false;
resetGame(yourColor);
}

function adjustSound() {
    alert("Ses ayarları açılıyor!");
}

function adjustGraphics() {
    alert("Grafik ayarları açılıyor!");
}

function exitGame() {

    alert("Oyundan çıkılıyor!");
}

function refreshGameList() {
    getRoomList();
}

function updateGameListUI() {
const gameListContainer = document.getElementById("gameListContainer");
gameListContainer.innerHTML = ""; // Önce listeyi temizle

activeRooms.forEach(room => {
const roomDiv = document.createElement("div");
roomDiv.classList.add("game-room"); // CSS için sınıf ekleyebilirsin
roomDiv.textContent = room; // Oda adını yaz

// Odaya tıklayınca seçme özelliği ekleyelim
roomDiv.addEventListener("click", () => selectFromList(room, roomDiv));

gameListContainer.appendChild(roomDiv);
});
}

function selectFromList(roomId, roomElement) {
// Önce eski seçili olanı temizle
document.querySelectorAll(".game-room").forEach(div => {
div.classList.remove("selected-room");
});

// Yeni seçili olanı güncelle
selectedRoomId = roomId;
getColor();
roomElement.classList.add("selected-room");

console.log(`Seçilen oda: ${selectedRoomId}`);
}
