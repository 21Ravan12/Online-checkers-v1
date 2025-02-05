const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS to allow cross-origin requests

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
  },
});

let rooms = {}; // Store game rooms

io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.currentRoom = null; // Track which room the user is in

  socket.on("joinRoom", ({ roomId, color }) => {
    if (!["white", "black"].includes(color)) {
      socket.emit("error", "Invalid color selection.");
      return;
    }
 
    console.log(`${socket.id} selected color: ${color}`);

    // Remove the user from the previous room if they were in one
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      console.log(`${socket.id} left room ${socket.currentRoom}`);

      if (rooms[socket.currentRoom]) {
        rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
        io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);

        // Delete the room if it becomes empty
        if (rooms[socket.currentRoom].players.length === 0) {
          delete rooms[socket.currentRoom];
        }
      }
    }

    // Create the room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    // Prevent duplicate colors in the same room
    if (rooms[roomId].players.some(p => p.color === color)) {
      socket.emit("error", `A player with color ${color} already exists in this room.`);
      return;
    }

    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId} as ${color}`);

    rooms[roomId].players.push({ id: socket.id, color });
    socket.currentRoom = roomId;

    console.log(`Current players in room (${roomId}):`, rooms[roomId].players);

    io.to(roomId).emit("playerCount", rooms[roomId].players.length);
    socket.emit("assignColor", color); // Inform the user of their assigned color

    // Start the game if two players have joined
    if (rooms[roomId].players.length === 2) {
      console.log(`Game starting! Room: ${roomId}`);
      io.to(roomId).emit("gameStart");
    }
  });

  // Handle player moves
  socket.on("move", ({ roomId, from, to }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit("move", { from, to });
    }
  });

  // Get the list of available rooms
  socket.on("getRooms", () => {
    const roomInfo = Object.keys(rooms)
        .filter(room => rooms[room].players.length === 1) // Only show rooms with one player waiting
        .map(room => {
            let nextColor = rooms[room].players[0].color === "white" ? "black" : "white";
            return { roomId: room, nextColor: nextColor }; // Return room ID and next available color
        });

    socket.emit("roomsList", roomInfo);
});

  // Assign color to the second player in the room
  socket.on("getColor", (roomId) => {
    if (!roomId || !rooms[roomId]) {
        socket.emit("error", "Invalid room ID");
        return;
    }

    if (!rooms[roomId].players || rooms[roomId].players.length === 0) {
        socket.emit("error", "No players found in the room");
        return;
    }

    let firstPlayer = rooms[roomId].players[0];
    if (!firstPlayer.color || (firstPlayer.color !== "white" && firstPlayer.color !== "black")) {
        socket.emit("error", "Invalid player color");
        return;
    }

    let color = firstPlayer.color === "white" ? "black" : "white";
    socket.emit("yourColor", color);
  });

  socket.on("leaveRoom", () => {
    if (socket.currentRoom) {
      // Remove the user from the current room
      socket.leave(socket.currentRoom);
      console.log(`${socket.id} left room ${socket.currentRoom}`);
  
      if (rooms[socket.currentRoom]) {
        rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
        io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);
  
        // Delete the room if it becomes empty
        if (rooms[socket.currentRoom].players.length === 0) {
          delete rooms[socket.currentRoom];
        }
      }
  
      // Reset the user's current room
      socket.currentRoom = null;
      socket.emit("leftRoom", { message: "You have left the room." });
    } else {
      socket.emit("error", "You are not currently in a room.");
    }
  });  

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (socket.currentRoom && rooms[socket.currentRoom]) {
      rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
      io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);

      // Delete the room if it becomes empty
      if (rooms[socket.currentRoom].players.length === 0) {
        delete rooms[socket.currentRoom];
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3002, "0.0.0.0", () => {
  console.log("Socket.IO server is running on port 3002");
});
