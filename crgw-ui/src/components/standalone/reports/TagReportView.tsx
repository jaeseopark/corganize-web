import { Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import * as client from "clients/corganize";

import "./TagReportView.scss";

const TagReportView = () => {
  const [data, setData] = useState<{ [key: string]: number }>();

  useEffect(() => {
    client.getReport("tags").then(setData);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

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

export default TagReportView;
