import { useNavigate } from "react-router-dom";

import { CorganizeFile } from "typedefs/CorganizeFile";

export const useNavv = () => {
  const navigate = useNavigate();

  return {
    navRoot: () => navigate("/"),
    navInfo: (file: CorganizeFile) => navigate(`/file/${file.fileid}/info`),
    navContent: (file: CorganizeFile) => navigate(`/file/${file.fileid}/content`),
    navScrape: (file: CorganizeFile) => navigate(`/scrape?urls=${window.btoa(file.sourceurl)}`),
  };
};
