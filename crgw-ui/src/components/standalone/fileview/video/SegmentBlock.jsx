import styled from "styled-components";
import cls from "classnames";

const SegmentBlock = ({ segment, duration, isOpen = false }) => {
  const offset = segment.start * 100 / duration;
  const width = (segment.end - segment.start) * 100 / duration;
  return <StyledBlock className={cls("segment", { open: isOpen })} offset={`${offset}%`} width={`${width}%`} isOpen={isOpen} />
}

export default SegmentBlock;

const StyledBlock = styled.div`
  margin-left: ${({ offset }) => offset};
  width: ${(width) => width};
`;
