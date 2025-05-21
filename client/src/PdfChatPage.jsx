/* eslint-disable no-unused-vars */
// PdfChatPage.jsx
import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PdfUploadSection from "./components/PdfUploadSection";
import ChatInterface from "./components/ChatInterface";
import { askQuestion } from "./services/api";
import { usePdfProcessing } from "./hooks/usePdfProcessing";

const PdfChatPage = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const {
    isProcessing,
    processedChunks,
    totalChunks,
    progressPercentage,
    progressRef,
    handleFileUpload,
    setProcessingProgress
  } = usePdfProcessing(pdfFile, setPdfUploaded, setMessages, setConversationHistory);

  useEffect(() => {
    window.speechSynthesis.cancel();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    setPdfUploaded(false);
    setProcessingProgress(0);
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    
    if (!pdfUploaded) {
      return;
    }

    const userMessage = { role: "user", content: chatInput };
    
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: chatInput },
      { sender: "bot", text: "🤖 Thinking..." },
    ]);
    setLoading(true);
    setChatInput("");

    try {
      const response = await askQuestion(chatInput, conversationHistory);
      
      // Add the messages to conversation history
      setConversationHistory((prev) => [
        ...prev, 
        userMessage,
        { role: "assistant", content: response }
      ]);
      
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: "Sorry, I couldn't find relevant information in the uploaded PDF. Please try another question or upload a different PDF." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white bg-gray-900">
      <ToastContainer theme="dark" position="top-left" />

      {/* PDF Upload Section */}
      <PdfUploadSection 
        pdfFile={pdfFile}
        pdfUploaded={pdfUploaded}
        loading={loading}
        isProcessing={isProcessing}
        processedChunks={processedChunks}
        totalChunks={totalChunks}
        progressPercentage={progressPercentage}
        progressRef={progressRef}
        handleFileChange={handleFileChange}
        handleFileUpload={handleFileUpload}
      />

      {/* Chat Interface */}
      <ChatInterface 
        messages={messages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        pdfUploaded={pdfUploaded}
        loading={loading}
        handleSend={handleSend}
      />
    </div>
  );
};

export default PdfChatPage;