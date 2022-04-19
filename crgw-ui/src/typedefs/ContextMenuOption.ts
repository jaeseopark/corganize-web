export type ContextMenuOption = {
  label: string;
  onClick?: () => void;
  hotkey?: string;
  isDivider?: boolean;
};
