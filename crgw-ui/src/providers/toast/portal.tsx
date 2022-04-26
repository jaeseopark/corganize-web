import { useEffect } from "react";
import cls from "classnames";
import { useUpdate } from "react-use";
import { Flex, Spacer } from "@chakra-ui/react";

import { Toast } from "./toast";
import { useToast } from "./hook";

import { toRelativeHumanTime } from "utils/numberUtils";

import "./toast.scss";

const TimeCounter = ({ created }: { created: number }) => {
  const rerender = useUpdate();

  useEffect(() => {
    const iid = setInterval(() => rerender(), 100);
    return () => clearInterval(iid);
  }, []);
  return <small>{toRelativeHumanTime(created)} ago</small>;
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
