import React, { useState } from "react";
import cls from "classnames";

import { DateRangePicker } from "react-date-range";

import Butt from "components/reusable//Button";

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
        <Butt onClick={toggle}>Edit</Butt>
      </div>
      <div className={cls("picker-container", { hidden: !isOpen })}>
        <DateRangePicker
          {...STATIC_PROPS}
          ranges={[{ ...dateRange, key: "selection" }]}
          onChange={({ selection }) => setDateRange(selection as DateRange)}
        />
        <Butt onClick={toggle}>OK</Butt>
      </div>
    </div>
  );
};

export default ExpandableDateRange;
