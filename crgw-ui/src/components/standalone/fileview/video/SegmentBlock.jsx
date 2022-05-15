import styled from "styled-components";
import cls from "classnames";

const SegmentBlock = ({ segment, duration, isOpen = false }) => {
  const offset = segment.start * 100 / duration;
  let width = (segment.end - segment.start) * 100 / duration;

  if (width < 0.5) {
    // make the segment visible
    width = 0.5;
  }

  return <StyledBlock className={cls("segment", { open: isOpen })} offset={`${offset}%`} width={`${width}%`} isOpen={isOpen} />
}

export default SegmentBlock;

const StyledBlock = styled.div`
  left: ${({ offset }) => offset};
  width: ${(width) => width};
`;
