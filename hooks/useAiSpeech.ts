import { useCallback } from 'react';

export const useAiSpeech = (onEnd: () => void) => {
  const speak = useCallback((text: string) => {
    if (!text || typeof window.speechSynthesis === 'undefined') {
      onEnd();
      return;
    }

    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      onEnd();
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Error:', event);
      onEnd(); // Ensure state machine continues even on error
    };

    window.speechSynthesis.speak(utterance);
  }, [onEnd]);

  const stop = useCallback(() => {
    if (typeof window.speechSynthesis !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};
