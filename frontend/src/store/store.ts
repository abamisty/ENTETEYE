import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import parentAdminReducer from "./slices/parentAdminSlice";
import childReducer from "./slices/childSlice";
import { AppUser } from "../types/auth";

// Combine reducers first
const rootReducer = combineReducers({
  auth: authReducer,
  parentAdmin: parentAdminReducer,
  child: childReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

// Then pass the combined reducer to persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
