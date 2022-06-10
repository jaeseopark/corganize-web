import { Center, Divider, Flex, Heading } from "@chakra-ui/react";
import cls from "classnames";
import { useEffect } from "react";

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

import "./MainView.scss";

const MainView = () => {
  const { startSession } = useFileRepository();
  const { files } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const { navTagReport } = useNavv();
  const {
    fileProps: { files: gridFiles, setFiles: setGridFiles },
  } = useGrid();
  const hasSessionStarted = gridFiles.length > 0;

  useEffect(() => {
    if (files.length > 0) {
      setGridFiles(files);
    }
  }, [files]);

  const MainContent = () => {
    if (!hasSessionStarted) {
      return (
        <Center className="presession">
          <Flex direction="column">
            <SessionConfigurer setInfo={startSession} />
            <Center className="button clickable" onClick={navTagReport}>
              <Heading size="md">Manage Tags</Heading>
            </Center>
          </Flex>
        </Center>
      );
    }

    return (
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
  };

  return (
    <>
      <AppRoutes />
      <div className={cls("main-view", { hidden: isBlanketEnabled })}>
        <MainContent />
      </div>
    </>
  );
};

export default MainView;
