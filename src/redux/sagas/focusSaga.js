import { takeLatest, put } from 'redux-saga/effects';
import { handleKeyDown } from './focusSlice';

function* handleKeyDownWorker(action) {
  // In this basic example, we do not dispatch anything else here.
  // You can put side effects or other logic if needed.
}

export function* focusSaga() {
  yield takeLatest(handleKeyDown.type, handleKeyDownWorker);
}