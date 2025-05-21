// hooks/usePdfProcessing.js
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { uploadPdf } from "../services/api";

export const usePdfProcessing = (pdfFile, setPdfUploaded, setMessages, setConversationHistory) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [processedChunks, setProcessedChunks] = useState(0);
  const [loading, setLoading] = useState(false); // Move this useState call to component level
  
  // Refs for progress animation
  const progressRef = useRef(null);
  const animationFrameRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  
  useEffect(() => {
    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Smooth progress animation function
  const animateProgress = () => {
    if (currentProgressRef.current < targetProgressRef.current) {
      // Smooth easing function - faster at the beginning, slower as it approaches target
      const step = Math.max(0.5, (targetProgressRef.current - currentProgressRef.current) * 0.1);
      currentProgressRef.current = Math.min(currentProgressRef.current + step, targetProgressRef.current);
      
      // Update DOM directly for smoother animation
      if (progressRef.current) {
        progressRef.current.style.width = `${currentProgressRef.current}%`;
      }
      
      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(animateProgress);
    }
  };

  // Updated progress simulation
  const simulateProgressUpdates = (estimatedChunks) => {
    setTotalChunks(estimatedChunks);
    setIsProcessing(true);
    setProcessedChunks(0);
    
    // Reset progress state
    currentProgressRef.current = 0;
    targetProgressRef.current = 0;
    
    // Calculate update interval based on PDF size
    const updateInterval = Math.max(50, Math.min(300, 10000 / estimatedChunks));
    
    // Start progress animation
    animationFrameRef.current = requestAnimationFrame(animateProgress);
    
    // Track time for natural progression curve
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const timeElapsed = Date.now() - startTime;
      
      // Natural progression curve using sigmoid function
      const progressRatio = 1 / (1 + Math.exp(-0.001 * (timeElapsed - 5000)));
      const nextValue = Math.floor(estimatedChunks * progressRatio * 0.95);
      
      // Update processed chunks count
      setProcessedChunks(nextValue);
      
      // Update target progress percentage for smooth animation
      targetProgressRef.current = Math.min(100, Math.round((nextValue / estimatedChunks) * 100));
      
      // If we're near completion or taking too long, stop the simulation
      if (progressRatio > 0.95 || timeElapsed > 60000) {
        clearInterval(interval);
      }
    }, updateInterval);
    
    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  };

  const handleFileUpload = useCallback(async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file first.");
      return;
    }
  
    // Don't use useState here - it was causing the error
    setLoading(true);
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Reset progress animation
    currentProgressRef.current = 0;
    targetProgressRef.current = 0;
    
    // Estimate chunks based on file size with improved algorithm
    const estimatedChunks = Math.max(5, Math.ceil(pdfFile.size / 4000));
    const cleanupProgress = simulateProgressUpdates(estimatedChunks);
    
    try {
      const data = await uploadPdf(pdfFile);
      
      // Complete the progress animation
      targetProgressRef.current = 100;
      
      // Update final values
      const actualChunks = data.totalChunks || estimatedChunks;
      setProcessedChunks(actualChunks);
      setTotalChunks(actualChunks);
      setProcessingProgress(100);
  
      toast.success(`PDF processed successfully! ${actualChunks} chunks embedded.`);
      setPdfUploaded(true);
      
      // Clear previous conversation when a new PDF is uploaded
      setMessages([]);
      setConversationHistory([]);
      
    } catch (error) {
      toast.error(error.message || "An error occurred while uploading the PDF.");
      console.error(error);
    } finally {
      setLoading(false);
      
      // Ensure cleanup happens
      setTimeout(() => {
        cleanupProgress();
        setIsProcessing(false);
      }, 1000);
    }
  }, [pdfFile, setMessages, setConversationHistory, setPdfUploaded]);

  // Calculate progress percentage for display
  const progressPercentage = totalChunks > 0 
    ? Math.round((processedChunks / totalChunks) * 100) 
    : 0;

  return {
    isProcessing,
    processingProgress,
    setProcessingProgress,
    totalChunks,
    processedChunks,
    progressPercentage,
    progressRef,
    handleFileUpload,
    loading
  };
};

export default usePdfProcessing;