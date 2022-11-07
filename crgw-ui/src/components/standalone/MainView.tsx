import { Center, Divider, Heading } from "@chakra-ui/react";
import cls from "classnames";
import { useEffect, useState } from "react";

import { SessionInfo } from "typedefs/Session";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";
import { useToast } from "providers/toast/hook";

import { useNavv } from "hooks/navv";

import { backup, getRemainingSpace } from "clients/corganize";

import { toHumanFileSize } from "utils/numberUtils";

import AppRoutes from "components/standalone/AppRoutes";
import SessionConfigurer from "components/standalone/SessionConfigurer";
import FieldBar from "components/standalone/field/FieldBar";
import PresetBar from "components/standalone/field/PresetBar";
import GlobalSearch from "components/standalone/grid/GlobalSearch";
import GridView from "components/standalone/grid/GridView";
import PageControl from "components/standalone/grid/PageControl";

import "./MainView.scss";

const MainView = () => {
  const { startSession } = useFileRepository();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const [remainingSpace, setRemainingSpace] = useState(0);
  const { files } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { navTagReport } = useNavv();
  const {
    fileProps: { setFiles: setGridFiles },
  } = useGrid();
  const { enqueueAsync, enqueueSuccess } = useToast();

  useEffect(() => {
    getRemainingSpace().then(setRemainingSpace);
  }, []);

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

  const backupThenShowToast = () =>
    enqueueAsync({ header: "Backup", message: "Initializing..." })
      .then(backup)
      .then(() => enqueueSuccess({ header: "Backup", message: "Done" }));

  let mainContent;

  if (!sessionInfo) {
    mainContent = (
      <Center flexDirection="column" className="presession">
        <SessionConfigurer setInfo={setSessionInfo} />
        <Center>
          <Heading className="button first clickable" onClick={navTagReport} size="md">
            Manage Tags
          </Heading>
          <Heading className="button clickable" onClick={backupThenShowToast} size="md">
            Backup
          </Heading>
        </Center>
        <Center>Remaining: {toHumanFileSize(remainingSpace)}</Center>
      </Center>
    );
  } else {
    mainContent = (
      <div className="session-wrapper">
        <PresetBar />
        <Divider marginY=".5em" />
        <FieldBar />
        <GlobalSearch />
        <PageControl />
        <GridView />
        <PageControl />
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <div className={cls("main-view", { hidden: isBlanketEnabled })}>{mainContent}</div>
    </>
  );
};

export default MainView;
