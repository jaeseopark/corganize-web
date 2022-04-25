import { CloseIcon, MinusIcon } from "@chakra-ui/icons";
import { BlanketContext, UserAction } from "providers/blanket/blanket";
import { useContext } from "react";

type SetBlanketProps = {
  title: string;
  body: JSX.Element;
  onClose?: () => void;
  userActions?: UserAction[];
};

export let isHotkeyEnabled = true;

export const useBlanket = () => {
  const {
    state: { title, body, onClose, userActions },
    dispatch,
  } = useContext(BlanketContext);
  const isBlanketEnabled = !!title && !!body;

  const setBlanket = ({ title, body, onClose, userActions }: SetBlanketProps) => {
    const defaultUserAction: UserAction = {
      name: "Close",
      icon: <CloseIcon />,
      onClick: () => dispatch!({ type: "UNSET" }),
    };

    const payload = {
      title,
      body,
      userActions: userActions || [defaultUserAction],
      onClose,
    };

    dispatch!({ type: "SET", payload });
  };

  const upsertUserAction = ({ name, icon, onClick }: UserAction) =>
    dispatch!({
      type: "UPSERT_USER_ACTION",
      payload: {
        name,
        onClick,
        icon: icon || <MinusIcon />,
      },
    });

  const exitBlanket = () => dispatch!({ type: "UNSET" });

  const enableHotkey = () => {
    isHotkeyEnabled = true;
  };

  const disableHotkey = () => {
    isHotkeyEnabled = false;
  };

  return {
    title,
    body,
    userActions,
    onClose,
    isBlanketEnabled,
    isHotkeyEnabled,
    setBlanket,
    exitBlanket,
    upsertUserAction,
    enableHotkey,
    disableHotkey,
  };
};
