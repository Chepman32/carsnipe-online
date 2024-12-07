// src/redux/slices/mainSettingsSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Utility functions to safely parse values from localStorage
const getBooleanFromLocalStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
    return defaultValue;
  }
};

const getNumberFromLocalStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const initialState = {
  darkMode: getBooleanFromLocalStorage('darkMode', false),
  musicVolume: getNumberFromLocalStorage('musicVolume', 50),
  soundEffectsVolume: getNumberFromLocalStorage('soundEffectsVolume', 50),
};

const mainSettingsSlice = createSlice({
  name: 'mainSettings',
  initialState,
  reducers: {
    setDarkMode(state, action) {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    },
    setMusicVolume(state, action) {
      state.musicVolume = action.payload;
      localStorage.setItem('musicVolume', state.musicVolume.toString());
    },
    setSoundEffectsVolume(state, action) {
      state.soundEffectsVolume = action.payload;
      localStorage.setItem('soundEffectsVolume', state.soundEffectsVolume.toString());
    },
  },
});

export const { setDarkMode, setMusicVolume, setSoundEffectsVolume } = mainSettingsSlice.actions;
export default mainSettingsSlice.reducer;