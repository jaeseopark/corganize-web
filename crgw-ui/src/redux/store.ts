import { configureStore } from "@reduxjs/toolkit";
import fileRepositoryReducer from "./fileRepositorySlice";

const store = configureStore({
  reducer: {
    fileRepository: fileRepositoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
