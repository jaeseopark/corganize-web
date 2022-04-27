import { Flex, Spacer } from "@chakra-ui/react";
import cls from "classnames";
import { useEffect, useState } from "react";

import { useToast } from "providers/toast/hook";
import { Toast } from "providers/toast/toast";

import { toRelativeHumanTime } from "utils/numberUtils";

import "./toast.scss";

const TIMER_REFRESH_INTERVAL = 500;

const TimeCounter = ({ created }: { created: number }) => {
  const [timeString, setTimeString] = useState<string>();

  useEffect(() => {
    const iid = setInterval(() => {
      const newTimeString = toRelativeHumanTime(created) + " ago";
      setTimeString(newTimeString);
    }, TIMER_REFRESH_INTERVAL);
    return () => clearInterval(iid);
  }, []);

  if (!timeString) return null;

  return <small>{timeString}</small>;
};

const ToastComponent = ({ header, type, message, onClick, createdAt }: Toast) => (
  <div className="clickable toast" onClick={onClick}>
    <Flex className="toast-header">
      <label className={cls(type, "toast-header-label")}>{header}</label>
      <Spacer />
      <TimeCounter created={createdAt} />
    </Flex>
    <div className="toast-body">{message}</div>
  </div>
);

const ToastPortal = () => {
  const { toasts } = useToast();
  return (
    <div className="toast-portal">
      {toasts.map((t) => (
        <ToastComponent key={t.id} {...t} />
      ))}
    </div>
  );
};

export default ToastPortal;
