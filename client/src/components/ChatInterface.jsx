// components/ChatInterface.jsx
import React from "react";
import ChatMessageList from "./ChatMessageList";
import ChatInputArea from "./ChatInputArea";

const ChatInterface = ({ 
  messages, 
  chatInput, 
  setChatInput, 
  pdfUploaded, 
  loading, 
  handleSend 
}) => {
  return (
    <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-gray-900">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
        💬 PdfChat with AI
      </h1>

      <ChatMessageList 
        messages={messages} 
        pdfUploaded={pdfUploaded} 
      />

      <ChatInputArea
        chatInput={chatInput}
        setChatInput={setChatInput}
        pdfUploaded={pdfUploaded}
        loading={loading}
        handleSend={handleSend}
      />
    </div>
  );
};

export default ChatInterface;