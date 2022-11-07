import { Button, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import * as client from "clients/corganize";

import "./TagReportView.scss";

const TagReportView = () => {
  const [data, setData] = useState<{ [key: string]: number }>();
  const [shouldShowIndividualTags] = useState(false);

  useEffect(() => {
    client.getReport("tags").then(setData);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const deleteUnusedTags = () => {
    const unusedTags = Object.entries(data)
      .filter(([_, count]) => count === 0)
      .map(([tag]) => tag);

    client
      .deleteTags(unusedTags)
      .then(() =>
        Object.fromEntries(Object.entries(data).filter(([tag]) => !unusedTags.includes(tag)))
      )
      .then(setData);
  };

  const getIndividualTags = () => {
    if (!shouldShowIndividualTags) return null;

    return (
      <Wrap>
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => (
            <WrapItem key={tag}>
              <span className="tag-container">
                <span className="tag clickable">{tag}</span>
                <span className="tag count">{count}</span>
              </span>
            </WrapItem>
          ))}
      </Wrap>
    );
  };

  return (
    <div>
      <div>
        <span>Total tags:</span>
        <span>{Object.keys(data).length}</span>
      </div>
      <Button onClick={deleteUnusedTags}>Delete unused tags</Button>
      {getIndividualTags()}
    </div>
  );
};

export default TagReportView;
