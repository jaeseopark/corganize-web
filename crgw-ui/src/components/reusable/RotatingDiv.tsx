import styled from "styled-components";

type RotatingDivProps = {
  fillViewport: boolean;
  degrees: number;
  children: JSX.Element;
};

type NormalizedRotatingDivProps = RotatingDivProps & {
  isPerpendicular: boolean;
};

const NormalizedRotatingDiv = styled.div`
  transform-origin: top left;
  max-width: ${({
    fillViewport,
    isPerpendicular,
  }: NormalizedRotatingDivProps) => {
    if (isPerpendicular) {
      return fillViewport ? "100vh" : "calc(100vh - 100px)";
    }
    return "100vw";
  }};

  max-height: ${({
    fillViewport,
    isPerpendicular,
  }: NormalizedRotatingDivProps) => {
    if (fillViewport) {
      return "100vh";
    }
    return isPerpendicular ? "100vh" : "calc(100vh - 100px)";
  }};

  transform: ${({ degrees }: NormalizedRotatingDivProps) => {
    switch (degrees) {
      case 90:
        return "rotate(90deg) translate(0, -100%)";
      case 180:
        return "rotate(180deg) translate(-100%, -100%)";
      case 270:
        return "rotate(270deg) translate(-100%, 0)";
      default:
        return "none";
    }
  }};
`;

const RotatingDiv = ({ fillViewport, degrees, children }: RotatingDivProps) => {
  const normalizedDegrees = degrees % 360;
  return (
    <NormalizedRotatingDiv
      fillViewport={fillViewport}
      degrees={normalizedDegrees}
      isPerpendicular={degrees % 180 > 0}
    >
      {children}
    </NormalizedRotatingDiv>
  );
};

export default RotatingDiv;
