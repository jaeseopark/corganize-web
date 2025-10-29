import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { CorganizeFile } from "typedefs/CorganizeFile";

export const useNavv = () => {
  const navigate = useNavigate();

  return {
    navRoot: useCallback(() => navigate("/"), [navigate]),
    navToAdmin: useCallback(() => navigate("/admin"), [navigate]),
    navBlankScrape: useCallback(() => navigate("/scrape"), [navigate]),
    navJson: useCallback((file: CorganizeFile) => navigate(`/file/${file.fileid}/json`), [navigate]),
    navContent: useCallback((file: CorganizeFile) => navigate(`/file/${file.fileid}/content`), [navigate]),
    navTags: useCallback((file: CorganizeFile) => navigate(`/file/${file.fileid}/tags`), [navigate]),
    navScrape: useCallback((file: CorganizeFile) => navigate(`/scrape?urls=${window.btoa(file.sourceurl)}`), [navigate]),
  };
};
