import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import ContextMenuWrapper from "./ContextMenuWrapper";
import FileSummary from "./FileSummary";
import { COPIED_TO_CLIPBOARD } from "../../utils/userpromptUtils";
import { useFileRepository } from "../../providers/FileRepository";
import { useBlanket } from "../../providers/Blanket";
import { ContextMenuOption } from "../../typedefs/ContextMenuOption";
import { copyTextToClipboard } from "../../utils/clipboardUtils";
import { useToast } from "../../providers/Toast";
import ScrapePanel from "../standalone/scrape/ScrapePanel";
import FileMetadataView from "../standalone/FileMetadataView";

const getDivider = (label: string): ContextMenuOption => ({
  label,
  isDivider: true,
});

const WithFileContextMenu = ({
  fileid,
  children,
}: {
  fileid: string;
  children: JSX.Element;
}) => {
  const { enqueue } = useToast();
  const { findById, toggleFavourite } = useFileRepository();
  const { setBlanket } = useBlanket();
  const contextId: string = useMemo(() => uuidv4().toString(), []);

  const file = findById(fileid);
  if (!file) return null;

  const { sourceurl, filename } = file;

  const getRemoteActions = (): ContextMenuOption[] => {
    const remoetActions: ContextMenuOption[] = [];
    if (sourceurl) {
      const sanitizedSourceurl = `https://${sourceurl
        .split("://")
        .slice(-1)
        .pop()}`;
      remoetActions.push(
        {
          label: "Copy Source URL",
          onClick: () => {
            copyTextToClipboard(sanitizedSourceurl).then(() =>
              enqueue(COPIED_TO_CLIPBOARD, filename)
            );
          },
        },
        {
          label: "Scrape (S)",
          onClick: () =>
            setBlanket(
              "Scrape",
              <ScrapePanel defaultUrls={[sanitizedSourceurl]} />
            ),
          hotkey: "s",
        }
      );
    }
    if (remoetActions.length > 0)
      remoetActions.push(getDivider("remote-divier"));
    return remoetActions;
  };

  const getCommonActions = (): ContextMenuOption[] => {
    const options = [
      {
        label: "Toggle Favourite (W)",
        onClick: () => toggleFavourite,
        hotkey: "w",
      },
      {
        label: "Show Metadata (I)",
        onClick: () =>
          setBlanket(
            <FileSummary fileid={fileid} withFav withSize withStorage />,
            <FileMetadataView file={file} />
          ),
        hotkey: "i",
      },
    ];

    return options;
  };

  const options = [...getRemoteActions(), ...getCommonActions()];

  return (
    <ContextMenuWrapper id={contextId} options={options}>
      {children}
    </ContextMenuWrapper>
  );
};

export default WithFileContextMenu;
