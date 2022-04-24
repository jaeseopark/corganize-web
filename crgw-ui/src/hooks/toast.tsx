import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";

import { v4 as uuidv4 } from "uuid";

import { getPosixSeconds } from "utils/dateUtils";
import { add, CorganizeToast, remove, ToastType } from "redux/toast";

const DEFAULT_DELAY = 4000;

type EnqueueProps = {
  header?: string;
  message: string;
  duration?: number;
  onClick?: () => void;
};

export const useToast = () => {
  const dispatch = useDispatch();
  const { toasts } = useSelector((state: RootState) => state.toast);

  const enqueueWithType = ({
    header = "Corganize",
    message,
    type = "info",
    duration = DEFAULT_DELAY,
    onClick,
  }: EnqueueProps & {
    type?: ToastType;
  }) => {
    const toast: CorganizeToast = {
      id: uuidv4().toString(),
      type,
      header,
      message,
      createdAt: getPosixSeconds(),
      onClick: onClick,
    };
    setTimeout(() => dispatch(remove(toast.id)), duration);
    dispatch(add(toast));
  };

  const enqueueInfo = (props: EnqueueProps) => enqueueWithType({ ...props, type: "info" });
  const enqueueSuccess = (props: EnqueueProps) => enqueueWithType({ ...props, type: "success" });
  const enqueueWarning = (props: EnqueueProps) => enqueueWithType({ ...props, type: "warning" });
  const enqueueError = (props: EnqueueProps) => enqueueWithType({ ...props, type: "error" });

  return { toasts, enqueue: enqueueInfo, enqueueSuccess, enqueueWarning, enqueueError };
};
