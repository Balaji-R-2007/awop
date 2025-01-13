import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import qs from "query-string";

const socket = io("https://awop.onrender.com"); // Your backend URL

const Chat = () => {
  const { roomCode } = useParams();
  const { search } = useLocation();
  const { name } = qs.parse(search);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(""); // ✅ Store admin name
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!roomCode || !name) return;

    socket.emit("joinRoom", { roomCode, name });

    socket.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("roomUsers", (usersList) => {
      if (usersList.length > 0) {
        setAdmin(usersList[0].name); // ✅ First user is admin
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
    <div className="flex flex-col items-center h-screen bg-gray-100 p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Room: {roomCode}</h2>

      {/* ✅ Online Users Section */}
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold">Online Users</h3>
        <ul className="list-disc pl-5">
          {users.map((user, index) => (
            <li key={index} className="text-gray-700">
              {user.name} {user.name === admin && "(Admin)"} {/* ✅ Show Admin */}
            </li>
          ))}
        </ul>
      </div>

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
          <div ref={messagesEndRef}></div>
        </div>

        <div className="flex">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-r">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
