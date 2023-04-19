import {
  Box,
  Button,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { PopoverArrow, PopoverBody, PopoverCloseButton } from "@chakra-ui/react";

import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { backup } from "clients/corganize";

import Retagger from "components/reusable/Retagger";

import LocalFileReport from "./LocalFileReport";
import LiteralScrapePanel from "./scrape/LiteralScrapePanel";

import "./AdminView.scss";

const AdminView = () => {
  const { enqueueSuccess, enqueueAsync } = useToast();
  const { navRoot } = useNavv();
  const {
    isOpen: isLocalFileReportOpen,
    onOpen: onLocalFileReportOpen,
    onClose: onLocalFileReportClose,
  } = useDisclosure();
  const {
    isOpen: isRetaggerOpen,
    onOpen: onRetaggerOpen,
    onClose: onRetaggerClose,
  } = useDisclosure();

  const backupThenShowToast = () =>
    enqueueAsync({ header: "Backup", message: "Initializing..." })
      .then(backup)
      .then(() => enqueueSuccess({ header: "Backup", message: "Done" }));

  return (
    <div className="admin-view">
      <VStack>
        <HStack borderWidth="1px" borderRadius="lg" padding="2em" width="100%">
          <Button onClick={navRoot}>Back to Root</Button>
          <Button onClick={backupThenShowToast}>Backup</Button>
          <Popover isOpen={isLocalFileReportOpen} onClose={onLocalFileReportClose}>
            <PopoverTrigger>
              <Button onClick={onLocalFileReportOpen}>Local File Report</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <LocalFileReport />
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Popover isOpen={isRetaggerOpen} onClose={onRetaggerClose} closeOnBlur={false}>
            <PopoverTrigger>
              <Button onClick={onRetaggerOpen}>Retagger</Button>
            </PopoverTrigger>
            <PopoverContent width="100%">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>{isRetaggerOpen && <Retagger />}</PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
        <Box borderWidth="1px" borderRadius="lg" padding="2em" width="100%" height="500px">
          <LiteralScrapePanel />
        </Box>
      </VStack>
    </div>
  );
};

export default AdminView;
