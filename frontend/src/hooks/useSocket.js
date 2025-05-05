import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = "https://awop.onrender.com";

export const useSocket = (roomCode, userName) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    if (!roomCode || !userName) return;
    
    // Initialize socket connection with better error handling
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event listeners
    socketInstance.on("connect", () => {
      setConnected(true);
      socketInstance.emit("joinRoom", { roomCode, name: userName });
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Failed to connect to chat server");
    });

    socketInstance.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketInstance.on("roomUsers", (usersList) => {
      setUsers(usersList);
    });

    socketInstance.on("error", (errorMsg) => {
      setError(errorMsg);
    });

    setSocket(socketInstance);

    // Cleanup function
    return () => {
      if (socketInstance) {
        socketInstance.emit("leaveRoom", { roomCode });
        socketInstance.disconnect();
      }
    };
  }, [roomCode, userName]);

  const sendMessage = (message) => {
    if (socket && connected && message.trim()) {
      socket.emit("roomMessage", { roomCode, name: userName, message });
      return true;
    }
    return false;
  };

  return {
    socket,
    connected,
    error,
    users,
    messages,
    sendMessage
  };
};