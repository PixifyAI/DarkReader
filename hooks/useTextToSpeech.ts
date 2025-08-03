import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = (text: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // This effect handles cleanup. If the component unmounts or the text changes,
  // we should stop any ongoing speech synthesis to prevent memory leaks.
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  const play = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!text) return;

    // If the synth is paused, the most reliable action is to resume.
    // The `onresume` handler on the utterance will update the state.
    if (synth.paused) {
      synth.resume();
    } else {
      // If not paused, it's either stopped or we want to restart.
      // Cancel any ongoing speech to ensure a clean start.
      synth.cancel();

      // Create a new utterance instance. This is crucial for avoiding bugs in
      // some browsers where utterances cannot be reliably reused after being cancelled.
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onpause = () => {
        setIsSpeaking(false);
        setIsPaused(true);
      };
      utterance.onresume = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = (event) => {
        console.error('SpeechSynthesis Error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      // Start speaking with the new utterance.
      synth.speak(utterance);
    }
  }, [text]);

  const pause = useCallback(() => {
    const synth = window.speechSynthesis;
    // We can only pause if synthesis is actively speaking and not already paused.
    if (synth.speaking && !synth.paused) {
      synth.pause();
      // The `onpause` handler on the utterance will correctly update the state.
    }
  }, []);

  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    // Cancel will stop speech immediately and trigger the utterance's 'onend' event,
    // which correctly resets the state.
    synth.cancel();
  }, []);

  return { isSpeaking, isPaused, play, pause, stop };
};
