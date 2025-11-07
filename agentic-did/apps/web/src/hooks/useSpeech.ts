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
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable('speechSynthesis' in window);
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
      utterance.lang = options.lang || 'en-US';

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
