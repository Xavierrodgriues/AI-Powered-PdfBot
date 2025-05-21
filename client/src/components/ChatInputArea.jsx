// components/ChatInputArea.jsx
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const ChatInputArea = ({ 
  chatInput, 
  setChatInput, 
  pdfUploaded, 
  loading, 
  handleSend 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        placeholder={pdfUploaded ? "Ask a question about your PDF..." : "Upload a PDF first..."}
        className="flex-grow px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
        disabled={loading || !pdfUploaded}
      />
      <button
        onClick={handleSend}
        className={`text-white px-4 py-2 rounded-lg ${
          loading || !pdfUploaded
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        disabled={loading || !pdfUploaded}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner />
            Thinking...
          </span>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
};

export default ChatInputArea;