import cls from "classnames";
import styled from "styled-components";

const SegmentBlock = ({ segment, duration, isOpen = false, isLeadIndicator = false }) => {
  const left = (segment.start / duration) * 100;
  const right = (1 - segment.end / duration) * 100;
  const clsName = cls("segment", { open: isOpen, lead: isLeadIndicator });
  return <StyledBlock className={clsName} left={`${left}%`} right={`${right}%`} isOpen={isOpen} />;
};

export default SegmentBlock;

const StyledBlock = styled.div`
  left: ${({ left }) => left};
  right: ${({ right }) => right};
`;
