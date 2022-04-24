import { createSlice } from "@reduxjs/toolkit";

export type UserAction = {
  name: string;
  icon?: JSX.Element;
  onClick: () => void;
};

export type CorganizeBlanket = {
  title?: string;
  body?: JSX.Element;
  userActions: UserAction[];
  onClose?: () => void;
};

const initialState: { blanket: CorganizeBlanket } = {
  blanket: {
    userActions: [],
  },
};

const slice = createSlice({
  name: "blanket",
  initialState,
  reducers: {
    set: (state, { payload: newBlanket }: { payload: CorganizeBlanket }) => {
      state.blanket = newBlanket;
    },
    clear: (state) => {
      const { onClose } = state.blanket;
      if (onClose) {
        onClose();
      }
      state.blanket = {
        userActions: [],
      };
    },
    addUserAction: (state, { payload: newUserAction }: { payload: UserAction }) => {
      state.blanket.userActions.push(newUserAction);
    },
  },
});

export const { set, clear, addUserAction } = slice.actions;

const blanketReducer = slice.reducer;

export default blanketReducer;
