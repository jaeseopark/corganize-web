import cls from "classnames";
import { ButtonGroup, Dropdown, SplitButtonProps } from "react-bootstrap";

export type DropdownOption = {
  label: string;
  onClick: () => void;
};

const Butt = ({
  className,
  onClick,
  disabled,
  children,
  tabIndex,
  type,
}: {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: JSX.Element | string;
  tabIndex?: number;
  type?: "button" | "submit" | "reset";
}) => (
  <button
    type={type || "button"}
    className={cls("btn btn-primary", className)}
    onClick={onClick}
    disabled={disabled}
    tabIndex={tabIndex}
  >
    {children}
  </button>
);

export const SplitButt = (props: SplitButtonProps & { options: DropdownOption[]; onClick: () => void }) => {
  const { options, title, id, onClick, disabled } = props;
  return (
    <Dropdown as={ButtonGroup}>
      <Butt onClick={onClick} disabled={disabled}>
        {title as string}
      </Butt>
      <Dropdown.Toggle split id={id} disabled={disabled} />
      <Dropdown.Menu>
        {options.map(({ label, onClick }) => (
          <Dropdown.Item key={label} onClick={onClick}>
            {label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Butt;
