import { configureStore } from "@reduxjs/toolkit";
import blanketReducer from "./blanket";
import fileRepositoryReducer from "./fileRepositorySlice";
import toastReducer from "./toast";

const store = configureStore({
  reducer: {
    fileRepository: fileRepositoryReducer,
    blanket: blanketReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
