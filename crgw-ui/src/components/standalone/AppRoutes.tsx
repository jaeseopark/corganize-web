import { Fragment, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";

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
    setBlanket({
      title: "Scrape",
      body: <ScrapePanel defaultUrls={searchParams.get("urls")?.split(",")} />,
    });
  }, []);
  return <Fragment />;
};

const FileHandler = ({ renderer: Renderer }: { renderer: FileRenderer }) => {
  const { setBlanket } = useBlanket();
  const params = useParams();
  const navigate = useNavigate();
  const { findById } = useFileRepository();

  useEffect(() => {
    const file = findById(params.fileid || "");
    if (file) {
      setBlanket({
        fileid: file.fileid,
        body: <Renderer fileid={file.fileid} />,
      });
    } else {
      navigate("/");
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
  </Routes>
);

export default AppRoutes;
