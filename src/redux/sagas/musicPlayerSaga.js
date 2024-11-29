import { put, takeLatest } from 'redux-saga/effects';
import {
    loadTracksRequest,
    loadTracksSuccess,
    loadTracksFailure,
} from '../slices/musicPlayerSlice';
import Track1 from '../../assets/music/Track 1.mp3';
import Track2 from '../../assets/music/Track 2.mp3';
import Track3 from '../../assets/music/Track 3.mp3';

// Static list of tracks stored in assets
const localTracks = [
    { id: 1, name: 'Track 1', url: Track1 },
    { id: 2, name: 'Track 2', url: Track2 },
    { id: 3, name: 'Track 3', url: Track3 },
];

function* handleLoadTracks() {
    try {
        // Simulate dynamic fetching of local tracks
        const tracks = localTracks;
        yield put(loadTracksSuccess(tracks));
    } catch (error) {
        yield put(loadTracksFailure(error.message));
    }
}

export function* musicPlayerSaga() {
    yield takeLatest(loadTracksRequest.type, handleLoadTracks);
}