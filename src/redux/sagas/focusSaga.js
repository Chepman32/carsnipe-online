// focusSaga.js
import { takeEvery, put } from 'redux-saga/effects';

function* handleFocusSectionChange(action) {
  console.log('[focusSaga] Focus changed to:', action.payload);
}

function* watchFocusSectionChange() {
  // Directly use the string action type if you prefer:
  yield takeEvery('focus/setFocusedSection', handleFocusSectionChange);
}

export default function* focusSaga() {
  yield watchFocusSectionChange();
}