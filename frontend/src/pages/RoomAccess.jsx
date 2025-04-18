import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

const RoomAccess = () => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!name.trim()) return alert("Enter your name");

    setLoading(true);
    try {
      const res = await fetch("https://awop.onrender.com/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: name }),
      });

      const data = await res.json();

      if (data.roomCode) {
        alert(`Room created! Code: ${data.roomCode}`);
        navigate(`/chat/${data.roomCode}?name=${name}`);
      }
    } catch (err) {
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !roomCode.trim()) return alert("Enter both fields");

    setLoading(true);
    try {
      const res = await fetch("https://awop.onrender.com/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode }),
      });

      const data = await res.json();

      if (data.success) {
        navigate(`/chat/${roomCode}?name=${name}`);
      } else {
        alert(data.error || "Room not found");
      }
    } catch (err) {
      alert("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center  justify-center px-4 sm:px-10 w-full">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }} 
          className="text-center pt-10 text-7xl font-bold mb-8 text-black drop-shadow-lg tracking-widest font-serif">
          Awop
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="bg-black/50 border border-yellow-400 shadow-2xl rounded-3xl p-10 w-full max-w-2xl text-center text-white font-semibold">
          <h1 className="text-5xl animate-pulse font-bold mb-8 text-yellow-400 drop-shadow-lg tracking-widest font-serif">
            ☠️ Pirates Chat ☠️
          </h1>

          <input
            type="text"
            placeholder="Enter your pirate name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-lg px-6 py-3 mb-6 rounded-xl bg-white/80 text-black placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-yellow-400"
          />

          <motion.button
            onClick={handleCreateRoom}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-full text-xl py-3 rounded-xl font-bold transition-all mb-8 shadow-lg ${
              loading
                ? "bg-yellow-300 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-black"
            }`}
          >
            {loading ? "Creating Room..." : "🏴‍☠️ Create Treasure Room"}
          </motion.button>

          <input
            type="text"
            placeholder="Enter Treasure Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full text-lg px-6 py-3 mb-6 rounded-xl bg-white/80 text-black placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-red-400"
          />

          <motion.button
            onClick={handleJoinRoom}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-full text-xl py-3 rounded-xl font-bold transition-all shadow-lg ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {loading ? "Joining..." : "🗺️ Join Treasure Room"}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RoomAccess;