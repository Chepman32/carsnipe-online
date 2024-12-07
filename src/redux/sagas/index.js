// redux/sagas/index.js

import { all } from 'redux-saga/effects';
import { musicPlayerSaga } from './musicPlayerSaga';
import mainSettingsSaga from './mainSettingsSaga';
import quickSettingsSaga from './quickSettingsSaga';

export default function* rootSaga() {
    yield all([
        musicPlayerSaga(),
        mainSettingsSaga(),
        quickSettingsSaga(),
    ]);
}