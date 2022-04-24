import store from "redux/store";
import { Provider as ReduxProvider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";

import ToastProvider from "providers/toast/toast";
import BlanketPortal from "components/portals/blanket";
import ToastPortal from "providers/toast/portal";
import MainView from "components/standalone/MainView";

import "./App.scss";

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
      <ToastProvider>
        <App />
      </ToastProvider>
    </ChakraProvider>
  </ReduxProvider>
);

export default AppWithProviders;
