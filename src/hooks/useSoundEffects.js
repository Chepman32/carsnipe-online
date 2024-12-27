import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import SwitchSound from "../assets/audio/light-switch.mp3";
import OpeningSound from "../assets/audio/opening.MP3";
import ClosingSound from "../assets/audio/closing.MP3";

const useSoundEffects = () => {
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);

  const playSound = useCallback((sound) => {
    if (!sound || !soundEffectsOn) return;
    const audio = new Audio(sound);
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  }, [soundEffectsOn]);

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