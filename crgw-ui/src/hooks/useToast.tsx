import { useEffect } from "react";

import { useUpdate } from "react-use";
import styled from "styled-components";
import { AlertStatus, Box, Flex, Spacer, useToast as useChakraToast } from "@chakra-ui/react";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";

import { getPosixSeconds } from "utils/dateUtils";
import { toRelativeHumanTime } from "utils/numberUtils";

const DEFAULT_DURATION = 4000;

type Toast = {
  type: AlertStatus;
  title: string;
  body: string;
  createdAt: number;
  onClick?: () => void;
};

const TimeCounter = ({ created }: { created: number }) => {
  const rerender = useUpdate();

  useEffect(() => {
    const iid = setInterval(() => rerender(), 100);
    return () => clearInterval(iid);
  }, []);
  return <small>{toRelativeHumanTime(created)} ago</small>;
};

const ToastComponent = ({ title, type, body, onClick, createdAt }: Toast) => (
  <StyledAlert status={type} onClick={onClick}>
    <AlertIcon />
    <Box>
      <AlertTitle>
        <Flex>
          <Box>{title}</Box>
          <Spacer />
          <TimeCounter created={createdAt} />
        </Flex>
      </AlertTitle>
      <AlertDescription>{body}</AlertDescription>
    </Box>
  </StyledAlert>
);

export const useToast = () => {
  const showChakraToast = useChakraToast();

  const enqueue = ({
    title,
    body,
    type,
    duration,
    onClick,
  }: {
    title?: string;
    body: string;
    type?: AlertStatus;
    duration?: number;
    onClick?: () => void;
  }) =>
    showChakraToast({
      duration: duration || DEFAULT_DURATION,
      position: "bottom-left",
      isClosable: false,
      render: () => (
        <ToastComponent
          type={type || "info"}
          title={title || "Corganize"}
          body={body}
          createdAt={getPosixSeconds()}
          onClick={onClick}
        />
      ),
    });

  return { enqueue };
};

const StyledAlert = styled(Alert)`
  border-radius: 10px;
`;
