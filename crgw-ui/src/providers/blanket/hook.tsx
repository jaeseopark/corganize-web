import { CloseIcon, MinusIcon } from "@chakra-ui/icons";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { BlanketContext, UserAction } from "providers/blanket/blanket";

import { RequireOnlyOne } from "utils/typeUtils";

import FileHeader from "components/reusable/FileHeader";

type SetBlanketProps = RequireOnlyOne<
  {
    title: string;
    fileid: string;
    body: JSX.Element;
    userActions?: UserAction[];
  },
  "title" | "fileid"
>;

export let isHotkeyEnabled = true;

export const useBlanket = () => {
  const {
    state: { title, body, userActions },
    dispatch,
  } = useContext(BlanketContext);
  const nagivate = useNavigate();

  const isBlanketEnabled = !!title && !!body;
  const exitBlanket = () => dispatch!({ type: "UNSET" });

  const setBlanket = ({ title, fileid, body, userActions }: SetBlanketProps) => {
    const defaultUserAction: UserAction = {
      name: "Close",
      icon: <CloseIcon />,
      onClick: () => {
        nagivate("/");
      },
    };

    const payload = {
      title: title || <FileHeader fileid={fileid!} />,
      body,
      userActions: userActions || [defaultUserAction],
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
    isBlanketEnabled,
    isHotkeyEnabled,
    setBlanket,
    exitBlanket,
    upsertUserAction,
    enableHotkey,
    disableHotkey,
  };
};
