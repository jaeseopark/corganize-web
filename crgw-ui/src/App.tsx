import { ChakraProvider } from "@chakra-ui/react";

import MainView from "components/standalone/MainView";
import FileRepositoryProvider from "providers/FileRepository";
import BlanketProvider from "providers/Blanket";

import "./App.css";

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
