const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const RoomSchema = new mongoose.Schema({
  roomCode: String,
  admin: String, // Store the admin (first user)
  users: [{ id: String, name: String }],
});

const Room = mongoose.model("Room", RoomSchema);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", async ({ roomCode, name }) => {
    let room = await Room.findOne({ roomCode });

    if (!room) {
      // First user creates the room (Admin)
      room = new Room({ roomCode, admin: name, users: [{ id: socket.id, name }] });
      await room.save();
    } else {
      // Add user to existing room
      room.users.push({ id: socket.id, name });
      await room.save();
    }

    socket.join(roomCode);
    console.log(`${name} joined room: ${roomCode}`);

    // Emit updated users list
    io.to(roomCode).emit("roomUsers", room.users);
  });

  socket.on("roomMessage", async ({ roomCode, name, message }) => {
    io.to(roomCode).emit("roomMessage", { name, message });
  });

  socket.on("leaveRoom", async ({ roomCode }) => {
    const room = await Room.findOne({ roomCode });

    if (room) {
      room.users = room.users.filter((user) => user.id !== socket.id);
      await room.save();
      
      socket.leave(roomCode);
      io.to(roomCode).emit("roomUsers", room.users);
      console.log("🚪 User left room:", roomCode);
    }
  });

  socket.on("disconnect", async () => {
    const rooms = await Room.find({ "users.id": socket.id });

    for (const room of rooms) {
      room.users = room.users.filter((user) => user.id !== socket.id);
      await room.save();
      io.to(room.roomCode).emit("roomUsers", room.users);
      console.log("❌ User disconnected:", socket.id);
    }
  });
});

server.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
