import {
  Badge,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Select,
  Spacer,
  Stack,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import cls from "classnames";
import { useRef, useState } from "react";

import { useBlanket } from "providers/blanket/hook";

import { sample } from "utils/arrayUtils";

import { CARD_STATUS, Card } from "components/standalone/scrape/ScrapePanelCardView";

const BULK_ADD_OPTIONS = [10, 25, 50, 9999];
type ScrapeMode = "URL" | "HTML";

type ScrapeInputBarProps = {
  disabled: boolean;
  cards: Card[];
  createFilesFromCards: (cards: Card[]) => void;
  url: string | undefined | null;
  setUrl: (url: string) => void;
  html: string | undefined | null;
  setHtml: (url: string) => void;
  scrape: () => void;
  rawScrapeCount: number;
};

const AddButtonGroup = ({
  createFilesFromCards,
  filterCards,
  disabled,
}: {
  createFilesFromCards: (cards: Card[]) => void;
  filterCards: (status: string) => Card[];
  disabled: boolean;
}) => {
  const selectRef = useRef<HTMLSelectElement | null>(null);

  const addCards = (cards: Card[], sampleSize?: number) => {
    if (sampleSize) {
      cards = sample(cards, sampleSize);
    }
    createFilesFromCards(cards);
  };

  const getAvailableCards = () => filterCards(CARD_STATUS.AVAILABLE);

  const getOptions = () => {
    const fromStartOptions = BULK_ADD_OPTIONS.map((cnt) => ({
      label: `First ${cnt}`,
      onClick: () => addCards(getAvailableCards().slice(0, cnt)),
    }));

    const randomOptions = BULK_ADD_OPTIONS.map((cnt) => ({
      label: `${cnt} random`,
      onClick: () => addCards(getAvailableCards(), cnt),
    }));

    const fromEndOptions = BULK_ADD_OPTIONS.map((cnt) => ({
      label: `Last ${cnt}`,
      onClick: () => addCards(getAvailableCards().slice(-cnt)),
    }));

    return [...fromStartOptions, ...randomOptions, ...fromEndOptions];
  };

  const isZeroCards = filterCards(CARD_STATUS.AVAILABLE).length === 0;
  const options = getOptions();

  return (
    <ButtonGroup className="add-group">
      <Select variant="filled" disabled={disabled || isZeroCards} ref={selectRef}>
        {options.map(({ label }) => (
          <option key={label}>{label}</option>
        ))}
      </Select>
      <Button
        className="add-button"
        onClick={() => {
          if (selectRef?.current) {
            const { onClick } = options[selectRef?.current.selectedIndex];
            onClick();
          }
        }}
        disabled={disabled || isZeroCards}
      >
        Add
      </Button>
    </ButtonGroup>
  );
};

const ScrapeInputBar = ({
  disabled,
  cards,
  createFilesFromCards,
  url,
  setUrl,
  html,
  setHtml,
  scrape,
  rawScrapeCount,
}: ScrapeInputBarProps) => {
  const { protectHotkey, exposeHotkey } = useBlanket();
  const filterCards = (status: string) => cards.filter((c) => c.status === status);
  const [mode, setMode] = useState<ScrapeMode>("URL");

  const countByStatus = Array.from(new Set(cards.map((c) => c.status)))
    .sort()
    .map((status) => ({
      status,
      length: filterCards(status).length,
    }))
    .concat(
      { status: "Discarded", length: rawScrapeCount - cards.length },
      { status: "Scraped", length: rawScrapeCount }
    );

  const getTextInputElement = () => {
    if (mode == "HTML") {
      return (
        <Textarea defaultValue={html || ""} onChange={({ target: { value } }) => setHtml(value)} />
      );
    }
    return (
      <input
        required
        type="text"
        disabled={disabled}
        placeholder="Use <p1-p2> to scrape multiple pages"
        onChange={(e) => setUrl(e.target.value)}
        value={url as string}
        onFocus={protectHotkey}
        onBlur={exposeHotkey}
      />
    );
  };

  return (
    <div className="control-bar">
      <form onSubmit={scrape}>
        <VStack>
          <RadioGroup onChange={(value: ScrapeMode) => setMode(value)} value={mode}>
            <Stack direction="row">
              <Radio value="URL">URL</Radio>
              <Radio value="HTML">HTML</Radio>
            </Stack>
          </RadioGroup>
          <Flex direction="row" className="form-row">
            {getTextInputElement()}
            <Button className="scrape-button" type="submit" disabled={disabled || (!url && !html)}>
              Scrape
            </Button>
            <AddButtonGroup
              filterCards={filterCards}
              createFilesFromCards={createFilesFromCards}
              disabled={disabled}
            />
          </Flex>
          <HStack className="form-row metadata">
            <Spacer flexGrow={1} />
            <Flex className="badge-container">
              {countByStatus.map(({ status, length }) => (
                <Badge className={cls("badge", status)} key={status}>
                  {status}: {length}
                </Badge>
              ))}
            </Flex>
          </HStack>
        </VStack>
      </form>
    </div>
  );
};

export default ScrapeInputBar;
