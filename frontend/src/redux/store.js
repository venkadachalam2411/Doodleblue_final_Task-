
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  createMigrate,
  persistStore,
  persistReducer,
} from "redux-persist";

import productsReducer from "./productsSlice";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";

// Custom browser storage adapter
const storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),

  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },

  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  auth: authReducer,
});

const migrations = createMigrate({
  1: (state) => ({
    ...state,
    cart: {
      ...state.cart,
      couponCode: "",
      couponDiscountAmount: 0,
      couponError: "",
    },
  }),
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  migrate: migrations,
  whitelist: ["cart", "auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
