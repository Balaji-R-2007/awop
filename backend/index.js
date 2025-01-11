require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const generateRoomCode = require("./utils/generateRoomCode");

const Room = require("./models/Room");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

  io.on("connection", (socket) => {
    console.log("User connected");
  
    socket.on("joinRoom", async ({ roomCode, name }) => {
      if (!roomCode || !name) return;
  
      const room = await Room.findOne({ roomCode });
  
      if (!room) {
        return socket.emit("error", "Room not found");
      }
  
      // Store users in the room
      if (!room.users) room.users = [];
      room.users.push({ id: socket.id, name });
      await room.save();
  
      socket.join(roomCode);
      console.log(`${name} joined room: ${roomCode}`);
  
      // Notify all users in the room
      io.to(roomCode).emit("roomUsers", room.users);
    });
  
    socket.on("leaveRoom", async ({ roomCode, name }) => {
      const room = await Room.findOne({ roomCode });
      if (!room) return;
  
      // Remove user
      room.users = room.users.filter((user) => user.id !== socket.id);
      await room.save();
  
      socket.leave(roomCode);
      console.log(`${name} left room: ${roomCode}`);
  
      io.to(roomCode).emit("roomUsers", room.users);
    });
  
    // Kick a user (Admin only)
    socket.on("kickUser", async ({ roomCode, targetId, adminId }) => {
      const room = await Room.findOne({ roomCode });
  
      if (!room || room.adminId !== adminId) return; // Ensure only admin can kick
  
      // Remove target user
      room.users = room.users.filter((user) => user.id !== targetId);
      await room.save();
  
      // Notify the kicked user
      io.to(targetId).emit("kicked");
  
      // Update all users
      io.to(roomCode).emit("roomUsers", room.users);
    });
  
    socket.on("disconnect", async () => {
      console.log("User disconnected");
  
      // Remove user from all rooms
      const rooms = await Room.find();
      for (const room of rooms) {
        const user = room.users.find((user) => user.id === socket.id);
        if (user) {
          room.users = room.users.filter((u) => u.id !== socket.id);
          await room.save();
          io.to(room.roomCode).emit("roomUsers", room.users);
        }
      }
    });
  });
  

// Placeholder route
app.get("/", (req, res) => res.send("Chat Server Running"));

app.post("/rooms", async (req, res) => {
  const { adminId } = req.body;
  if (!adminId) return res.status(400).json({ error: "adminId is required" });

  let roomCode;
  let exists = true;

  // Ensure room code is unique
  while (exists) {
    roomCode = generateRoomCode();
    const room = await Room.findOne({ roomCode });
    if (!room) exists = false;
  }

  const newRoom = new Room({ roomCode, adminId });
  await newRoom.save();

  const adminLink = `/admin/${roomCode}`;

  res.json({ roomCode, adminLink });
});
app.post("/join", async (req, res) => {
  const { roomCode } = req.body;
  if (!roomCode) return res.status(400).json({ error: "Room code required" });

  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({ success: true, message: "Room joined", roomCode });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
