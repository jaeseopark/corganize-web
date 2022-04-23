import { useEffect } from "react";

import { useUpdate } from "react-use";
import styled from "styled-components";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Spacer,
} from "@chakra-ui/react";

import { toRelativeHumanTime } from "utils/numberUtils";

import { useToast } from "./hook";
import { Toast } from "./toast";

const TimeCounter = ({ created }: { created: number }) => {
  const rerender = useUpdate();

  useEffect(() => {
    const iid = setInterval(() => rerender(), 100);
    return () => clearInterval(iid);
  }, []);
  return <small>{toRelativeHumanTime(created)} ago</small>;
};

const ToastComponent = ({ header, type, message: message, onClick, createdAt }: Toast) => (
  <StyledAlert status={type} onClick={onClick}>
    <AlertIcon />
    <Box>
      <AlertTitle>
        <Flex>
          <Box>{header}</Box>
          <Spacer />
          <TimeCounter created={createdAt} />
        </Flex>
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Box>
  </StyledAlert>
);

const ToastPortal = () => {
  const { toasts } = useToast();
  return (
    <StyledToastPortal>
      {toasts.map((t) => (
        <ToastComponent key={t.id} {...t} />
      ))}
    </StyledToastPortal>
  );
};

export default ToastPortal;

const StyledAlert = styled(Alert)`
  border-radius: 10px;
  bottom: 1em;
  left: 1em;
`;

const StyledToastPortal = styled.div`
  position: fixed;
  z-index: 5500;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  bottom: 0;
  left: 0;
`;
