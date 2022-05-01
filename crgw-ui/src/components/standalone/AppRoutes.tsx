import { Fragment, useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { useBlanket } from "providers/blanket/hook";

import FileMetadataView from "./fileview/FileMetadataView";
import FileView from "./fileview/FileView";
import ScrapePanel from "./scrape/ScrapePanel";

const BlanketResetter = () => {
  const { exitBlanket } = useBlanket();

  useEffect(() => {
    exitBlanket();
  }, []);

  return <Fragment />;
};

const ScrapeRouteHandler = () => {
  const { setBlanket } = useBlanket();

  useEffect(() => {
    setBlanket({
      title: "Scrape",
      body: <ScrapePanel />,
    });
  }, []);
  return <Fragment />;
};

const FileContentHandler = () => {
  const { setBlanket } = useBlanket();
  const params = useParams();

  useEffect(() => {
    if (params.fileid) {
      setBlanket({
        fileid: params.fileid,
        body: <FileView fileid={params.fileid} />,
      });
    }
  }, []);

  return <Fragment />;
};

const FileInfoHandler = () => {
  const { setBlanket } = useBlanket();
  const params = useParams();

  useEffect(() => {
    if (params.fileid) {
      setBlanket({
        fileid: params.fileid,
        body: <FileMetadataView fileid={params.fileid} />,
      });
    }
  }, []);

  return <Fragment />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route path="/" element={<BlanketResetter />} />
    <Route path="/scrape" element={<ScrapeRouteHandler />} />
    <Route path="/file/:fileid/content" element={<FileContentHandler />} />
    <Route path="/file/:fileid/info" element={<FileInfoHandler />} />
  </Routes>
);

export default AppRoutes;
