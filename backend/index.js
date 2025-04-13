const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust to your frontend URL if needed
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000, // Increase timeout to prevent premature disconnects
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Room Schema & Model
const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  admin: { type: String, required: true },
  users: [{ id: String, name: String }],
});
const Room = mongoose.model("Room", RoomSchema);

// Socket.IO Event Handling
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // When a user joins a room
  socket.on("joinRoom", async ({ roomCode, name }) => {
    try {
      roomCode = roomCode.toUpperCase(); // Consistent room code
      let room = await Room.findOne({ roomCode });
      if (!room) {
        room = new Room({
          roomCode,
          admin: name,
          users: [{ id: socket.id, name }],
        });
        await room.save();
      } else {
        const alreadyJoined = room.users.some(
          (user) => user.id === socket.id || user.name === name
        );
        if (!alreadyJoined) {
          room.users.push({ id: socket.id, name });
          await room.save();
        }
      }
      socket.join(roomCode);
      console.log(`${name} joined room: ${roomCode}`);
      io.to(roomCode).emit("roomUsers", room.users);
    } catch (error) {
      console.error("Error in joinRoom:", error);
      socket.emit("error", "An error occurred when joining the room");
    }
  });

  // Handle sending messages
  socket.on("roomMessage", ({ roomCode, name, message }) => {
    roomCode = roomCode.toUpperCase(); // Ensure consistency
    io.to(roomCode).emit("roomMessage", { name, message });
  });

  // Handle video selection
  socket.on("videoSelected", ({ roomCode, videoId }) => {
    roomCode = roomCode.toUpperCase();
    io.to(roomCode).emit("videoSelected", { videoId });
  });

  // Handle video control (play, pause, seek)
  socket.on("videoControl", ({ roomCode, action, time }) => {
    roomCode = roomCode.toUpperCase();
    io.to(roomCode).emit("videoControl", { action, time });
  });

  // Admin kicks a user (Admin Only)
  socket.on("kickUser", async ({ roomCode, adminName, userId }) => {
    try {
      roomCode = roomCode.toUpperCase();
      const room = await Room.findOne({ roomCode });
      if (room && room.admin === adminName) {
        room.users = room.users.filter((user) => user.id !== userId);
        await room.save();
        io.to(userId).emit("kicked", {
          message: "You have been kicked out of the room.",
        });
        io.to(roomCode).emit("roomUsers", room.users);
      }
    } catch (error) {
      console.error("Error in kickUser:", error);
    }
  });

  // When a user leaves the room
  socket.on("leaveRoom", async ({ roomCode }) => {
    try {
      roomCode = roomCode.toUpperCase();
      const room = await Room.findOne({ roomCode });
      if (room) {
        room.users = room.users.filter((user) => user.id !== socket.id);
        await room.save();
        socket.leave(roomCode);
        console.log("🚪 User left room:", roomCode);
        io.to(roomCode).emit("roomUsers", room.users);
        if (room.users.length === 0) {
          await Room.deleteOne({ roomCode });
          console.log("🗑️ Deleted empty room:", roomCode);
        }
      }
    } catch (error) {
      console.error("Error in leaveRoom:", error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", async () => {
    try {
      const rooms = await Room.find({ "users.id": socket.id });
      for (const room of rooms) {
        room.users = room.users.filter((user) => user.id !== socket.id);
        await room.save();
        io.to(room.roomCode).emit("roomUsers", room.users);
        console.log("❌ User disconnected:", socket.id);
        if (room.users.length === 0) {
          await Room.deleteOne({ roomCode: room.roomCode });
          console.log("🗑️ Deleted empty room:", room.roomCode);
        }
      }
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
});

// Health-check endpoint
app.get("/", (req, res) => res.send("Chat Server Running"));

// REST API to create a room
app.post("/rooms", async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId)
      return res.status(400).json({ error: "adminId is required" });

    let roomCode;
    let exists = true;
    while (exists) {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room = await Room.findOne({ roomCode });
      if (!room) exists = false;
    }
    const newRoom = new Room({
      roomCode,
      admin: adminId,
      users: [{ id: adminId, name: adminId }], // Add admin as a user
    });
    await newRoom.save();

    res.json({ roomCode });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// REST API to join a room
app.post("/join", async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode)
      return res.status(400).json({ error: "Room code required" });

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room)
      return res.status(404).json({ error: "Room not found" });

    res.json({ success: true, message: "Room joined", roomCode: room.roomCode });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
});

server.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);