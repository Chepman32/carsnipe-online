// src/redux/store.js

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import { all } from 'redux-saga/effects';

// Import your reducers and sagas
import musicPlayerReducer from './slices/musicPlayerSlice';
import quickSettingsReducer from './slices/quickSettingsSlice';
import mainSettingsReducer from './slices/mainSettingsSlice';
import { musicPlayerSaga } from './sagas/musicPlayerSaga';

// Root Saga
function* rootSaga() {
  yield all([
    musicPlayerSaga(),
    // Add other sagas here if needed
  ]);
}

// Persist Configuration for mainSettings
const mainSettingsPersistConfig = {
  key: 'mainSettings',
  storage,
  whitelist: ['darkMode', 'musicVolume', 'soundEffectsOn'], // Updated to include 'soundEffectsOn'
};

// Persisted Reducer for mainSettings
const persistedMainSettingsReducer = persistReducer(mainSettingsPersistConfig, mainSettingsReducer);

// Create Saga Middleware
const sagaMiddleware = createSagaMiddleware();

// Configure the Redux Store
const store = configureStore({
  reducer: {
    musicPlayer: musicPlayerReducer,
    quickSettings: quickSettingsReducer,
    mainSettings: persistedMainSettingsReducer, // Use the persisted reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk middleware since you're using saga
      serializableCheck: {
        // Ignore redux-persist actions for serializable state check to prevent warnings
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

// Create Persistor
export const persistor = persistStore(store);

// Run Saga Middleware
sagaMiddleware.run(rootSaga);

export default store;