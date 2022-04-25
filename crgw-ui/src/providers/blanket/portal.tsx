import { useMemo } from "react";
import { Button, Center } from "@chakra-ui/react";
import styled from "styled-components";

import { isHotkeyEnabled, useBlanket } from "./hook";

import "./blanket.scss";

const Header = () => {
  const { title } = useBlanket();
  return (
    <div className="blanket-header">
      <label className="blanket-title">{title}</label>
    </div>
  );
};

const Body = () => {
  const { title, body } = useBlanket();
  // const memoizedBody = useMemo(() => body, [title]);
  return <StyledBlanketBody>{body}</StyledBlanketBody>;
};

const Footer = () => {
  const { userActions } = useBlanket();
  return (
    <Center className="blanket-footer">
      {userActions.map(({ name, icon, onClick }) => (
        <Button key={name} rightIcon={icon} colorScheme="blue" variant="outline" onClick={onClick}>
          {name}
        </Button>
      ))}
    </Center>
  );
};

const BlanketPortal = () => {
  const { isBlanketEnabled, exitBlanket } = useBlanket();

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
      <Header />
      <Body />
      <Footer />
    </div>
  );
};

export default BlanketPortal;

const StyledBlanketBody = styled.div`
  display: flex;
  overflow-y: scroll;
  flex-direction: column;
  flex-grow: 1;
`;
