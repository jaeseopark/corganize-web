import React, { Dispatch, useReducer } from "react";
import cls from "classnames";

import { Button, Center } from "@chakra-ui/react";

import "./blanket.scss";

export type UserAction = {
  name: string;
  icon: JSX.Element;
  onClick: () => void;
};

type BlanketPayload = {
  title: JSX.Element;
  body: JSX.Element;
  userActions: UserAction[];
};

type State = {
  title?: JSX.Element;
  body?: JSX.Element;
  isHotkeyEnabled: boolean;
  userActions: UserAction[];
};

type ReducerAction =
  | {
      type: "SET";
      payload: BlanketPayload;
    }
  | { type: "ADD_USER_ACTION"; payload: UserAction }
  | { type: "UNSET" }
  | { type: "SET_HOTKEY"; payload: boolean };

const initialState: State = {
  isHotkeyEnabled: true,
  userActions: [],
};

export const BlanketContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<ReducerAction>;
}>({ state: initialState });

const blanketReducer = (
  { title, body, isHotkeyEnabled, userActions }: State,
  action: ReducerAction
): State => {
  switch (action.type) {
    case "SET":
      return {
        title: action.payload.title,
        body: action.payload.body,
        userActions: action.payload.userActions,
        isHotkeyEnabled: true,
      };
    case "UNSET":
      return { isHotkeyEnabled: false, userActions: [] };
    case "ADD_USER_ACTION":
      return {
        title,
        body,
        isHotkeyEnabled,
        userActions: [...userActions, action.payload],
      };
    case "SET_HOTKEY":
      return {
        title,
        body,
        isHotkeyEnabled: action.payload,
        userActions,
      };
    default:
      return { title, body, isHotkeyEnabled, userActions };
  }
};

const BlanketProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(blanketReducer, initialState);
  const { title, body, userActions, isHotkeyEnabled } = state;
  const isBlanketEnabled = !!title && !!body;

  const maybeRenderBlanket = () => {
    if (!isBlanketEnabled) {
      return null;
    }

    const onKeyDown = (e: any) => {
      if (!isHotkeyEnabled) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "q") {
        dispatch({ type: "UNSET" });
      }
    };

    return (
      <div className="blanket-provider" onKeyDown={onKeyDown}>
        <div className="blanket-header">
          <label className="blanket-title">{title}</label>
        </div>
        <div className="blanket-body">{body}</div>
        <Center className="blanket-footer">
          <>
            {userActions.map(({ name, icon, onClick }) => (
              <Button
                key={name}
                rightIcon={icon}
                colorScheme="blue"
                variant="outline"
                onClick={onClick}
              >
                {name}
              </Button>
            ))}
          </>
        </Center>
      </div>
    );
  };

  const childrenClassName = cls("children", { hidden: isBlanketEnabled });

  return (
    <BlanketContext.Provider value={{ state, dispatch }}>
      <>
        {maybeRenderBlanket()}
        <div className={childrenClassName}>{children}</div>
      </>
    </BlanketContext.Provider>
  );
};

export default BlanketProvider;
