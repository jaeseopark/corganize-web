import { configureStore } from "@reduxjs/toolkit";
import blanketReducer from "./blanket";
import fileRepositoryReducer from "./fileRepositorySlice";
import gridReducer from "./grid/reducer";
import toastReducer from "./toast";

const store = configureStore({
  reducer: {
    fileRepository: fileRepositoryReducer,
    blanket: blanketReducer,
    toast: toastReducer,
    grid: gridReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
