import {
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import { useBlanket } from "providers/blanket/hook";

import ScrapePanel from "components/standalone/scrape/ScrapePanel";

const LauncherBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setBlanket } = useBlanket();

  const openScrape = () => {
    onClose();
    // TODO open scrape
  };

  return (
    <Center flex={0}>
      <Button colorScheme="blue" onClick={onOpen}>
        Open
      </Button>
      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Actions</DrawerHeader>
          <DrawerBody>
            <div className="launcher-buttons">
              <Button onClick={openScrape}>Scrape</Button>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Center>
  );
};

export default LauncherBar;
