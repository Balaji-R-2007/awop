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

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  admin: { type: String, required: true },
  users: [{ id: String, name: String }],
});

const Room = mongoose.model("Room", RoomSchema);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", async ({ roomCode, name }) => {
    let room = await Room.findOne({ roomCode });

    if (!room) {
      // Create room
      room = new Room({ roomCode, admin: name, users: [{ id: socket.id, name }] });
      await room.save();
    } else {
      // Prevent duplicate entries
      const alreadyJoined = room.users.some((user) => user.id === socket.id || user.name === name);
      if (!alreadyJoined) {
        room.users.push({ id: socket.id, name });
        await room.save();
      }
    }

    socket.join(roomCode);
    console.log(`${name} joined room: ${roomCode}`);
    io.to(roomCode).emit("roomUsers", room.users);
  });

  socket.on("roomMessage", ({ roomCode, name, message }) => {
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

      // Optional: Delete room if empty
      if (room.users.length === 0) {
        await Room.deleteOne({ roomCode });
        console.log("🗑️ Deleted empty room:", roomCode);
      }
    }
  });

  socket.on("disconnect", async () => {
    const rooms = await Room.find({ "users.id": socket.id });

    for (const room of rooms) {
      room.users = room.users.filter((user) => user.id !== socket.id);
      await room.save();

      io.to(room.roomCode).emit("roomUsers", room.users);
      console.log("❌ User disconnected:", socket.id);

      // Delete empty rooms
      if (room.users.length === 0) {
        await Room.deleteOne({ roomCode: room.roomCode });
        console.log("🗑️ Deleted empty room:", room.roomCode);
      }
    }
  });
});

server.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
