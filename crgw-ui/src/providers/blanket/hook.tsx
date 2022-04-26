import { CloseIcon, MinusIcon } from "@chakra-ui/icons";
import FileHeader from "components/reusable/FileHeader";
import { BlanketContext, UserAction } from "providers/blanket/blanket";
import { useContext } from "react";
import { RequireOnlyOne } from "utils/typeUtils";

type SetBlanketProps = RequireOnlyOne<
  {
    title: string;
    fileid: string;
    body: JSX.Element;
    onClose?: () => void;
    userActions?: UserAction[];
  },
  "title" | "fileid"
>;

export let isHotkeyEnabled = true;

export const useBlanket = () => {
  const {
    state: { title, body, onClose, userActions },
    dispatch,
  } = useContext(BlanketContext);
  const isBlanketEnabled = !!title && !!body;

  const setBlanket = ({ title, fileid, body, onClose, userActions }: SetBlanketProps) => {
    const defaultUserAction: UserAction = {
      name: "Close",
      icon: <CloseIcon />,
      onClick: () => dispatch!({ type: "UNSET" }),
    };

    const payload = {
      title: title || <FileHeader fileid={fileid!} />,
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
