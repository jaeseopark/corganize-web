import { useNav } from "hooks/nav";
import { useCallback, useEffect, useRef, useState } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import { CreateResponse, getInstance } from "clients/corganize";

import { isDiscovered } from "shared/globalstore";

import { madFocus } from "utils/elementUtils";

import ScrapeGrid from "components/standalone/scrape/Grid";
import ScrapeInputBar from "components/standalone/scrape/InputBar";
import { CARD_STATUS, Card } from "components/standalone/scrape/ScrapePanelCardView";

import "./ScrapePanel.scss";

const ScrapePanel = () => {
  const { scrapeUrls } = useNav();
  const { createThenAddFiles } = useFileRepository();
  const { enqueue, enqueueSuccess, enqueueWarning, enqueueError } = useToast();

  const [isProcessing, setProcessing] = useState(false);
  const [cards, setCards] = useState(new Array<Card>());
  const [error, setError] = useState<Error>();
  const [rawScrapeCount, setRawScrapeCount] = useState(0);
  const mainDivRef = useRef<HTMLDivElement | null>(null);

  const [url, setUrl] = useState<string>(scrapeUrls ? scrapeUrls.join(",") : "");

  const scrape = useCallback(
    (event?: Event) => {
      if (event) event.preventDefault();

      if (isProcessing) return;

      setProcessing(true);

      const urls = (url as string).split(",");

      getInstance()
        .scrapeAsync(...urls)
        .then((scrapedFiles) => {
          setRawScrapeCount(scrapedFiles.length);

          if (scrapedFiles.length > 0) {
            enqueue({ message: `Scraped ${scrapedFiles.length} files` });
          } else {
            enqueueWarning({ message: "No files scraped" });
          }

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
    [isProcessing, url]
  );

  useEffect(() => {
    if (scrapeUrls) {
      scrape();
    }
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      madFocus(mainDivRef?.current);
    }
  }, [isProcessing]);

  const createFilesFromCards = (cards: Card[]) => {
    const files = cards.filter((c) => c.status === CARD_STATUS.AVAILABLE).map((c) => c.file);

    const displayToasts = (res: CreateResponse) => {
      if (files.length === 1) return res;

      const { created, skipped } = res;
      if (created.length > 0) {
        enqueueSuccess({ message: `${created.length} files added` });
      }

      if (skipped.length > 0) {
        enqueueWarning({ message: `${skipped.length} files skipped` });
      }

      return res;
    };

    setProcessing(true);
    createThenAddFiles(files)
      .then(displayToasts)
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
      .finally(() => setProcessing(false));
  };

  if (error) {
    return <pre>{JSON.stringify(error)}</pre>;
  }

  return (
    <div className="scrape-panel" tabIndex={1} ref={mainDivRef}>
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
