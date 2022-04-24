import store from "redux/store";
import { Provider as ReduxProvider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";

import BlanketPortal from "components/portals/blanket";
import MainView from "components/standalone/MainView";

import "./App.scss";
import ToastPortal from "components/portals/toast";

const App = () => (
  <div>
    <ToastPortal />
    <BlanketPortal />
    <MainView />
  </div>
);

const AppWithProviders = () => (
  <ReduxProvider store={store}>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </ReduxProvider>
);

export default AppWithProviders;
