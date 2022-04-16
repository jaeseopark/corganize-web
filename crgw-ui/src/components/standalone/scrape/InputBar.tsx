import cls from "classnames";

import { Card, CARD_STATUS } from "./ScrapePanelCardView";
import { sample } from "../../../utils/arrayUtils";
import { useBlanket } from "../../../providers/Blanket";
import Butt, { SplitButt } from "../../reusable/Button";

const BULK_ADD_OPTIONS = [10, 50, 100, 200];

type ScrapeInputBarProps = {
  disabled: boolean;
  cards: Card[];
  createFilesFromCards: (cards: Card[]) => void;
  url: string | undefined | null;
  setUrl: (url: string) => void;
  scrape: () => void;
  rawScrapeCount: number;
};

const ScrapeInputBar = ({
  disabled,
  cards,
  createFilesFromCards,
  url,
  setUrl,
  scrape,
  rawScrapeCount,
}: ScrapeInputBarProps) => {
  const { enableHotkey, disableHotkey } = useBlanket();
  const filterCards = (status: string) =>
    cards.filter((c) => c.status === status);

  const getAvailableCards = () => filterCards(CARD_STATUS.AVAILABLE);

  const addCards = (cards: Card[], sampleSize?: number) => {
    if (sampleSize) {
      cards = sample(cards, sampleSize);
    }
    createFilesFromCards(cards);
  };

  const getSplitButtOptions = () => {
    const fromStartOptions = BULK_ADD_OPTIONS.map((cnt) => ({
      label: `Add ${cnt} from start`,
      onClick: () => addCards(getAvailableCards().slice(0, cnt)),
    }));

    const randomOptions = BULK_ADD_OPTIONS.map((cnt) => ({
      label: `Add ${cnt} at random`,
      onClick: () => addCards(getAvailableCards(), cnt),
    }));

    const fromEndOptions = BULK_ADD_OPTIONS.map((cnt) => ({
      label: `Add ${cnt} from end`,
      onClick: () => addCards(getAvailableCards().slice(-cnt)),
    }));

    return [...fromStartOptions, ...randomOptions, ...fromEndOptions];
  };

  return (
    <div className="control-bar">
      <form onSubmit={scrape}>
        <div className="form-row">
          <input
            required
            type="text"
            disabled={disabled}
            placeholder="Use <p1-p2> to scrape multiple pages"
            onChange={(e) => setUrl(e.target.value)}
            value={url as string}
            onFocus={() => disableHotkey()}
            onBlur={() => enableHotkey()}
          />
          {
            // @ts-ignore
            <SplitButt
              id="addall"
              title="Add All"
              onClick={() => addCards(filterCards(CARD_STATUS.AVAILABLE))}
              options={getSplitButtOptions()}
              disabled={
                disabled || filterCards(CARD_STATUS.AVAILABLE).length === 0
              }
            />
          }
          <Butt type="submit" disabled={disabled || !url}>
            Scrape
          </Butt>
        </div>
        <div className="form-row metadata">
          <div className="tag-container">
            {
              // @ts-ignore
              [...new Set(cards.map((c) => c.status))]
                .map((status) => ({
                  status,
                  length: filterCards(status).length,
                }))
                .map(({ status, length }) => (
                  <span className={cls("tag", status)} key={status}>
                    {status}: {length}
                  </span>
                ))
            }
            <span className="tag" key="hidden">
              Hidden: {rawScrapeCount - cards.length}
            </span>
            <span className="tag" key="scraped">
              Scraped: {rawScrapeCount}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScrapeInputBar;
