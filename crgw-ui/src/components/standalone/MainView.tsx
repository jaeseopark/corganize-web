import cls from "classnames";
import styled from "styled-components";

import { useBlanket } from "providers/blanket/hook";
import GridProvider from "providers/grid/grid";
import GridView from "./grid/GridView";
import { useEffect, useState } from "react";
import { SessionInfo } from "typedefs/Session";
import { retrieveFiles } from "clients/adapter";
import { useFileRepository } from "providers/fileRepository/hook";
import SessionConfigurer from "./SessionConfigurer";

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
