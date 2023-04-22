import { ChakraProvider } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import BlanketProvider from "providers/blanket/blanket";
import BlanketPortal from "providers/blanket/portal";
import FileRepositoryProvider from "providers/fileRepository/fileRepository";
import GridProvider from "providers/grid/grid";
import ToastPortal from "providers/toast/portal";
import ToastProvider from "providers/toast/toast";

import MainView from "components/standalone/MainView";

import "./App.scss";

const OAUTH_CLIENT_ID = "688638489712-l06b3q32dbrpv6m5uo170l4c4u5gmk7j.apps.googleusercontent.com";

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
          <GridProvider>
            <GoogleOAuthProvider clientId={OAUTH_CLIENT_ID}>
              <App />
            </GoogleOAuthProvider>
          </GridProvider>
        </BlanketProvider>
      </ToastProvider>
    </ChakraProvider>
  </FileRepositoryProvider>
);

export default AppWithProviders;
