import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import qs from "query-string";
import axios from "axios";
import ReactPlayer from "react-player";
import { io } from "socket.io-client";

// Initialize Socket.IO client
const socket = io("https://awop.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Chat = () => {
  const { roomCode } = useParams();
  const { search } = useLocation();
  const { name } = qs.parse(search);

  // Chat state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState("");

  // Video mode state
  const [watchVideoMode, setWatchVideoMode] = useState(false);
  const [videoUrl, setVideoUrl] = useState(""); // Search query input
  const [videoId, setVideoId] = useState(""); // Video ID for playback
  const [searchResults, setSearchResults] = useState([]);
  const [playing, setPlaying] = useState(false); // Playback state
  const [playedSeconds, setPlayedSeconds] = useState(0); // Current video time
  const playerRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Set up socket events for chat and video synchronization
  useEffect(() => {
    if (!roomCode || !name) return;

    socket.emit("joinRoom", { roomCode, name });

    // Chat-related events
    socket.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("roomUsers", (usersList) => {
      if (usersList.length > 0) setAdmin(usersList[0].name);
      setUsers(usersList);
    });

    // Video synchronization events
    socket.on("videoSelected", ({ videoId }) => {
      setVideoId(videoId);
      setPlaying(true); // Start playing automatically
      setPlayedSeconds(0); // Reset to start
    });

    socket.on("videoControl", ({ action, time }) => {
      if (action === "play") {
        setPlaying(true);
      } else if (action === "pause") {
        setPlaying(false);
      } else if (action === "seek" && playerRef.current) {
        playerRef.current.seekTo(time, "seconds");
        setPlayedSeconds(time);
      }
    });

    return () => {
      socket.emit("leaveRoom", { roomCode });
      socket.off("roomMessage");
      socket.off("roomUsers");
      socket.off("videoSelected");
      socket.off("videoControl");
    };
  }, [roomCode, name]);

  // Auto-scroll chat to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a chat message
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("roomMessage", { roomCode, name, message });
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Video search using YouTube Data API v3
  const searchYouTube = async (query) => {
    try {
      const apiKey = "AIzaSyBKE_YcQBjW88ewuy4c1UUj0cIwYE3_Ku4"; // Replace with your API key
      const targetUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=10&key=${apiKey}`;
      const res = await axios.get(targetUrl);
      setSearchResults(res.data.items || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  // Handle video selection and broadcast to room
  const handleVideoSelect = (video) => {
    const newVideoId = video.id.videoId;
    setVideoId(newVideoId);
    setPlaying(true);
    setPlayedSeconds(0);
    socket.emit("videoSelected", { roomCode, videoId: newVideoId });
  };

  // Handle playback control events
  const handlePlay = () => {
    setPlaying(true);
    socket.emit("videoControl", { roomCode, action: "play" });
  };

  const handlePause = () => {
    setPlaying(false);
    socket.emit("videoControl", { roomCode, action: "pause" });
  };

  const handleSeek = (seconds) => {
    setPlayedSeconds(seconds);
    socket.emit("videoControl", { roomCode, action: "seek", time: seconds });
  };

  return (
    <div
      className="flex flex-col items-center h-screen p-5 text-white"
      style={{
        backgroundImage:
          'url("https://i.pinimg.com/originals/77/dd/3d/77dd3d3b3264caa95adca2026cdd5350.gif")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-3xl bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-extrabold text-yellow-400 tracking-widest">
            ☠️ Pirate Chat Room: {roomCode}
          </h2>
          <button
            className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold hover:bg-yellow-500"
            onClick={() => setWatchVideoMode(!watchVideoMode)}
          >
            {watchVideoMode ? "Hide Video" : "Watch Video"}
          </button>
        </div>

        <div className="flex w-full space-x-4">
          {watchVideoMode && (
            <div className="w-2/3">
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Search for videos..."
                  className="p-2 text-black rounded-xl"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (e.target.value.trim() !== "") {
                      searchYouTube(e.target.value);
                      setVideoId("");
                    } else {
                      setSearchResults([]);
                      setVideoId("");
                    }
                  }}
                />
                {videoUrl && !videoId && searchResults.length > 0 && (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 bg-white/10 p-4 rounded-xl">
                    {searchResults.map((video) => (
                      <div
                        key={video.id.videoId}
                        onClick={() => handleVideoSelect(video)}
                        className="cursor-pointer flex items-center space-x-4 hover:bg-yellow-200/20 p-2 rounded-xl"
                      >
                        <img
                          src={video.snippet.thumbnails.default.url}
                          alt={video.snippet.title}
                          className="w-20 rounded-lg"
                        />
                        <span className="text-white font-semibold">
                          {video.snippet.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {videoId && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden">
                    <ReactPlayer
                      ref={playerRef}
                      url={`https://www.youtube.com/embed/${videoId}`}
                      controls
                      playing={playing}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onSeek={(seconds) => handleSeek(seconds)}
                      onProgress={({ playedSeconds }) =>
                        setPlayedSeconds(playedSeconds)
                      }
                      width="100%"
                      height="100%"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={watchVideoMode ? "w-1/3" : "w-full"}>
            <div className="flex flex-col space-y-4">
              <div className="bg-white/10 p-4 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">
                  👥 Crew on Deck:
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-lg">
                  {users.map((user, index) => (
                    <li key={index} className="text-white">
                      {user.name} {user.name === admin && "🧭 (Captain)"}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-xl h-[250px] overflow-y-auto space-y-2">
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
              <div className="flex">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your pirate message..."
                  className="flex-1 p-3 rounded-l-xl text-white border font-bold focus-within:text-yellow-500 placeholder-gray-600 focus:outline-none bg-black/50"
                />
              </div>
              <p className="text-gray-400 text-center pt-2">
                Enter To Send Message
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;