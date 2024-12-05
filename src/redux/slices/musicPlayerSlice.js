// src/redux/slices/musicPlayerSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: true, // Music starts playing by default
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

export const {
  loadTracksRequest,
  loadTracksSuccess,
  loadTracksFailure,
  playTrack,
  pauseTrack,
  setCurrentTrack,
} = musicPlayerSlice.actions;

export default musicPlayerSlice.reducer;