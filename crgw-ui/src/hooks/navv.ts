import { useNavigate } from "react-router-dom";

import { CorganizeFile } from "typedefs/CorganizeFile";

export const useNavv = () => {
  const navigate = useNavigate();

  return {
    navRoot: () => navigate("/"),
    navJsonEditor: (file: CorganizeFile) => navigate(`/file/${file.fileid}/json`),
    navContent: (file: CorganizeFile) => navigate(`/file/${file.fileid}/content`),
    navLabels: (file: CorganizeFile) => navigate(`/file/${file.fileid}/labels`),
    navScrape: (file: CorganizeFile) => navigate(`/scrape?urls=${window.btoa(file.sourceurl)}`),
  };
};
