import styled from "styled-components";
import { Button, Center } from "@chakra-ui/react";

import { isHotkeyEnabled, useBlanket } from "./hook";

import "./blanket.scss";

const BlanketPortal = () => {
  const { isBlanketEnabled, exitBlanket, title, body, userActions } = useBlanket();

  if (!isBlanketEnabled) {
    return null;
  }

  const onKeyDown = (e: any) => {
    if (!isHotkeyEnabled) {
      return;
    }

    const key = e.key.toLowerCase();
    if (key === "q") {
      exitBlanket();
    }
  };

  return (
    <div className="blanket-portal" onKeyDown={onKeyDown}>
      <div className="blanket-header">
        <label className="blanket-title">{title}</label>
      </div>
      <BlanketBody>{body}</BlanketBody>
      <Center className="blanket-footer">
        {userActions.map(({ name, icon, onClick }) => (
          <Button
            key={name}
            rightIcon={icon}
            colorScheme="blue"
            variant="outline"
            onClick={onClick}
          >
            {name}
          </Button>
        ))}
      </Center>
    </div>
  );
};

export default BlanketPortal;

const BlanketBody = styled.div`
  display: flex;
  overflow-y: scroll;
  flex-direction: column;
  flex-grow: 1;
`;
