import { ChakraProvider } from "@chakra-ui/react";

import MainView from "components/standalone/MainView";
import FileRepositoryProvider from "providers/fileRepository";
import BlanketProvider from "providers/blanket";

import "./App.scss";

const App = () => (
  <BlanketProvider>
    <FileRepositoryProvider>
      <MainView />
    </FileRepositoryProvider>
  </BlanketProvider>
);

const ChakraApp = () => (
  <ChakraProvider>
    <App />
  </ChakraProvider>
);

export default ChakraApp;
