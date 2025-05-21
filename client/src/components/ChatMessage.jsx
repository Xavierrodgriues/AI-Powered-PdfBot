// components/ChatMessage.jsx
import React from "react";
import { useSpeech } from "../hooks/useSpeech";

const ChatMessage = ({ message }) => {
  const { speakText } = useSpeech();
  
  return (
    <div
      className={`p-3 rounded-lg max-w-[80%] md:max-w-sm break-words ${
        message.sender === "user"
          ? "bg-indigo-600 self-end ml-auto text-right text-white"
          : "bg-green-600 text-white"
      }`}
    >
      {message.text}
      {message.sender === "bot" && message.text !== "🤖 Thinking..." && (
        <button
          onClick={() => speakText(message.text)}
          className="mt-2 px-3 py-1 text-sm border border-gray-400 rounded-full text-gray-300 hover:bg-gray-600 hover:border-white transition duration-200"
        >
          🔊 Speak
        </button>
      )}
    </div>
  );
};

export default ChatMessage;