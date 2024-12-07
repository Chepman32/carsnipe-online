// src/redux/sagas/quickSettingsSaga.js
import { takeEvery, select, put } from 'redux-saga/effects';
import { toggleMusic } from '../slices/quickSettingsSlice';
import { setMusicVolume } from '../slices/mainSettingsSlice';

function* syncQuickMusicOn(action) {
  const musicVolume = action.payload;
  const quickSettings = yield select((state) => state.quickSettings);
  const shouldBeOn = musicVolume > 0;

  if (quickSettings.musicOn !== shouldBeOn) {
    yield put(toggleMusic());
  }
}

function* syncQuickMusic() {
  const quickSettings = yield select((state) => state.quickSettings);
  if (!quickSettings.musicOn) {
    yield put(setMusicVolume(0));
  } else {
    const mainSettings = yield select((state) => state.mainSettings);
    if (mainSettings.musicVolume === 0) {
      yield put(setMusicVolume(50));
    }
  }
}

export default function* quickSettingsSaga() {
  yield takeEvery(toggleMusic.type, syncQuickMusic);
  yield takeEvery(setMusicVolume.type, syncQuickMusicOn);
}