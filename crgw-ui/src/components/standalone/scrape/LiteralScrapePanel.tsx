import { Button } from "@chakra-ui/react";
import { useState } from "react";
import styled from "styled-components";

import { useToast } from "providers/toast/hook";

import { createFiles, scrapeLiteralUrlsAsync } from "clients/corganize";

const Container = styled.div`
  height: 100%;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 50%;
  border: solid;
`;

const ScrapePanelBulk = () => {
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
    <Container>
      <Textarea value={lineSeparatedUrls} onChange={(e) => setLineSeparatedUrls(e.target.value)} />
      <div className="response" />
      <div className="scrape-button">
        <Button onClick={scrape}>Scrape</Button>
      </div>
    </Container>
  );
};

export default ScrapePanelBulk;
