import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Center, HStack, IconButton } from "@chakra-ui/react";

import { useGrid } from "providers/grid/hook";

const PageControl = () => {
  const {
    pageProps: { index, maxIndex, canIncrement, canDecrement, incrementPage, decrementPage },
  } = useGrid();

  return (
    <Center className="page-control">
      <HStack>
        <IconButton
          colorScheme="blue"
          aria-label="Decrement"
          onClick={decrementPage}
          disabled={!canDecrement}
          icon={<ArrowBackIcon />}
        />
        <label>
          Page {index + 1} / {maxIndex + 1}
        </label>
        <IconButton
          colorScheme="blue"
          aria-label="Increment"
          onClick={incrementPage}
          disabled={!canIncrement}
          icon={<ArrowForwardIcon />}
        />
      </HStack>
    </Center>
  );
};

export default PageControl;
