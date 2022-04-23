import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";

import { getPosixSeconds } from "utils/dateUtils";
import { Context, Toast, ToastType } from "./toast";

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
    const toast: Toast = {
      id: uuidv4().toString(),
      type,
      header,
      message,
      createdAt: getPosixSeconds(),
      onClick: onClick,
    };
    setTimeout(() => dispatch!({ type: "REMOVE", payload: toast.id }), duration);
    dispatch!({ type: "ADD", payload: toast });
  };

  const enqueueInfo = (props: EnqueueProps) => enqueueWithType({ ...props, type: "info" });
  const enqueueSuccess = (props: EnqueueProps) => enqueueWithType({ ...props, type: "success" });
  const enqueueWarning = (props: EnqueueProps) => enqueueWithType({ ...props, type: "warning" });
  const enqueueError = (props: EnqueueProps) => enqueueWithType({ ...props, type: "error" });

  return { toasts, enqueue: enqueueInfo, enqueueSuccess, enqueueWarning, enqueueError };
};
