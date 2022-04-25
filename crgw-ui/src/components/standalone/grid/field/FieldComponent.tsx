import { Tag } from "@chakra-ui/react";

import { TriangleUpIcon, TriangleDownIcon, MinusIcon } from "@chakra-ui/icons";

import { useGrid} from "hooks/grid";
import { Field, SortDirection } from "providers/grid/types";

import BooleanControl from "./BooleanControl";

const rotate = (direction: SortDirection): SortDirection | undefined => {
  if (direction === "desc") return "asc";
};

const FieldComponent = ({ field }: { field: Field }) => {
  const {
    fieldProps: { upsertSort, removeSort, getFilter, getSort },
  } = useGrid();
  const { displayName } = field;
  const filter = getFilter(field);
  const sort = getSort(field);

  const renderFilterControl = () => {
    if (!filter) {
      return null;
    }

    switch (field.filterType) {
      case "boolean":
        return <BooleanControl filter={filter} />;
      default:
        return null;
    }
  };

  const updateSortOrder = () => {
    if (!sort) {
      return upsertSort({
        field,
        direction: "desc",
      });
    }

    const nextDirection = rotate(sort.direction);
    if (!nextDirection) {
      return removeSort(sort);
    }

    const newSort = { ...sort, direction: nextDirection };
    upsertSort(newSort);
  };

  const renderSortIcon = () => {
    if (!sort) {
      return <MinusIcon className="semi-hidden" />;
    }

    const Icon = {
      asc: TriangleUpIcon,
      desc: TriangleDownIcon,
    }[sort.direction];

    return <Icon />;
  };

  return (
    <Tag size="lg">
      <div className="clickable" onClick={updateSortOrder}>
        {renderSortIcon()}
        <label>{displayName}</label>
      </div>
      {renderFilterControl()}
    </Tag>
  );
};

export default FieldComponent;
