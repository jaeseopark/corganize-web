import { Button } from "@chakra-ui/react";
import cls from "classnames";

import { CorganizeFile } from "typedefs/CorganizeFile";

import "./ScrapePanelCardView.scss";

const FILENAME_LENGTH = 10;

export const CARD_STATUS = {
  AVAILABLE: "Available",
  COMPLETE: "Complete",
  ERROR: "Error",
};

export type Card = {
  file: CorganizeFile;
  status: string;
  error?: string;
};

type CardViewProps = {
  card: Card;
  onSend: (card: Card) => void;
  onScrape: (url: string) => void;
  disableScrapeButton: boolean;
};

const CardView = ({ card, onSend, onScrape, disableScrapeButton }: CardViewProps) => {
  const { file, status, error } = card;
  const { sourceurl, thumbnailurl, filename, fileid } = file;

  const title = `${fileid}: ${filename.substring(0, FILENAME_LENGTH)}`;
  const complete = status === CARD_STATUS.COMPLETE;
  const clickable = status === CARD_STATUS.AVAILABLE;
  const onSendCard = () => {
    if (clickable) onSend(card);
  };

  return (
    <div className={cls("scrape-card", { error, complete })}>
      <div className="img-wrapper">
        <img
          className={cls("thumbnail", { clickable, error, complete })}
          src={thumbnailurl || "not.found.jpg"}
          onClick={onSendCard}
          alt={title}
        />
      </div>
      <Button className="scrape" onClick={() => onScrape(sourceurl)} disabled={disableScrapeButton}>
        Scrape
      </Button>
    </div>
  );
};

export default CardView;
