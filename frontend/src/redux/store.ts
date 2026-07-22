import { configureStore, combineReducers} from '@reduxjs/toolkit'
import userReducer from './user/userSlice.js'
import {persistStore,persistReducer }from 'redux-persist'
import storage from "redux-persist/es/storage"

const rootReducer= combineReducers({user:userReducer})
console.log(storage);
const persistConfig = {
  key: 'user',
  storage
}

const persistedReducer = persistReducer(persistConfig,rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware)=>getDefaultMiddleware({
    serializableCheck:false
  })
}) 

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);