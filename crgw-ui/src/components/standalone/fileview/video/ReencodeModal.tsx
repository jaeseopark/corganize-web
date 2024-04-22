import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Table,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";
import cls from "classnames";
import { useState } from "react";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import "./ReencodeModal.scss";

const DEFAULT_CRF = 25;
const DEFAULT_MIN_CRF = 18;
const DEFAULT_MAX_CRF = 28;
const DEFAULT_MIN_RES = 100; // short side
const DEFAULT_MAX_RES = 1080; // short side
const DEFAULT_SPEED = 1;
const MIN_SPEED = 1;
const MAX_SPEED = 10;

const nearestEvenNumber = (n: number) => Math.round(n / 2) * 2;

const getAspectRatio = (dimensions: number[]) => {
  const sortedDimensions = [...dimensions].sort((a, b) => a - b);
  return sortedDimensions[1] / sortedDimensions[0];
};

const AspectRatio = ({
  dimensions,
  showDimensions,
  showAspectRatio,
}: {
  dimensions: number[];
  showDimensions?: boolean;
  showAspectRatio?: boolean;
}) => {
  const [w, h] = dimensions;
  return (
    <div>
      {showDimensions && `${w}x${h}`}
      {showAspectRatio && (
        <Badge className={cls({ spaced: showDimensions })}>
          AR: {getAspectRatio(dimensions).toFixed(2)}
        </Badge>
      )}
    </div>
  );
};

const ReencodeModal = ({
  fileid,
  isOpen,
  close,
  initialDimensions: [initialWidth, initialHeight],
}: {
  fileid: string;
  isOpen: boolean;
  close: () => void;
  initialDimensions: number[];
}) => {
  const { postprocesses } = useFileRepository();
  const { enqueue } = useToast();
  const [dimensionsChecked, setDimensionsChecked] = useState(false);
  const [[width, height], setDimensions] = useState([initialWidth, initialHeight]);
  const [crf, setCrf] = useState(DEFAULT_CRF);
  const [maxres, setMaxres] = useState(DEFAULT_MAX_RES);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const initialAspectRatio = getAspectRatio([initialWidth, initialHeight]);

  const resetThenClose = () => {
    reset();
    close();
  };

  const reencode = () => {
    const dimensions = dimensionsChecked ? [width, height] : undefined;
    postprocesses.reencode({ fileid, crf, maxres, dimensions, speed });
    enqueue({
      message: "Reencode request submitted",
    });
    resetThenClose();
  };

  const onKeyDown = ({ key }: any) => {
    if (key.toLowerCase() === "enter") reencode();
  };

  const rotationalCrop = () => {
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    if (initialWidth > initialHeight) {
      newWidth = nearestEvenNumber(initialHeight / initialAspectRatio);
    } else {
      newHeight = nearestEvenNumber(initialWidth / initialAspectRatio);
    }

    setDimensionsChecked(true);
    setDimensions([newWidth, newHeight]);
  };

  const reset = () => {
    setDimensions([initialWidth, initialHeight]);
    setDimensionsChecked(false);
    setCrf(DEFAULT_CRF);
    setMaxres(DEFAULT_MAX_RES);
  };

  return (
    <Modal isOpen={isOpen} onClose={resetThenClose} size="xl">
      <ModalOverlay />
      <ModalContent className="reencode-config">
        <ModalHeader>Reencode Options</ModalHeader>
        <ModalCloseButton tabIndex={-1} />
        <ModalBody>
          <Table>
            <Tbody>
              <Tr>
                <Td />
                <Td>Original Dimensions</Td>
                <Td>
                  <AspectRatio
                    dimensions={[initialWidth, initialHeight]}
                    showDimensions
                    showAspectRatio
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <input type="checkbox" checked disabled />
                </Td>
                <Td>CRF</Td>
                <Td>
                  <input
                    type="number"
                    value={crf}
                    min={DEFAULT_MIN_CRF}
                    max={DEFAULT_MAX_CRF}
                    step={1}
                    onChange={({ target: { value } }) => setCrf(Number.parseInt(value))}
                    onKeyDown={onKeyDown}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <input type="checkbox" checked disabled />
                </Td>
                <Td>Speed</Td>
                <Td>
                  <input
                    type="number"
                    value={speed}
                    min={MIN_SPEED}
                    max={MAX_SPEED}
                    step={0.25}
                    onChange={({ target: { value } }) => setSpeed(Number.parseFloat(value))}
                    onKeyDown={onKeyDown}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <input type="checkbox" checked disabled />
                </Td>
                <Td>Max Resolution</Td>
                <Td>
                  <input
                    type="number"
                    value={maxres}
                    min={DEFAULT_MIN_RES}
                    max={DEFAULT_MAX_RES}
                    step={2}
                    onChange={({ target: { value } }) =>
                      setMaxres(nearestEvenNumber(Number.parseInt(value)))
                    }
                    onKeyDown={onKeyDown}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <input
                    type="checkbox"
                    checked={dimensionsChecked}
                    onChange={({ target: { checked } }) => setDimensionsChecked(checked)}
                  />
                </Td>
                <Td>Crop</Td>
                <Td>
                  <AspectRatio dimensions={[width, height]} showDimensions />
                  <Button className="rotational-crop-button" onClick={rotationalCrop}>
                    Apply Rotational Crop
                  </Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button onClick={reset}>Reset</Button>
          <Spacer />
          <Button color="white" bgColor="blue.500" onClick={reencode}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReencodeModal;
