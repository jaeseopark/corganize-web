import { SettingsIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Divider } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import cls from "classnames";
import { useCallback, useEffect, useState } from "react";

import { SessionInfo } from "typedefs/Session";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";

import useAthentication from "hooks/authentication";
import { useNavv } from "hooks/navv";

import { login } from "clients/corganize";
import { populateGlobalTags } from "clients/adapter";

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
  const [globalTagsLoaded, setGlobalTagsLoaded] = useState(false);
  const { files } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { navToAdmin } = useNavv();
  const isAuthenticated = useAthentication();
  const {
    fileProps: { setFiles: setGridFiles },
  } = useGrid();

  useEffect(() => {
    if (isAuthenticated) {
      populateGlobalTags().then(() => setGlobalTagsLoaded(true));
    }
  }, [isAuthenticated]);

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

  const getMainContent = () => {
    if (!isAuthenticated) {
      return (
        <Center height="100vh" flexDir="column">
          <GoogleLogin onSuccess={({ credential }) => login(credential!)} />
        </Center>
      );
    }

    if (sessionInfo) {
      // When authenticated and sessionInfo exists, show the main grid view
      return (
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

    if (!globalTagsLoaded) {
      return (
        <Center height="100vh" flexDir="column">
          Loading...
        </Center>
      );
    }

    // let the user configure the session info
    return (
      <Center height="100vh" flexDir="column">
        <SessionConfigurer setInfo={setSessionInfo} />
        <Button
          leftIcon={<SettingsIcon />}
          onClick={navToAdmin}
          marginTop="1em"
        >
          Admin
        </Button>
      </Center>
    );
  }

  return (
    <>
      <AppRoutes />
      <div className={cls({ hidden: isBlanketEnabled })}>{getMainContent()}</div>
    </>
  );
};

export default MainView;
