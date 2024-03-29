import { useNavigate } from "react-router-dom";

import { CorganizeFile } from "typedefs/CorganizeFile";

export const useNavv = () => {
  const navigate = useNavigate();

  return {
    navRoot: () => navigate("/"),
    navToAdmin: () => navigate("/admin"),
    navBlankScrape: () => navigate('/scrape'),
    navJson: (file: CorganizeFile) => navigate(`/file/${file.fileid}/json`),
    navContent: (file: CorganizeFile) => navigate(`/file/${file.fileid}/content`),
    navTags: (file: CorganizeFile) => navigate(`/file/${file.fileid}/tags`),
    navScrape: (file: CorganizeFile) => navigate(`/scrape?urls=${window.btoa(file.sourceurl)}`),
  };
};
