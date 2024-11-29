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
        playTrack(state, action) {
            state.currentTrack = action.payload;
            state.isPlaying = true;
        },
        pauseTrack(state) {
            state.isPlaying = false;
        },
        loadTracksRequest(state) {
            state.loading = true;
        },
        loadTracksSuccess(state, action) {
            state.loading = false;
            state.tracks = action.payload;
        },
        loadTracksFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    playTrack,
    pauseTrack,
    loadTracksRequest,
    loadTracksSuccess,
    loadTracksFailure,
} = musicPlayerSlice.actions;

export default musicPlayerSlice.reducer;