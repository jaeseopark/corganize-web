import { CloseIcon, MinusIcon } from "@chakra-ui/icons";
import { useCallback, useContext, useMemo } from "react";
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

export let isHotkeyProtected = false;

export const useBlanket = () => {
  const {
    state: { title, body, userActions },
    dispatch,
  } = useContext(BlanketContext);
  const navigate = useNavigate();

  const isBlanketEnabled = useMemo(() => !!title && !!body, [title, body]);
  const exitBlanket = useCallback(() => dispatch!({ type: "UNSET" }), [dispatch]);

  const setBlanket = useCallback(
    ({ title, fileid, body, userActions }: SetBlanketProps) => {
      const defaultUserAction: UserAction = {
        name: "Close",
        icon: <CloseIcon />,
        onClick: () => navigate("/"),
      };

      const payload = {
        title: title || <FileHeader fileid={fileid!} />,
        body,
        userActions: userActions || [defaultUserAction],
      };

      dispatch!({ type: "SET", payload });
    },
    [dispatch, navigate],
  );

  const upsertUserAction = useCallback(
    ({ name, icon, onClick }: UserAction) =>
      dispatch!({
        type: "UPSERT_USER_ACTION",
        payload: {
          name,
          onClick,
          icon: icon || <MinusIcon />,
        },
      }),
    [dispatch],
  );

  const protectHotkey = useCallback(() => {
    isHotkeyProtected = true;
  }, []);

  const exposeHotkey = useCallback(() => {
    isHotkeyProtected = false;
  }, []);

  return {
    title,
    body,
    userActions,
    isBlanketEnabled,
    isHotkeyProtected,
    setBlanket,
    exitBlanket,
    upsertUserAction,
    protectHotkey,
    exposeHotkey,
  };
};
