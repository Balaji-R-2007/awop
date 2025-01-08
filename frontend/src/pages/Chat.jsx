import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import qs from "query-string";

const socket = io("https://awop.onrender.com"); // Your server URL

const Chat = () => {
  const { roomCode } = useParams();
  const { search } = useLocation();
  const { name } = qs.parse(search);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomCode || !name) return;

    socket.emit("joinRoom", { roomCode, name });

    socket.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.emit("leaveRoom", roomCode);
      socket.off("roomMessage");
    };
  }, [roomCode, name]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("roomMessage", { roomCode, name, message });
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Room: {roomCode}</h2>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <div className="h-96 overflow-y-auto border p-2 mb-2 rounded">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-1 ${
                msg.name === name ? "bg-green-200" : "bg-blue-100"
              } text-gray-800 rounded`}
            >
              <strong>{msg.name}:</strong> {msg.message}
            </div>
          ))}
        </div>

        <div className="flex">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
          />
          
        </div>
      </div>
    </div>
  );
};

export default Chat;
