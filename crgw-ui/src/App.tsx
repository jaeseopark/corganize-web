import store from "redux/store";
import { Provider as ReduxProvider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";

import BlanketProvider from "providers/blanket/blanket";
import ToastProvider from "providers/toast/toast";
import BlanketPortal from "providers/blanket/portal";

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
        <BlanketProvider>
          <App />
        </BlanketProvider>
      </ToastProvider>
    </ChakraProvider>
  </ReduxProvider>
);

export default AppWithProviders;
