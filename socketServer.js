const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let rooms = {}; // Oyun odalarını tutacağız

io.on("connection", (socket) => {
  console.log(`Yeni kullanıcı bağlandı: ${socket.id}`);

  socket.currentRoom = null; // Kullanıcının hangi odada olduğunu takip et

  socket.on("joinRoom", ({ roomId, color }) => {
    if (!["white", "black"].includes(color)) {
      socket.emit("error", "Geçersiz renk seçimi.");
      return;
    }
 
    console.log(`${socket.id} şu rengi seçti: ${color}`);

    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      console.log(`${socket.id}, ${socket.currentRoom} odasından ayrıldı`);

      if (rooms[socket.currentRoom]) {
        rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
        io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);

        if (rooms[socket.currentRoom].players.length === 0) {
          delete rooms[socket.currentRoom];
        }
      }
    }

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    // Aynı renkten oyuncu zaten varsa reddet
    if (rooms[roomId].players.some(p => p.color === color)) {
      socket.emit("error", `Bu odada zaten bir ${color} oyuncu var.`);
      return;
    }

    socket.join(roomId);
    console.log(`${socket.id}, ${roomId} odasına ${color} olarak katıldı`);

    rooms[roomId].players.push({ id: socket.id, color });
    socket.currentRoom = roomId;

    console.log(`Şu anki oyuncular (${roomId}):`, rooms[roomId].players);

    io.to(roomId).emit("playerCount", rooms[roomId].players.length);
    socket.emit("assignColor", color); // Kullanıcıya rengini bildir

    if (rooms[roomId].players.length === 2) {
      console.log(`Oyun başlıyor! Oda: ${roomId}`);
      io.to(roomId).emit("gameStart");
    }
  });

  socket.on("move", ({ roomId, from, to }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit("move", { from, to });
    }
  });

  socket.on("getRooms", () => {
    const emptyRooms = Object.keys(rooms).filter(room => rooms[room].players.length === 1);
    socket.emit("roomsList", emptyRooms);
  });
  
  

  socket.on("getColor", (roomId) => {
    let color = rooms[roomId].players[0].color === "white" ? "black" : "white";
    socket.emit("yourColor", color);
  });

  socket.on("disconnect", () => {
    if (socket.currentRoom && rooms[socket.currentRoom]) {
      rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
      io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);

      // Oda tamamen boşaldıysa siliyoruz
      if (rooms[socket.currentRoom].players.length === 0) {
        delete rooms[socket.currentRoom];
      }
    }
    console.log(`Kullanıcı ayrıldı: ${socket.id}`);
  });
});

server.listen(3002, "0.0.0.0", () => {
  console.log("Socket.IO server 3002 portunda çalışıyor");
});
