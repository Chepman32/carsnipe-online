import { put, takeLatest, select } from 'redux-saga/effects';
import {
  loadTracksRequest,
  loadTracksSuccess,
  loadTracksFailure,
  switchStationRequest,
  switchStationSuccess,
  switchStationFailure,
} from '../slices/musicPlayerSlice';
import { stations } from '../stations';

function* handleLoadTracks() {
  try {
    const state = yield select((state) => state.musicPlayer);
    const currentStation = state.currentStation;
    yield put(loadTracksSuccess(currentStation.tracks));
  } catch (error) {
    yield put(loadTracksFailure(error.message));
  }
}

function* handleSwitchStation(action) {
  try {
    const stationId = action.payload;
    const station = stations.find((s) => s.id === stationId);
    if (!station) throw new Error('Station not found');
    yield put(
      switchStationSuccess({
        station,
        tracks: station.tracks,
      })
    );
  } catch (error) {
    yield put(switchStationFailure(error.message));
  }
}

export function* musicPlayerSaga() {
  yield takeLatest(loadTracksRequest.type, handleLoadTracks);
  yield takeLatest(switchStationRequest.type, handleSwitchStation);
}