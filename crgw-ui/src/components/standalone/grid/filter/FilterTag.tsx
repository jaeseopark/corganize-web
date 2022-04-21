import { Tag } from "@chakra-ui/react";

import { TriangleUpIcon, TriangleDownIcon, MinusIcon } from '@chakra-ui/icons'

import { useGrid } from "hooks/useGrid";
import { Filter, SortDirection } from "providers/grid/types";

import BooleanControl from "./BooleanControl";

const rotate = (direction: SortDirection): SortDirection | undefined => {
    if (direction === "desc") return "asc";
}

const FilterTag = ({ filter }: { filter: Filter }) => {
    const {
        filterProps: { getSortOrderByFilter, setSortOrder, clearSortOrder },
    } = useGrid();

    const renderControl = () => {
        switch (filter.type) {
            case "boolean":
                return <BooleanControl filter={filter} />;
            default:
                return null;
        }
    };

    const createSortOrder = () => setSortOrder({
        filter,
        direction: "desc"
    })

    const updateSortOrder = () => {
        const sortOrder = getSortOrderByFilter(filter);
        if (!sortOrder) {
            return createSortOrder();
        }

        const nextDirection = rotate(sortOrder.direction);
        if (!nextDirection) {
            return clearSortOrder();
        }

        setSortOrder({
            ...sortOrder,
            direction: nextDirection
        })
    };

    const renderSortIcon = () => {
        const sortOrder = getSortOrderByFilter(filter);
        if (!sortOrder) {
            return <MinusIcon />
        }

        const Icon = {
            "asc": TriangleUpIcon,
            "desc": TriangleDownIcon
        }[sortOrder.direction];

        return <Icon />;
    };

    return <Tag key={filter.displayName} size="lg">
        <>
            <div className="clickable" onClick={updateSortOrder}>
                <>
                    {renderSortIcon()}
                    <label>{filter.displayName}</label>
                </>
            </div>
            {renderControl()}
        </>
    </Tag>
}

export default FilterTag;
