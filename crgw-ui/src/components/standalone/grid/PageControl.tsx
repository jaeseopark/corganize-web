import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, HStack } from "@chakra-ui/react";
import { useGrid } from "hooks/useGrid";

const PageControl = () => {
  const {
    pageProps: {
      index,
      maxIndex,
      canIncrement,
      canDecrement,
      incrementPage,
      decrementPage,
    },
  } = useGrid();

  return (
    <HStack>
      <Button
        rightIcon={<ArrowBackIcon />}
        colorScheme="blue"
        variant="outline"
        onClick={decrementPage}
        disabled={!canDecrement}
      />
      <label>
        Page {index + 1} / {maxIndex + 1}
      </label>
      <Button
        rightIcon={<ArrowForwardIcon />}
        colorScheme="blue"
        variant="outline"
        onClick={incrementPage}
        disabled={!canIncrement}
      />
    </HStack>
  );
};

export default PageControl;
