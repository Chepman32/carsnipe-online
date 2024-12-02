// src/redux/slices/quickSettingsSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode: false,
  musicOn: true,
  soundEffectsOn: true,
};

const quickSettingsSlice = createSlice({
  name: "quickSettings",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    toggleMusic(state) {
      state.musicOn = !state.musicOn;
    },
    toggleSoundEffects(state) {
      state.soundEffectsOn = !state.soundEffectsOn;
    },
  },
});

export const { toggleDarkMode, toggleMusic, toggleSoundEffects } = quickSettingsSlice.actions;
export const quickSettingsReducer = quickSettingsSlice.reducer;