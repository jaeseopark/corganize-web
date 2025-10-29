import { useCallback, useEffect, useRef, useState } from "react";

import { CorganizeFile } from "typedefs/CorganizeFile";

import { useFileRepository } from "providers/fileRepository/hook";
import { useToast } from "providers/toast/hook";

import * as client from "clients/corganize";

import { madFocus } from "utils/elementUtils";

import ScrapeGrid from "components/standalone/scrape/Grid";
import ScrapeInputBar from "components/standalone/scrape/InputBar";
import { CARD_STATUS, Card } from "components/standalone/scrape/ScrapePanelCardView";

import "./ScrapePanel.scss";

type ScrapePanelProps = {
  defaultUrls?: string[];
};

const ScrapePanel = ({ defaultUrls }: ScrapePanelProps) => {
  const { createScrapedFiles, mostRecentFile } = useFileRepository();
  const { enqueue, enqueueSuccess, enqueueWarning, enqueueError } = useToast();

  const [isProcessing, setProcessing] = useState(false);
  const [cards, setCards] = useState(new Array<Card>());
  const [error, setError] = useState<Error>();
  const [rawScrapeCount, setRawScrapeCount] = useState(0);
  const mainDivRef = useRef<HTMLDivElement | null>(null);

  const [url, setUrl] = useState<string>(defaultUrls ? defaultUrls.join(",") : "");
  const [html, setHtml] = useState<string>();

  const scrape = useCallback(
    (event?: Event) => {
      if (event) event.preventDefault();

      if (isProcessing) return;

      setProcessing(true);

      let scrapePromise;
      if (html) {
        scrapePromise = client.scrapeHtmlAsync(html);
      } else {
        const urls = (url as string).split(",");
        scrapePromise = client.scrapeAsync(...urls);
      }

      scrapePromise
        .then(({ available, discarded }) => {
          setRawScrapeCount(available.length + discarded.length);

          if (available.length + discarded.length > 0) {
            enqueue({ message: `${available.length + discarded.length} files scraped` });
          } else {
            enqueueWarning({ message: "No files scraped" });
          }

          return available.map((file: CorganizeFile) => ({
            file,
            status: CARD_STATUS.AVAILABLE,
          }));
        })
        .then(setCards)
        .catch(setError)
        .finally(() => setProcessing(false));
    },
    [isProcessing, url, html],
  );

  useEffect(() => {
    if (defaultUrls) {
      scrape();
    }
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      madFocus(mainDivRef?.current);
    }
  }, [isProcessing]);

  const createFilesFromCards = (selectedCards: Card[]) => {
    const files = selectedCards.filter((c) => c.status === CARD_STATUS.AVAILABLE).map((c) => c.file);

    const displayToasts = (res: client.CreateResponse) => {
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

    const updateCardStatus = ({ created, skipped }: client.CreateResponse) => {
      setCards(prevCards => 
        prevCards.map(card => {
          const createdFile = created.find(f => f.fileid === card.file.fileid);
          const skippedFile = skipped.find(f => f.fileid === card.file.fileid);
          
          if (createdFile) {
            return { ...card, status: CARD_STATUS.COMPLETE };
          }
          if (skippedFile) {
            return { ...card, status: CARD_STATUS.ERROR, error: "already exists" };
          }
          return card;
        })
      );
    };

    setProcessing(true);
    createScrapedFiles(files)
      .then(displayToasts)
      .then(updateCardStatus)
      .catch(({ message }: Error) => enqueueError({ message }))
      .finally(() => setProcessing(false));
  };

  const onKeyDown = ({ key }: { key: string }) => {
    if (key.toLowerCase() === "u" && mostRecentFile) {
      window.open(mostRecentFile.sourceurl, "_blank");
    }
    if (key.toLowerCase() === "a") {
      createFilesFromCards(cards);
    }
  };

  if (error) {
    return <pre>{JSON.stringify(error)}</pre>;
  }

  return (
    <div className="scrape-panel" tabIndex={1} ref={mainDivRef} onKeyDown={onKeyDown}>
      <ScrapeInputBar
        disabled={isProcessing}
        cards={cards}
        createFilesFromCards={createFilesFromCards}
        url={url}
        setUrl={setUrl}
        html={html}
        setHtml={setHtml}
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
