import { Center, SimpleGrid, Spinner } from "@chakra-ui/react";

import CardView, { Card } from "components/standalone/scrape/ScrapePanelCardView";
import { createRange } from "utils/arrayUtils";

type ScrapeGridProps = {
  disabled: boolean;
  cards: Card[];
  createFilesFromCards: (cards: Card[]) => void;
  url: string | undefined | null;
  setUrl: (url: string) => void;
  scrape: () => void;
};

const GridSpinner = ({ isGridDisabled }: { isGridDisabled: boolean }) => {
  if (isGridDisabled) {
    return (
      <Center className="spinner">
        <Spinner size="xl" />
      </Center>
    );
  }
  return null;
};

const ScrapeGrid = ({ disabled, cards, createFilesFromCards, setUrl, scrape }: ScrapeGridProps) => (
  <div className="scrape-grid-with-spinner">
    <GridSpinner isGridDisabled={disabled} />
    <SimpleGrid
      tabIndex={1}
      className="scrape-grid"
      spacing={3}
      columns={createRange(1, 7)}
      outline="none"
    >
      {cards.map((card) => (
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
      ))}
    </SimpleGrid>
  </div>
);

export default ScrapeGrid;
