import { configureStore, combineReducers} from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import {persistStore,persistReducer }from 'redux-persist'
import storageModule from "redux-persist/lib/storage"

const storage = storageModule.default

const rootReducer= combineReducers({user:userReducer})


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

export const persistor = persistStore(store);