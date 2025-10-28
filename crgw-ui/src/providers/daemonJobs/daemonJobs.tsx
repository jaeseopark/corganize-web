import React, { Dispatch, useEffect, useReducer } from "react";
import { io, Socket } from "socket.io-client";

import { DaemonJobProgress } from "typedefs/DaemonJobProgress";

type State = {
  progress: DaemonJobProgress;
  socket: Socket | null;
};

type Action =
  | { type: "SET_PROGRESS"; payload: DaemonJobProgress }
  | { type: "SET_SOCKET"; payload: Socket | null };

const initialState: State = {
  progress: {},
  socket: null,
};

export const DaemonJobs = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({
  state: initialState,
});

const daemonJobsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PROGRESS":
      return {
        ...state,
        progress: action.payload,
      };
    case "SET_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };
    default:
      return state;
  }
};

const DaemonJobsProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(daemonJobsReducer, initialState);

  useEffect(() => {
    // Connect to the WebSocket
    const socket = io("/api", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to daemon jobs WebSocket");
    });

    socket.on("progress_update", (progress: DaemonJobProgress) => {
      dispatch({ type: "SET_PROGRESS", payload: progress });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from daemon jobs WebSocket");
    });

    dispatch({ type: "SET_SOCKET", payload: socket });

    return () => {
      socket.disconnect();
    };
  }, []);

  const value = {
    state,
    dispatch,
  };

  return <DaemonJobs.Provider value={value}>{children}</DaemonJobs.Provider>;
};

export default DaemonJobsProvider;