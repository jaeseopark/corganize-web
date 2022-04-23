import { ChakraProvider } from "@chakra-ui/react";
import { ToastProvider } from "react-toast-notifications";

import FileRepositoryProvider from "providers/fileRepository/fileRepository";
import BlanketProvider from "providers/blanket/blanket";

import FullscreenProvider from "providers/fullscreen/fullscreen";
import ToastPortal from "providers/toast/portal";
import BlanketPortal from "providers/blanket/portal";
import FullscreenPortal from "providers/fullscreen/portal";

import MainView from "components/standalone/MainView";

import "./App.scss";

const App = () => (
  <div>
    <FullscreenPortal />
    <ToastPortal />
    <BlanketPortal />
    <MainView />
  </div>
);

const AppWithProviders = () => (
  <FileRepositoryProvider>
    <ChakraProvider>
      <FullscreenProvider>
        <ToastProvider placement="bottom-left" autoDismiss={true} autoDismissTimeout={4000}>
          <BlanketProvider>
            <App />
          </BlanketProvider>
        </ToastProvider>
      </FullscreenProvider>
    </ChakraProvider>
  </FileRepositoryProvider>
);

export default AppWithProviders;
