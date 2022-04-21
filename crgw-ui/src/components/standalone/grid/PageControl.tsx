import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { HStack, IconButton } from "@chakra-ui/react";
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
      <IconButton
        colorScheme='blue'
        aria-label='Decrement'
        onClick={decrementPage}
        disabled={!canDecrement}
        icon={<ArrowBackIcon />}
      />
      <label>
        Page {index + 1} / {maxIndex + 1}
      </label>
      <IconButton
        colorScheme='blue'
        aria-label='Increment'
        onClick={incrementPage}
        disabled={!canIncrement}
        icon={<ArrowForwardIcon />}
      />
    </HStack>
  );
};

export default PageControl;
