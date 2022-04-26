import { Box, Tag } from "@chakra-ui/react";

import { TriangleUpIcon, TriangleDownIcon, MinusIcon } from "@chakra-ui/icons";

import { useGrid } from "providers/grid/hook";
import { Field, SortDirection } from "providers/grid/types";

import BooleanControl from "./BooleanControl";
import styled from "styled-components";

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
    <Tag size="lg" float="left" marginRight=".5em" marginBottom=".5em">
      <div className="clickable" onClick={updateSortOrder}>
        <SortIcon />
        <StyledFieldLabel>{displayName}</StyledFieldLabel>
      </div>
      {renderFilterControl()}
    </Tag>
  );
};

export default FieldComponent;

const StyledFieldLabel = styled.label`
  margin: 0 0.3em;
`;
