// components/ChatMessageList.jsx
import React from "react";
import ChatMessage from "./ChatMessage";

const ChatMessageList = ({ messages, pdfUploaded }) => {
  return (
    <div className="h-[400px] overflow-y-auto border border-gray-700 rounded p-4 bg-gray-800 space-y-3 mb-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-32">
          {pdfUploaded 
            ? "PDF uploaded successfully! Ask a question about the content." 
            : "Upload a PDF first, then ask questions about it."}
        </div>
      ) : (
        messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))
      )}
    </div>
  );
};

export default ChatMessageList;