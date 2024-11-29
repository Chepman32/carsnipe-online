import { all } from 'redux-saga/effects';
import { musicPlayerSaga } from './musicPlayerSaga';

export default function* rootSaga() {
    yield all([
        musicPlayerSaga(),
    ]);
}