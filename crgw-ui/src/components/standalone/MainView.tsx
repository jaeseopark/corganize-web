import { Divider } from "@chakra-ui/react";
import cls from "classnames";
import { useEffect, useState } from "react";
import { NavLink, Route } from "react-router-dom";
import styled from "styled-components";

import { SessionInfo } from "typedefs/Session";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import { useGrid } from "providers/grid/hook";

import { retrieveFiles } from "clients/adapter";

import AppRoutes from "components/standalone/AppRoutes";
import SessionConfigurer from "components/standalone/SessionConfigurer";
import FieldBar from "components/standalone/field/FieldBar";
import PresetBar from "components/standalone/field/PresetBar";
import GlobalSearch from "components/standalone/grid/GlobalSearch";
import GridView from "components/standalone/grid/GridView";
import PageControl from "components/standalone/grid/PageControl";

const MainView = () => {
  const { addFiles } = useFileRepository();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const { files } = useFileRepository();
  const { isBlanketEnabled } = useBlanket();
  const {
    fileProps: { setFiles: setGridFiles },
  } = useGrid();

  useEffect(() => {
    if (sessionInfo) {
      retrieveFiles(sessionInfo!, addFiles);
    }
  }, [sessionInfo]);

  useEffect(() => {
    if (files && files.length > 0) {
      setGridFiles(files);
    }
  }, [files]);

  if (!sessionInfo) {
    return <SessionConfigurer setInfo={setSessionInfo} />;
  }

  return (
    <>
      <AppRoutes />
      <StyledMainView className={cls("main-view", { hidden: isBlanketEnabled })}>
        <PresetBar />
        <Divider marginY=".5em" />
        <FieldBar />
        <GlobalSearch />
        <PageControl />
        <GridView />
        <PageControl />
      </StyledMainView>
    </>
  );
};

const StyledMainView = styled.div`
  margin: 1rem;
`;

export default MainView;
