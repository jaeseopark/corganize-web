import { useCallback, useEffect, useState } from "react";
import { useUpdate } from "react-use";

import { useFileRepository } from "providers/fileRepository/hook";
import { Card, CARD_STATUS } from "components/standalone/scrape/ScrapePanelCardView";
import ScrapeInputBar from "components/standalone/scrape/InputBar";
import ScrapeGrid from "components/standalone/scrape/Grid";

import { useBlanket } from "providers/blanket/hook";
import { getInstance } from "clients/corganize";
import { CorganizeFile } from "typedefs/CorganizeFile";
import { isDiscovered } from "shared/globalstore";

import "./ScrapePanel.scss";
import { useToast } from "providers/toast/hook";

type ScrapePanelProps = {
  defaultUrls?: string[];
};

const ScrapePanel = ({ defaultUrls }: ScrapePanelProps) => {
  const { enableHotkey: enableFullscreenHotkey } = useBlanket();
  const { createThenAddFiles } = useFileRepository();
  const { enqueueError } = useToast();

  const [isProcessing, setProcessing] = useState(false);
  const [cards, setCards] = useState(new Array<Card>());
  const [error, setError] = useState<Error>();
  const [rawScrapeCount, setRawScrapeCount] = useState(0);

  const [url, setUrl] = useState<string>(defaultUrls ? defaultUrls.join(",") : "");

  const rerender = useUpdate();

  const scrape = useCallback(
    (event?: Event) => {
      if (event) event.preventDefault();

      if (isProcessing) return;

      enableFullscreenHotkey();

      setProcessing(true);

      const urls = (url as string).split(",");

      getInstance()
        .scrapeAsync(...urls)
        .then((scrapedFiles) => {
          setRawScrapeCount(scrapedFiles.length);
          return scrapedFiles
            .filter((file) => !isDiscovered(file.fileid))
            .map((file: CorganizeFile) => ({
              file,
              status: CARD_STATUS.AVAILABLE,
            }));
        })
        .then(setCards)
        .catch(setError)
        .finally(() => setProcessing(false));
    },
    [enableFullscreenHotkey, isProcessing, url]
  );

  useEffect(() => {
    if (defaultUrls) {
      scrape();
    }
  }, []);

  const createFilesFromCards = (cards: Card[]) => {
    const files = cards.filter((c) => c.status === CARD_STATUS.AVAILABLE).map((c) => c.file);

    createThenAddFiles(files)
      .then(({ created, skipped }) => {
        const updateCardStatus = (f: CorganizeFile, status: string, errorString?: string) => {
          const card = cards.find((c) => c.file.fileid === f.fileid) as Card;
          card.status = status;
          card.error = errorString;
        };

        created.forEach((f) => updateCardStatus(f, CARD_STATUS.COMPLETE));
        skipped.forEach((f) => updateCardStatus(f, CARD_STATUS.ERROR, "already exists"));
      })
      .catch(({ message }: Error) => enqueueError({ message }))
      .finally(rerender);
  };

  if (error) {
    return <pre>{JSON.stringify(error)}</pre>;
  }

  return (
    <div className="scrape-panel">
      <ScrapeInputBar
        disabled={isProcessing}
        cards={cards}
        createFilesFromCards={createFilesFromCards}
        url={url}
        setUrl={setUrl}
        rawScrapeCount={rawScrapeCount}
        scrape={scrape}
      />
      <ScrapeGrid
        disabled={isProcessing}
        cards={cards}
        createFilesFromCards={createFilesFromCards}
        url={url}
        setUrl={setUrl}
        scrape={scrape}
      />
    </div>
  );
};

export default ScrapePanel;
