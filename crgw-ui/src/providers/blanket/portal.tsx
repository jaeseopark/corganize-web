import { Button, Center, HStack } from "@chakra-ui/react";
import { StringParam, useQueryParam } from "use-query-params";

import { isHotkeyEnabled, useBlanket } from "providers/blanket/hook";

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
  const [, setTargetedId] = useQueryParam("id", StringParam);

  if (!isBlanketEnabled) {
    return null;
  }

  const handleKey = (key: string) => {
    if (key === "q") {
      exitBlanket();
      setTargetedId(null);
    }
  };

  return (
    <div
      className="blanket-portal"
      onKeyDown={(e) => {
        if (!isHotkeyEnabled || e.shiftKey || e.ctrlKey) return;
        handleKey(e.key.toLowerCase());
      }}
    >
      <Header />
      <Body />
      <Footer />
    </div>
  );
};

export default BlanketPortal;
