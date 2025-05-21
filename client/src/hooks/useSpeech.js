// hooks/useSpeech.js
import { useCallback } from "react";

export const useSpeech = () => {
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  }, []);

  return {
    speakText
  };
};

export default useSpeech;