// src/redux/sagas/musicPlayerSaga.js

import { put, takeLatest } from 'redux-saga/effects';
import {
  loadTracksRequest,
  loadTracksSuccess,
  loadTracksFailure,
} from '../slices/musicPlayerSlice';
import Track1 from '../../assets/music/Joey Valence & Brae - HOOLIGANG.mp3';
import Track2 from '../../assets/music/SPARK MASTER TAPE - KKONKKRETE (OFFICIAL AUDIO).mp3';
import Track3 from '../../assets/music/ZHU, partywithray - Came For The Low.mp3';
import Track4 from '../../assets/music/Fergie - M.I.L.F. $ (Audio Version).mp3';
import Track5 from '../../assets/music/Feel Good Inc. Gorillaz.mp3';
import Track6 from '../../assets/music/Renegades Of Funk.mp3';
import Track7 from '../../assets/music/Son of augustine - Ask Me How.mp3';
import Track8 from '../../assets/music/Benny Benassi - Inside of Me HQ.mp3';

const localTracks = [
  { id: 1, name: 'Joey Valence & Brae - HOOLIGANG', url: Track1 },
  { id: 2, name: 'SPARK MASTER TAPE - KKONKKRETE (OFFICIAL AUDIO)', url: Track2 },
  { id: 3, name: 'ZHU, partywithray - Came For The Low', url: Track3 },
  { id: 4, name: 'Fergie - M.I.L.F. $ (Audio Version)', url: Track4 },
  { id: 5, name: 'Feel Good Inc. Gorillaz', url: Track5 },
  { id: 6, name: 'Renegades Of Funk', url: Track6 },
  { id: 7, name: 'Son of augustine - Ask Me How', url: Track7 },
  { id: 8, name: 'Benny Benassi - Inside of Me HQ', url: Track8 },
];

function* handleLoadTracks() {
  try {
    const tracks = localTracks;
    yield put(loadTracksSuccess(tracks));
  } catch (error) {
    yield put(loadTracksFailure(error.message));
  }
}

export function* musicPlayerSaga() {
  yield takeLatest(loadTracksRequest.type, handleLoadTracks);
}