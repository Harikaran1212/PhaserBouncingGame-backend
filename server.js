const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Environment Variables
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://phaser-bouncing-game-harikarans-projects-17414b93.vercel.app';

// Configure CORS
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true, // Include credentials if required
}));

// Set up HTTP server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Handle Socket.io connections
let adminSocketId = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Assign roles
  if (!adminSocketId) {
    adminSocketId = socket.id;
    socket.emit('role', 'admin');
  } else {
    socket.emit('role', 'viewer');
  }

  // Handle button clicks from admin
  socket.on('buttonClick', (data) => {
    console.log('Button clicked:', data);
    socket.broadcast.emit('buttonClicked', data); // Broadcast to viewers
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // If the admin disconnects, reset adminSocketId
    if (socket.id === adminSocketId) {
      adminSocketId = null;
    }
  });
});

// Basic test route
app.get('/', (req, res) => {
  res.send('Server is running and connected to the Socket.io!');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Client URL is set to: ${CLIENT_URL}`);
});
