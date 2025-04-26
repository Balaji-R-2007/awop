import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white/10 p-4 rounded-xl max-h-[180px] md:max-h-[250px] overflow-y-auto space-y-2">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 rounded-xl max-w-[80%] text-sm md:text-base ${
            msg.name === currentUser
              ? "ml-auto bg-yellow-200 text-black font-semibold"
              : "mr-auto bg-blue-200 text-black"
          }`}
        >
          <strong>{msg.name}:</strong> {msg.message}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;