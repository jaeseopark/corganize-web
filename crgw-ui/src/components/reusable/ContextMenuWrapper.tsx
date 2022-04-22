import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { ContextMenuOption } from "typedefs/ContextMenuOption";

import "./ContextMenuWrapper.scss";

type ContextMenuWrapperProps = {
  id: string;
  children: JSX.Element;
  options: ContextMenuOption[];
};

const ContextMenuWrapper = ({ id, children, options }: ContextMenuWrapperProps) => {
  const optionsWithHotkeys = options
    .filter((option) => option && option.hotkey)
    .reduce((map, obj) => {
      map.set(obj.hotkey!.toLowerCase(), obj.onClick!);
      return map;
    }, new Map<string, () => void>());

  // @ts-ignore
  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const onClick = optionsWithHotkeys.get(key);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      {
        // @ts-ignore
        <ContextMenuTrigger id={id}>{children}</ContextMenuTrigger>
      }
      {
        // @ts-ignore
        <ContextMenu id={id}>
          {options.map((option: ContextMenuOption) => {
            const { label, onClick, isDivider } = option;
            if (isDivider) return <MenuItem key={label} divider />;
            return (
              // @ts-ignore
              <MenuItem key={label} className="custom-root" onClick={onClick}>
                {label}
              </MenuItem>
            );
          })}
        </ContextMenu>
      }
    </div>
  );
};

export default ContextMenuWrapper;
