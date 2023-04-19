import { Button, Flex, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import styled from "styled-components";

import { useToast } from "providers/toast/hook";

import { createFiles, scrapeLiteralUrlsAsync } from "clients/corganize";

const Textareaa = styled(Textarea)`
  width: 100%;
  margin-bottom: 1em;
`;

const LiteralScrapePanel = () => {
  const [lineSeparatedUrls, setLineSeparatedUrls] = useState<string>("");
  const { enqueue } = useToast();

  const scrape = () => {
    const uniqueUrls = lineSeparatedUrls
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    scrapeLiteralUrlsAsync(uniqueUrls)
      .then(createFiles)
      .then(({ created, skipped }) => ({
        created: created.length,
        skipped: skipped.length,
      }))
      .then((aggregated) => enqueue({ message: JSON.stringify(aggregated) }));
  };

  return (
    <Flex height="100%" flexDirection="column">
      <Textareaa
        flex="1"
        value={lineSeparatedUrls}
        onChange={(e: any) => setLineSeparatedUrls(e.target.value)}
      />
      <Button onClick={scrape}>Scrape</Button>
    </Flex>
  );
};

export default LiteralScrapePanel;
