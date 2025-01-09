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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Awop Chat</h1>
      
      <input
        className="mb-2 p-2 border rounded w-64"
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="mb-6">
        <button
          onClick={handleCreateRoom}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create Room
        </button>
      </div>

      <input
        className="mb-2 p-2 border rounded w-64"
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
      />
      <button
        onClick={handleJoinRoom}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Join Room
      </button>
    </div>
  );
};

export default RoomAccess;
