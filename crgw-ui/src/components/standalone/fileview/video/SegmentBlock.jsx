import cls from "classnames";
import styled from "styled-components";

const SegmentBlock = ({
  segment,
  duration,
  isOpen = false,
  isLeadIndicator = false,
  isHighlight = false,
}) => {
  const left = (segment.start / duration) * 100;
  const right = (1 - segment.end / duration) * 100;
  const clsName = cls("segment", { open: isOpen, lead: isLeadIndicator, highlight: isHighlight });
  return <StyledBlock className={clsName} left={`${left}%`} right={`${right}%`} />;
};

export const ClosedSegmentBlock = ({ segment, duration }) => (
  <SegmentBlock segment={segment} duration={duration} />
);
export const OpenSegmentBlock = ({ duration, start, currentTime }) => (
  <SegmentBlock duration={duration} segment={{ start, end: currentTime }} isOpen={true} />
);
export const Seeker = ({ currentTime, duration }) => (
  <SegmentBlock
    segment={{ start: currentTime, end: currentTime + 1 }}
    duration={duration}
    isLeadIndicator={true}
  />
);
export const Highlight = ({ timestamp, duration }) => (
  <SegmentBlock
    segment={{ start: timestamp, end: timestamp + 1 }}
    duration={duration}
    isHighlight={true}
  />
);
export const TimeMarker = ({ value, onClick }) => (
  <StyledTimeMarker className="time-marker clickable" left={value * 10} onClick={onClick}>
    {value}
  </StyledTimeMarker>
);

const StyledBlock = styled.div`
  left: ${({ left }) => left};
  right: ${({ right }) => right};
`;

const StyledTimeMarker = styled.label`
  left: ${({ left }) => left}%;
`;
