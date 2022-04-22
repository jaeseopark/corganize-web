
import { useGrid } from "hooks/useGrid";
import FieldComponent from "./FieldComponent";

const FieldBar = () => {
  const {
    fieldProps: { fields },
  } = useGrid();

  return (
    <div className="filter-bar">
      {fields.map((f) => (
        <FieldComponent key={f.displayName} field={f} />
      ))}
    </div>
  );
};

export default FieldBar;
