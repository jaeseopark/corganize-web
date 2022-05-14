import styled from "styled-components";

const SegmentBlock = ({ segment, duration }) => {
  const offset = segment.start * 100 / duration;
  const width = (segment.end - segment.start) * 100 / duration;
  return <StyledBlock className="segment" offset={`${offset}%`} width={`${width}%`} />
}

export default SegmentBlock;

const StyledBlock = styled.div`
  margin-left: ${({ offset }) => offset};
  width: ${(width) => width};
  height: 1rem;
  position: absolute;
`;
