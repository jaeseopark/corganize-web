import { CloseIcon, MinusIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { clear, set, addUserAction as addUserActionnn, UserAction } from "redux/blanket";
import { RootState } from "redux/store";

type SetBlanketProps = {
  title: string;
  body: JSX.Element;
  onClose?: () => void;
  userActions?: UserAction[];
};

export let isHotkeyEnabled = true;

export const useBlanket = () => {
  const dispatch = useDispatch();
  const {
    blanket: { title, body, onClose, userActions },
  } = useSelector((state: RootState) => state.blanket);

  const isBlanketEnabled = !!title && !!body;

  const exitBlanket = () => dispatch(clear());

  const setBlanket = ({ title, body, onClose, userActions }: SetBlanketProps) => {
    const defaultUserAction: UserAction = {
      name: "Close",
      icon: <CloseIcon />,
      onClick: exitBlanket,
    };

    const payload = {
      title,
      body,
      userActions: userActions || [defaultUserAction],
      onClose,
    };

    dispatch(set(payload));
  };

  const addUserAction = ({ name, icon, onClick }: UserAction) =>
    dispatch(
      addUserActionnn({
        name,
        onClick,
        icon: icon || <MinusIcon />,
      })
    );

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
    addUserAction,
    enableHotkey,
    disableHotkey,
  };
};
