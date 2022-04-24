import { createSlice } from "@reduxjs/toolkit";

export type ToastType = "info" | "success" | "warning" | "error";

export type CorganizeToast = {
  id: string;
  type: ToastType;
  header: string;
  message: string;
  createdAt: number;
  onClick?: () => void;
};

const initialState: { toasts: CorganizeToast[] } = {
  toasts: [],
};

const slice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    add: ({ toasts }, { payload: newToast }: { payload: CorganizeToast }) => {
      toasts.push(newToast);
    },
    remove: ({ toasts }, { payload: idToRemove }: { payload: string }) => {
      const i = toasts.findIndex((f) => f.id === idToRemove);
      if (i !== -1) {
        toasts.splice(i, 1);
      }
    },
  },
});

export const { add, remove } = slice.actions;

const toastReducer = slice.reducer;

export default toastReducer;
