import cls from "classnames";
import styled from "styled-components";

import { useBlanket } from "hooks/useBlanket";
import GridProvider from "providers/grid/grid";
import GridView from "./grid/GridView";

const SelfClosingBurgerMenu = () => <div />;

const MainView = () => {
  const { isBlanketEnabled } = useBlanket();

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
