import cls from "classnames";

import { useBlanket } from "../../providers/Blanket";
import TableView from "./table/TableView";

// TODO
const BurgerMenuSpacer = () => <div />;
const BurgerMenu = () => <div />;
const GlobalSearch = () => <div />;

const MainView = () => {
  const { isBlanketEnabled: isBlanketEnalbed } = useBlanket();

  const maybeRenderBurgerMenu = () => {
    if (isBlanketEnalbed) return null;
    return <BurgerMenu />;
  };

  const renderMainView = () => (
    <div className={cls("mainview", { hidden: isBlanketEnalbed })}>
      <BurgerMenuSpacer />
      <GlobalSearch />
      <TableView />
    </div>
  );

  return (
    <>
      {maybeRenderBurgerMenu()}
      {renderMainView()}
    </>
  );
};

export default MainView;
