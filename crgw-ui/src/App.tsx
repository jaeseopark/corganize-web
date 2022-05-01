import { ChakraProvider } from "@chakra-ui/react";
import {
  ExtendedStringifyOptions,
  QueryParamProvider,
  transformSearchStringJsonSafe,
} from "use-query-params";

import BlanketProvider from "providers/blanket/blanket";
import BlanketPortal from "providers/blanket/portal";
import FileRepositoryProvider from "providers/fileRepository/fileRepository";
import ToastPortal from "providers/toast/portal";
import ToastProvider from "providers/toast/toast";

import MainView from "components/standalone/MainView";

import "./App.scss";

const queryStringifyOptions: ExtendedStringifyOptions = {
  transformSearchString: transformSearchStringJsonSafe,
};

const App = () => (
  <div>
    <ToastPortal />
    <BlanketPortal />
    <MainView />
  </div>
);

const AppWithProviders = () => (
  <QueryParamProvider stringifyOptions={queryStringifyOptions}>
    <FileRepositoryProvider>
      <ChakraProvider>
        <ToastProvider>
          <BlanketProvider>
            <App />
          </BlanketProvider>
        </ToastProvider>
      </ChakraProvider>
    </FileRepositoryProvider>
  </QueryParamProvider>
);

export default AppWithProviders;
