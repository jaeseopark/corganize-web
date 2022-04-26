import { ChakraProvider } from "@chakra-ui/react";

import BlanketProvider from "providers/blanket/blanket";
import BlanketPortal from "providers/blanket/portal";
import FileRepositoryProvider from "providers/fileRepository/fileRepository";
import ToastPortal from "providers/toast/portal";
import ToastProvider from "providers/toast/toast";

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
  <FileRepositoryProvider>
    <ChakraProvider>
      <ToastProvider>
        <BlanketProvider>
          <App />
        </BlanketProvider>
      </ToastProvider>
    </ChakraProvider>
  </FileRepositoryProvider>
);

export default AppWithProviders;
