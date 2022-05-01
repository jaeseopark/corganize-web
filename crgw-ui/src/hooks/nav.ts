import { useParams } from "react-router-dom";

export const useNav = () => {
  const params = useParams();
  const { fileid, urls } = params;

  return {
    file: { fileid },
    scrape: {},
  };
};
