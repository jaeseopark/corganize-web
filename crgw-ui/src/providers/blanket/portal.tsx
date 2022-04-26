import { Button, Center, HStack } from "@chakra-ui/react";

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
  const { body } = useBlanket();
  return <div className="blanket-body">{body}</div>;
};

const Footer = () => {
  const { userActions } = useBlanket();
  return (
    <Center className="blanket-footer">
      <HStack spacing=".5em">
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
      </HStack>
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
