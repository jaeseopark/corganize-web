import { SettingsIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Divider } from "@chakra-ui/react";
import cls from "classnames";
import { useEffect, useState } from "react";

import { SessionInfo } from "typedefs/Session";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";

import { useNavv } from "hooks/navv";

import AppRoutes from "components/standalone/AppRoutes";
import SessionConfigurer from "components/standalone/SessionConfigurer";
import FieldBar from "components/standalone/field/FieldBar";
import PresetBar from "components/standalone/field/PresetBar";
import GlobalSearch from "components/standalone/grid/GlobalSearch";
import GridView from "components/standalone/grid/GridView";
import PageControl from "components/standalone/grid/PageControl";

const MainView = () => {
  const { startSession } = useFileRepository();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const { files } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { navToAdmin } = useNavv();
  const {
    fileProps: { setFiles: setGridFiles },
  } = useGrid();

  useEffect(() => {
    if (sessionInfo) {
      startSession(sessionInfo);
    }
  }, [sessionInfo]);

  useEffect(() => {
    if (files.length > 0) {
      setGridFiles(files);
    }
  }, [files]);

  let mainContent;

  if (!sessionInfo) {
    mainContent = (
      <Center height="100vh" flexDir="column">
        <SessionConfigurer setInfo={setSessionInfo} />
        <Button leftIcon={<SettingsIcon />} onClick={navToAdmin} marginTop="1em">
          Admin
        </Button>
      </Center>
    );
  } else {
    mainContent = (
      <Box margin="1rem">
        <PresetBar />
        <Divider marginY=".5em" />
        <FieldBar />
        <GlobalSearch />
        <PageControl />
        <GridView />
        <PageControl />
      </Box>
    );
  }

  return (
    <>
      <AppRoutes />
      <div className={cls({ hidden: isBlanketEnabled })}>{mainContent}</div>
    </>
  );
};

export default MainView;
