import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomAccess = () => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!name.trim()) return alert("Enter your name");

    const res = await fetch("https://awop.onrender.com/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId: name })
    });

    const data = await res.json();

    if (data.roomCode) {
      alert(`Room created! Code: ${data.roomCode}`);
      navigate(`/chat/${data.roomCode}?name=${name}`);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !roomCode.trim()) return alert("Enter both fields");

    const res = await fetch("https://awop.onrender.com/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode })
    });

    const data = await res.json();

    if (data.success) {
      navigate(`/chat/${roomCode}?name=${name}`);
    } else {
      alert(data.error || "Room not found");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/images.jpeg')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-col">

      <h1 className="text-center pt-10 text-7xl  font-bold mb-8 text-black drop-shadow-lg tracking-widest font-serif">
           Awop         </h1>
      <div className=" bg-black/50 border border-yellow-400 shadow-2xl rounded-3xl p-10 w-full max-w-2xl text-center text-white font-semibold">
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

        <button
          onClick={handleCreateRoom}
          className="w-full bg-yellow-500 text-black text-xl py-3 rounded-xl font-bold hover:bg-yellow-600 transition-all mb-8 shadow-lg"
        >
          🏴‍☠️ Create treasure Room
        </button>

        <input
          type="text"
          placeholder="Enter Treasure Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="w-full text-lg px-6 py-3 mb-6 rounded-xl bg-white/80 text-black placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-red-400"
          />

        <button
          onClick={handleJoinRoom}
          className="w-full bg-red-600 text-white text-xl py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
          >
          🗺️ Join Treasure Room
        </button>
      </div>
          </div>
    </div>
  );
};

export default RoomAccess;
