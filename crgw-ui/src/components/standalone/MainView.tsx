import cls from "classnames";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { SessionInfo } from "typedefs/Session";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";
import GridProvider from "providers/grid/grid";

import { retrieveFiles } from "clients/adapter";

import SessionConfigurer from "components/standalone/SessionConfigurer";
import GridView from "components/standalone/grid/GridView";

const SelfClosingBurgerMenu = () => <div />;

const MainView = () => {
  const { isBlanketEnabled } = useBlanket();
  const { addFiles } = useFileRepository();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();

  useEffect(() => {
    if (sessionInfo) {
      retrieveFiles(sessionInfo!, addFiles);
    }
  }, [sessionInfo]);

  if (!sessionInfo) {
    return <SessionConfigurer setInfo={setSessionInfo} />;
  }

  return (
    <StyledMainView className={cls({ hidden: isBlanketEnabled })}>
      <SelfClosingBurgerMenu />
      <GridProvider>
        <GridView />
      </GridProvider>
    </StyledMainView>
  );
};

export default MainView;

const StyledMainView = styled.div`
  margin: 1rem;
`;
