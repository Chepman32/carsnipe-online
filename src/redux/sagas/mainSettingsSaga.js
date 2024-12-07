// src/redux/sagas/mainSettingsSaga.js
import { takeEvery, select, put } from 'redux-saga/effects';
import { setDarkMode, setMusicVolume, setSoundEffectsVolume } from './mainSettingsSlice';
import { toggleDarkMode, toggleMusic, toggleSoundEffects } from './quickSettingsSlice';

function* syncDarkMode(action) {
  const darkMode = action.payload;
  const quickSettings = yield select((state) => state.quickSettings);
  if (quickSettings.darkMode !== darkMode) {
    yield put(toggleDarkMode());
  }
}

function* syncMusicVolume(action) {
  const musicVolume = action.payload;
  const quickSettings = yield select((state) => state.quickSettings);
  const shouldBeOn = musicVolume > 0;
  if (quickSettings.musicOn !== shouldBeOn) {
    yield put(toggleMusic());
  }
}

function* syncSoundEffectsVolume(action) {
  const soundEffectsVolume = action.payload;
  const quickSettings = yield select((state) => state.quickSettings);
  const shouldBeOn = soundEffectsVolume > 0;
  if (quickSettings.soundEffectsOn !== shouldBeOn) {
    yield put(toggleSoundEffects());
  }
}

export default function* mainSettingsSaga() {
  yield takeEvery(setDarkMode.type, syncDarkMode);
  yield takeEvery(setMusicVolume.type, syncMusicVolume);
  yield takeEvery(setSoundEffectsVolume.type, syncSoundEffectsVolume);
}