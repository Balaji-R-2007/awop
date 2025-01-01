const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Listen for messages and broadcast them
  socket.on('message', (data) => {
    io.emit('message', data); // Send to all clients
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
