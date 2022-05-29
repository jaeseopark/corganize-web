import { Button, Center, HStack } from "@chakra-ui/react";
import { useState } from "react";

import { isHotkeyProtected, useBlanket } from "providers/blanket/hook";

import { useNavv } from "hooks/navv";

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
  const { isBlanketEnabled } = useBlanket();
  const { navRoot } = useNavv();
  const [lastKey, setLastKey] = useState("");

  if (!isBlanketEnabled) {
    return null;
  }

  return (
    <div
      className="blanket-portal"
      onKeyDown={(e) => {
        const key = e.key.toLowerCase();

        if (!e.shiftKey && !e.ctrlKey && key === "q" && (!isHotkeyProtected || lastKey === "q")) {
          setLastKey("");
          return navRoot();
        }

        setLastKey(key);
      }}
    >
      <Header />
      <Body />
      <Footer />
    </div>
  );
};

export default BlanketPortal;
