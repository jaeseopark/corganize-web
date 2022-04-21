import CardView, {
  Card,
} from "components/standalone/scrape/ScrapePanelCardView";

type ScrapeGridProps = {
  disabled: boolean;
  cards: Card[];
  createFilesFromCards: (cards: Card[]) => void;
  url: string | undefined | null;
  setUrl: (url: string) => void;
  scrape: () => void;
};

const ScrapeGrid = ({
  disabled,
  cards,
  createFilesFromCards,
  setUrl,
  scrape,
}: ScrapeGridProps) => {
  const cardViews = cards.map((card) => (
    <CardView
      key={card.file.fileid}
      card={card}
      onSend={(c) => createFilesFromCards([c])}
      onScrape={(newUrl: string) => {
        setUrl(newUrl);
        scrape();
      }}
      disableScrapeButton={disabled}
    />
  ));

  const spinner = disabled ? <label>Working...</label> : null;

  return (
    <div className="scrape-grid-with-spinner">
      {spinner}
      <div className="scrape-grid">{cardViews}</div>
    </div>
  );
};

export default ScrapeGrid;
