import { CloseIcon } from "@chakra-ui/icons";
import FileView from "components/standalone/FileView";
import { BlanketContext, UserAction } from "providers/blanket";
import { useContext } from "react";
import { CorganizeFile } from "typedefs/CorganizeFile";

type Setter = (
  title: JSX.Element | string,
  body: JSX.Element,
  userActions?: UserAction[]
) => void;

export const useBlanket = () => {
  const {
    state: { title, body },
    dispatch,
  } = useContext(BlanketContext);
  const isBlanketEnabled = !!title && !!body;

  const setBlanket: Setter = (title, body, userActions = []) => {
    const defaultUserAction: UserAction = {
      name: "Close",
      icon: <CloseIcon />,
      onClick: () => dispatch!({ type: "UNSET" }),
    };

    const payload = {
      title: typeof title === "string" ? <span>{title}</span> : title,
      body,
      userActions: [defaultUserAction, ...userActions],
    };

    dispatch!({ type: "SET", payload });
  };

  const addUserAction = (ua: UserAction) =>
    dispatch!({ type: "ADD_USER_ACTION", payload: ua });

  const exitBlanket = () => dispatch!({ type: "UNSET" });

  const openFile = (f: CorganizeFile) =>
    setBlanket(f.filename, <FileView fileid={f.fileid} />);

  const enableHotkey = () => dispatch!({ type: "SET_HOTKEY", payload: true });
  const disableHotkey = () => dispatch!({ type: "SET_HOTKEY", payload: false });

  return {
    isBlanketEnabled,
    setBlanket,
    exitBlanket,
    addUserAction,
    enableHotkey,
    disableHotkey,
    openFile,
  };
};
