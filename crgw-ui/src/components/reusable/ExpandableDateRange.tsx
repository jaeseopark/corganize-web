import { Button } from "@chakra-ui/react";
import cls from "classnames";
import { useState } from "react";
import { DateRangePicker } from "react-date-range";

import "./ExpandableDateRange.scss";

type DateRange = { startDate: Date; endDate: Date };
type ExpandableDateRangeProps = {
  dateRange: DateRange;
  setDateRange: (dr: DateRange) => void;
};

const STATIC_PROPS = {
  minDate: new Date("Jan. 1, 2020"),
  maxDate: new Date(),
};

const ExpandableDateRange = ({ dateRange, setDateRange }: ExpandableDateRangeProps) => {
  const [isOpen, setOpen] = useState(false);

  const startString = dateRange.startDate.toLocaleDateString();
  const endString = dateRange.endDate.toLocaleDateString();

  const toggle = () => setOpen(!isOpen);

  const previewString = `${startString} thru ${endString}`;

  return (
    <div className="expandable-date-range">
      <div className={cls("preview", { hidden: isOpen })}>
        <span>{previewString}</span>
        <Button onClick={toggle}>Edit</Button>
      </div>
      <div className={cls("picker-container", { hidden: !isOpen })}>
        <DateRangePicker
          {...STATIC_PROPS}
          ranges={[{ ...dateRange, key: "selection" }]}
          onChange={({ selection }) => setDateRange(selection as DateRange)}
        />
        <Button onClick={toggle}>OK</Button>
      </div>
    </div>
  );
};

export default ExpandableDateRange;
