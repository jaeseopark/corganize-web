import { useEffect } from "react";
import cls from "classnames";

import { useBlanket } from "hooks/useBlanket";
import GridProvider from "providers/grid/grid";
import GridView from "./grid/GridView";

// TODO
const SelfClosingBurgerMenu = () => <div />;

const MainView = () => {
  const { isBlanketEnabled } = useBlanket();

  useEffect(() => {}, []);

  return (
    <div className={cls("main-view", { hidden: isBlanketEnabled })}>
      <SelfClosingBurgerMenu />
      <GridProvider>
        <GridView />
      </GridProvider>
    </div>
  );
};

export default MainView;
