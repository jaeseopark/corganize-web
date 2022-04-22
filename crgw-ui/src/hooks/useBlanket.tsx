import { CloseIcon } from "@chakra-ui/icons";
import { BlanketContext, UserAction } from "providers/blanket";
import { useContext } from "react";

type SetBlanketProps = {
  title: string;
  body: JSX.Element;
  onClose?: () => void;
  keepPrevOnClose?: boolean
};

export const useBlanket = () => {
  const {
    state: { title, body, onClose: prevOnClose },
    dispatch,
  } = useContext(BlanketContext);
  const isBlanketEnabled = !!title && !!body;

  const setBlanket = ({ title, body, onClose, keepPrevOnClose }: SetBlanketProps) => {
    const defaultUserAction: UserAction = {
      name: "Close",
      icon: <CloseIcon />,
      onClick: () => dispatch!({ type: "UNSET" }),
    };

    const payload = {
      title,
      body,
      userActions: [defaultUserAction],
      onClose: keepPrevOnClose ? prevOnClose : onClose,
    };

    dispatch!({ type: "SET", payload });
  };

  const addUserAction = (ua: UserAction) => dispatch!({ type: "ADD_USER_ACTION", payload: ua });

  const exitBlanket = () => dispatch!({ type: "UNSET" });

  const enableHotkey = () => dispatch!({ type: "SET_HOTKEY", payload: true });
  const disableHotkey = () => dispatch!({ type: "SET_HOTKEY", payload: false });

  return {
    isBlanketEnabled,
    setBlanket,
    exitBlanket,
    addUserAction,
    enableHotkey,
    disableHotkey,
  };
};
