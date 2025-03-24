require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 10000;
const rooms = {};

app.use(cors());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("WebSocket Server is Running...");
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Creating a Room
  socket.on("createRoom", ({ roomId }) => {
    rooms[roomId] = { players: {} };
    socket.join(roomId);
    rooms[roomId].players[socket.id] = { wpm: 0, accuracy: 100 };
    socket.emit("roomCreated", { roomId, isAdmin: true });
  });

  // Joining a Room
  socket.on("joinRoom", ({ roomId }) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].players[socket.id] = { wpm: 0, accuracy: 100 };
      io.to(roomId).emit("playerJoined", { players: rooms[roomId].players });
      socket.emit("roomJoined", { roomId });
    }
  });

  // Updating Progress
  socket.on("updateProgress", ({ roomId, typedText }) => {
    if (rooms[roomId] && rooms[roomId].players[socket.id]) {
      rooms[roomId].players[socket.id].wpm = Math.floor(Math.random() * 100);
      io.to(roomId).emit("updateLeaderboard", { players: rooms[roomId].players });
    }
  });

  // Starting Test
  socket.on("startTest", ({ roomId }) => {
    io.to(roomId).emit("startTyping");
  });

  // Disconnect
  socket.on("disconnect", () => {
    Object.keys(rooms).forEach((roomId) => {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        io.to(roomId).emit("playerLeft", { players: rooms[roomId].players });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
