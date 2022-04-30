import { MinusIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Tag } from "@chakra-ui/react";
import styled from "styled-components";

import { useGrid } from "providers/grid/hook";
import { Field, Filter, SortDirection } from "providers/grid/types";

import BooleanControl from "components/standalone/grid/field/BooleanControl";

const rotate = (direction: SortDirection): SortDirection | undefined => {
  if (direction === "desc") return "asc";
};

const FilterControl = ({ filter }: { filter?: Filter }) => {
  if (!filter) {
    return null;
  }

  switch (filter.field.filterType) {
    case "boolean":
      return <BooleanControl filter={filter} />;
    default:
      return null;
  }
};

const FieldComponent = ({ field }: { field: Field }) => {
  const {
    fieldProps: { setSort, removeSort, getFilter, getSort },
  } = useGrid();
  const { displayName } = field;
  const filter = getFilter(field);
  const sort = getSort(field);

  const updateSortOrder = () => {
    if (!sort) {
      return setSort({
        field,
        direction: "desc",
      });
    }

    const nextDirection = rotate(sort.direction);
    if (!nextDirection) {
      return removeSort(sort);
    }

    const newSort = { ...sort, direction: nextDirection };
    setSort(newSort);
  };

  const SortIcon = () => {
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
        <SortIcon />
        <StyledFieldLabel>{displayName}</StyledFieldLabel>
      </div>
      <FilterControl filter={filter} />
    </Tag>
  );
};

export default FieldComponent;
const StyledFieldLabel = styled.label`
  margin: 0 0.3em;
`;
