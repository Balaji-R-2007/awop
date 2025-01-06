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
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
