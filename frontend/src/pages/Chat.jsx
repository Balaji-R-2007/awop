import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import qs from "query-string";

const socket = io("https://awop.onrender.com");

const Chat = () => {
  const { roomCode } = useParams();
  const { search } = useLocation();
  const { name } = qs.parse(search);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!roomCode || !name) return;

    socket.emit("joinRoom", { roomCode, name });

    socket.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("roomUsers", (usersList) => {
      if (usersList.length > 0) {
        setAdmin(usersList[0].name);
      }
      setUsers(usersList);
    });

    return () => {
      socket.emit("leaveRoom", { roomCode });
      socket.off("roomMessage");
      socket.off("roomUsers");
    };
  }, [roomCode, name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div
      className="flex flex-col items-center h-screen p-5 text-white"
      style={{
        backgroundImage: `url("https://i.pinimg.com/originals/77/dd/3d/77dd3d3b3264caa95adca2026cdd5350.gif")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-3xl bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl p-6">
        <h2 className="text-4xl font-extrabold text-yellow-400 text-center mb-6 tracking-widest">
          ☠️ Pirate Chat Room: {roomCode}
        </h2>

        {/* Online Users */}
        <div className="mb-6 bg-white/10 p-4 rounded-xl">
          <h3 className="text-xl font-bold text-yellow-300 mb-2">👥 Crew on Deck:</h3>
          <ul className="list-disc pl-6 space-y-1 text-lg">
            {users.map((user, index) => (
              <li key={index} className="text-white">
                {user.name} {user.name === admin && "🧭 (Captain)"}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Box */}
        <div className="bg-white/10 p-4 rounded-xl mb-4 h-[250px] overflow-y-auto space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.name === name
                  ? "ml-auto bg-yellow-200 text-black font-semibold"
                  : "mr-auto bg-blue-200 text-black"
              }`}
            >
              <strong>{msg.name}:</strong> {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex mt-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your pirate message..."
            className="flex-1 p-3 rounded-l-xl text-white border font-bold focus-within:text-yellow-500 placeholder-gray-600 focus:outline-none"
          />
        </div>
         <p className="text-gray-400 text-center pt-2">Enter To Send Message</p>
      </div>
    </div>
  );
};

export default Chat;
