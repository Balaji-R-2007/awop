import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://awop.onrender.com"); // Connect to backend

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]); // Update messages
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message); // Send message to server
      setMessage(""); // Clear input
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto", textAlign: "center" }}>
        
      <h2>Real-time Chat</h2>

      <div style={{ height: 200, border: "1px solid #ccc", overflowY: "auto", marginBottom: 10 }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ padding: 5, background: "#f1f1f1", margin: 2, borderRadius: 5 }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ padding: 8, width: "80%" }}
      />
      <button onClick={sendMessage} style={{ padding: 8, marginLeft: 5 }}>Send</button>
    </div>
  );
};

export default Chat;
