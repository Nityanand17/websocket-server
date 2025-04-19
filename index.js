const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://typeblaze.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store room information
const rooms = new Map();

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new typing room
  socket.on('createRoom', ({ roomId }) => {
    socket.join(roomId);
    
    // Get random paragraph from the client
    rooms.set(roomId, {
      admin: socket.id,
      players: {
        [socket.id]: {
          wpm: 0,
          accuracy: 100,
          progress: 0
        }
      },
      isRunning: false,
      timeLeft: 60
    });

    socket.emit('roomCreated', { 
      roomId,
      isAdmin: true
    });

    io.to(roomId).emit('updateLeaderboard', {
      players: rooms.get(roomId).players
    });

    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    socket.join(roomId);
    
    // Add player to room
    room.players[socket.id] = {
      wpm: 0,
      accuracy: 100,
      progress: 0
    };

    // Notify admin
    socket.to(room.admin).emit('playerJoined', {
      playerId: socket.id
    });

    // Notify all players about the new player
    io.to(roomId).emit('playerJoined', {
      players: room.players
    });

    // Tell the joining player if they are admin
    socket.emit('roomJoined', {
      isAdmin: socket.id === room.admin
    });

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Start the typing test
  socket.on('startTest', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    if (socket.id !== room.admin) return;
    
    room.isRunning = true;
    
    // Start countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      io.to(roomId).emit('countdown', { count });
      count--;
      
      if (count < 0) {
        clearInterval(countdownInterval);
        // Set start time for WPM calculation
        room.startTime = Date.now();
        io.to(roomId).emit('startTyping');
        
        // Set timer for the typing test
        room.timer = setTimeout(() => {
          room.isRunning = false;
          io.to(roomId).emit('finalResults', { 
            players: room.players 
          });
        }, 60000); // 60 seconds
      }
    }, 1000);
  });

  // Update player progress
  socket.on('updateProgress', ({ roomId, typedText }) => {
    const room = rooms.get(roomId);
    if (!room || !room.isRunning) return;
    
    const player = room.players[socket.id];
    if (!player) return;

    // Track elapsed time
    const elapsedTime = (Date.now() - room.startTime) / 1000 / 60; // in minutes
    
    // Calculate WPM (words per minute)
    const wordsTyped = typedText.length / 5; // Assume 5 characters = 1 word
    const wpm = elapsedTime > 0 ? Math.round(wordsTyped / elapsedTime) : 0;
    
    // Update player stats
    player.wpm = wpm;
    player.progress = typedText.length;
    
    // Send updated leaderboard to all players in the room
    io.to(roomId).emit('updateLeaderboard', {
      players: room.players
    });
  });

  // Client disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove player from all rooms they were in
    rooms.forEach((room, roomId) => {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        
        // If admin left, assign a new admin or close the room
        if (socket.id === room.admin) {
          const remainingPlayers = Object.keys(room.players);
          
          if (remainingPlayers.length > 0) {
            // Assign the first remaining player as admin
            room.admin = remainingPlayers[0];
            io.to(room.admin).emit('adminRights', { isAdmin: true });
          } else {
            // No players left, clean up the room
            if (room.timer) {
              clearTimeout(room.timer);
            }
            rooms.delete(roomId);
            return;
          }
        }
        
        // Notify remaining players
        io.to(roomId).emit('playerLeft', {
          playerId: socket.id,
          players: room.players
        });
      }
    });
  });
});

// Basic health check route
app.get('/', (req, res) => {
  res.send('TypeBlaze Socket.IO Server running');
});

// Start the server
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 