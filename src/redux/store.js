// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import musicPlayerReducer from './slices/musicPlayerSlice';
import { musicPlayerSaga } from './sagas/musicPlayerSaga';
import { all } from 'redux-saga/effects';

function* rootSaga() {
  yield all([
    musicPlayerSaga(),
  ]);
}

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    musicPlayer: musicPlayerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;