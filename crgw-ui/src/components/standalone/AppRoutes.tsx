import { Fragment, useEffect } from "react";
import { Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";

import { useNavv } from "hooks/navv";

import FileLabelEditor from "./fileview/FileLabelEditor";
import FileMetadataView from "./fileview/FileMetadataView";
import FileView from "./fileview/FileView";
import ScrapePanel from "./scrape/ScrapePanel";

type FileRenderer = ({ fileid }: { fileid: string }) => JSX.Element;

const BlanketResetter = () => {
  const { exitBlanket } = useBlanket();

  useEffect(() => {
    exitBlanket();
  }, []);

  return <Fragment />;
};

const ScrapeRouteHandler = () => {
  const { setBlanket } = useBlanket();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let urls;
    if (searchParams.has("urls")) {
      urls = window.atob(searchParams.get("urls")!).split(",");
    }

    setBlanket({
      title: "Scrape",
      body: <ScrapePanel defaultUrls={urls} />,
    });
  }, []);
  return <Fragment />;
};

const FileHandler = ({ renderer: Renderer }: { renderer: FileRenderer }) => {
  const { setBlanket } = useBlanket();
  const params = useParams();
  const { navRoot } = useNavv();
  const { findById } = useFileRepository();

  useEffect(() => {
    const file = findById(params.fileid || "");
    if (file) {
      setBlanket({
        fileid: file.fileid,
        body: <Renderer fileid={file.fileid} />,
      });
    } else {
      navRoot();
    }
  }, []);

  return <Fragment />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route path="/" element={<BlanketResetter />} />
    <Route path="/scrape" element={<ScrapeRouteHandler />} />
    <Route path="/file/:fileid/content" element={<FileHandler renderer={FileView} />} />
    <Route path="/file/:fileid/info" element={<FileHandler renderer={FileMetadataView} />} />
    <Route path="/file/:fileid/labels" element={<FileHandler renderer={FileLabelEditor} />} />
  </Routes>
);

export default AppRoutes;
