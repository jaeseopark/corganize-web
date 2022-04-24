import { configureStore } from "@reduxjs/toolkit";
import blanketReducer from "./blanket";
import fileRepositoryReducer from "./fileRepositorySlice";

const store = configureStore({
  reducer: {
    fileRepository: fileRepositoryReducer,
    blanket: blanketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
