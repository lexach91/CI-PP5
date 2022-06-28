import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';


const reducers = combineReducers({
    auth: authReducer
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth']
}

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk]
});


