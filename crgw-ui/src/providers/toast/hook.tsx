import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";

import { Context, Toast, ToastType } from "providers/toast/toast";

import { getPosixSeconds } from "utils/dateUtils";

const DEFAULT_DELAY = 4000;

type EnqueueProps = {
  header?: string;
  message: string;
  duration?: number;
  onClick?: () => void;
};

export const useToast = () => {
  const {
    state: { toasts },
    dispatch,
  } = useContext(Context);

  const enqueueWithType = ({
    header = "Corganize",
    message,
    type = "info",
    duration = DEFAULT_DELAY,
    onClick,
  }: EnqueueProps & {
    type?: ToastType;
  }) => {
    const toastId = uuidv4().toString();
    const close = () => dispatch!({ type: "REMOVE", payload: toastId });
    const toast: Toast = {
      id: toastId,
      type,
      header,
      message,
      createdAt: getPosixSeconds(),
      onClick: onClick || close,
    };
    setTimeout(close, duration);
    dispatch!({ type: "ADD", payload: toast });
  };

  const enqueueInfo = (props: EnqueueProps) => enqueueWithType({ ...props, type: "info" });
  const enqueueSuccess = (props: EnqueueProps) => enqueueWithType({ ...props, type: "success" });
  const enqueueWarning = (props: EnqueueProps) => enqueueWithType({ ...props, type: "warning" });
  const enqueueError = (props: EnqueueProps) => enqueueWithType({ ...props, type: "error" });

  return {
    toasts,
    enqueue: enqueueInfo,
    enqueueSuccess,
    enqueueWarning,
    enqueueError,
  };
};
