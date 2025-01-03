import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://awop.onrender.com");

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Awop</h2>
      <h3 className="pb-1">Chart</h3>

      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <div className="h-100 overflow-y-auto border p-2 mb-2 rounded">
          {messages.map((msg, index) => (
            <div key={index} className="p-2 my-1 bg-blue-100 hover:bg-blue-300 text-gray-700 rounded-lg">
              {msg}
            </div>
          ))}
        </div>

        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border-1 rounded-l-lg focus:bg-black focus:text-white"
          />
          <button
            onClick={sendMessage}
            className="bg-green-700 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 hover:scale-110"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
