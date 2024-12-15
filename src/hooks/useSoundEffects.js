// src/hooks/useSoundEffects.js
import { useCallback } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector to access Redux state
import SwitchSound from "../assets/audio/light-switch.mp3";
import OpeningSound from "../assets/audio/opening.MP3";
import ClosingSound from "../assets/audio/closing.MP3";

const useSoundEffects = () => {
  // Access the soundEffectsOn state from Redux
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);

  // Generic function to play a sound if soundEffectsOn is true
  const playSound = useCallback((sound) => {
    if (!sound || !soundEffectsOn) return; // Do not play if soundEffectsOn is false
    const audio = new Audio(sound);
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  }, [soundEffectsOn]);

  // Specific sound functions
  const playSwitchSound = useCallback(() => {
    playSound(SwitchSound);
  }, [playSound]);

  const playOpeningSound = useCallback(() => {
    playSound(OpeningSound);
  }, [playSound]);

  const playClosingSound = useCallback(() => {
    playSound(ClosingSound);
  }, [playSound]);

  return {
    playSwitchSound,
    playOpeningSound,
    playClosingSound,
  };
};

export default useSoundEffects;