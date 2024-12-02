// src/redux/slices/musicPlayerSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  tracks: [],
  loading: false,
  error: null,
};

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    loadTracksRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loadTracksSuccess(state, action) {
      state.loading = false;
      state.tracks = action.payload;
    },
    loadTracksFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    playTrack(state, action) {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    pauseTrack(state) {
      state.isPlaying = false;
    },
    setCurrentTrack(state, action) {
      state.currentTrack = action.payload;
    },
  },
});

const quickSettingsSlice = createSlice({
  name: 'quickSettings',
  initialState: {
    darkMode: false,
    musicOn: true,
    soundEffectsOn: true,
  },
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

export const {
  loadTracksRequest,
  loadTracksSuccess,
  loadTracksFailure,
  playTrack,
  pauseTrack,
  setCurrentTrack,
} = musicPlayerSlice.actions;

export const {
  toggleDarkMode,
  toggleMusic,
  toggleSoundEffects,
} = quickSettingsSlice.actions;

export const quickSettingsReducer = quickSettingsSlice.reducer;

export default musicPlayerSlice.reducer;