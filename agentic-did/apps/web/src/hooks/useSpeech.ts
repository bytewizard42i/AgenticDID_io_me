/**
 * Text-to-Speech Hook
 * Provides browser-based speech synthesis for agent communication
 */

import { useCallback, useEffect, useState } from 'react';

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceName?: string;
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable('speechSynthesis' in window);
    
    // Load voices (needed for some browsers)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speak = useCallback(async (text: string, options: SpeechOptions = {}): Promise<void> => {
    if (!isAvailable || !text.trim()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.lang || 'en-GB'; // Default to British English for Comet

      // Try to select a British male voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Look for British male voice (Google UK English Male, or any GB male voice)
        const britishMale = voices.find(voice => 
          (voice.lang.includes('en-GB') || voice.lang.includes('en-UK')) && 
          (voice.name.includes('Male') || voice.name.includes('male') || voice.name.includes('Daniel') || voice.name.includes('Arthur'))
        );
        
        // Fallback to any British voice
        const britishVoice = britishMale || voices.find(voice => 
          voice.lang.includes('en-GB') || voice.lang.includes('en-UK')
        );
        
        if (britishVoice) {
          utterance.voice = britishVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [isAvailable]);

  const cancel = useCallback(() => {
    if (isAvailable) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isAvailable]);

  return {
    speak,
    cancel,
    isSpeaking,
    isAvailable
  };
};
