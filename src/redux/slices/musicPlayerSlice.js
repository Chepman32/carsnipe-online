import { createSlice } from '@reduxjs/toolkit';
import { stations } from '../stations';

const initialState = {
  currentStation: stations[0],
  currentTrack: null,
  isPlaying: true,
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
      state.currentTrack = action.payload[0] || null;
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
    switchStationRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    switchStationSuccess(state, action) {
      state.loading = false;
      state.currentStation = action.payload.station;
      state.tracks = action.payload.tracks;
      state.currentTrack = action.payload.tracks[0] || null;
      state.isPlaying = true;
    },
    switchStationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    playNextStation(state) {
      const currentIndex = stations.findIndex(s => s.id === state.currentStation.id);
      const nextIndex = (currentIndex + 1) % stations.length;
      state.currentStation = stations[nextIndex];
      state.tracks = stations[nextIndex].tracks;
      state.currentTrack = stations[nextIndex].tracks[0] || null;
      state.isPlaying = true;
    },
    playPreviousStation(state) {
      const currentIndex = stations.findIndex(s => s.id === state.currentStation.id);
      const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
      state.currentStation = stations[prevIndex];
      state.tracks = stations[prevIndex].tracks;
      state.currentTrack = stations[prevIndex].tracks[0] || null;
      state.isPlaying = true;
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
  switchStationRequest,
  switchStationSuccess,
  switchStationFailure,
  playNextStation,
  playPreviousStation,
} = musicPlayerSlice.actions;

export default musicPlayerSlice.reducer;