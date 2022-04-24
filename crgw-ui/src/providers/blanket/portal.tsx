import { Box, Button, Center, Flex } from "@chakra-ui/react";

import { useBlanket } from "./hook";
import "./blanket.scss";

const BlanketPortal = () => {
  const { isBlanketEnabled, isHotkeyEnabled, exitBlanket, title, body, userActions } = useBlanket();

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
    <Flex direction="column" className="blanket-portal" onKeyDown={onKeyDown}>
      <Box className="blanket-header">
        <label className="blanket-title">{title}</label>
      </Box>
      <Box flex="1" className="blanket-body">
        {body}
      </Box>

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
    </Flex>
  );
};

export default BlanketPortal;
