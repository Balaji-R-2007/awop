const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  adminId: { type: String, required: true },
  users: [
    {
      id: String,
      name: String,
    },
  ],
  messages: [
    {
      sender: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Room", RoomSchema);
