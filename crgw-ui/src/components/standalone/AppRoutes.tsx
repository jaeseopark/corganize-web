import { Fragment, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";

import { useBlanket } from "providers/blanket/hook";
import { useFileRepository } from "providers/fileRepository/hook";

import { useNavv } from "hooks/navv";

import FileTagEditor from "components/reusable/FileTagEditor";
import AdminView from "components/standalone/AdminView";
import FileJsonEditor from "components/standalone/fileview/FileJsonEditor";
import FileView from "components/standalone/fileview/FileView";
import ScrapePanel from "components/standalone/scrape/ScrapePanel";

type FileRenderer = ({ fileid }: { fileid: string }) => JSX.Element;

const BlanketResetter = () => {
  const { exitBlanket } = useBlanket();
  const [searchParams] = useSearchParams();
  const [_, setCookies] = useCookies();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setCookies("crg-token", token);
    }
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

const SimpleHandler = ({
  title,
  renderer: Renderer,
}: {
  title: string;
  renderer: () => JSX.Element;
}) => {
  const { setBlanket } = useBlanket();

  useEffect(() => {
    setBlanket({ title, body: <Renderer /> });
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
  }, [params.fileid, Renderer]);

  return <Fragment />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route path="/" element={<BlanketResetter />} />
    <Route path="/scrape" element={<ScrapeRouteHandler />} />
    <Route path="/admin" element={<SimpleHandler title="Admin" renderer={AdminView} />} />
    <Route path="/file/:fileid/content" element={<FileHandler renderer={FileView} />} />
    <Route path="/file/:fileid/json" element={<FileHandler renderer={FileJsonEditor} />} />
    <Route path="/file/:fileid/tags" element={<FileHandler renderer={FileTagEditor} />} />
  </Routes>
);

export default AppRoutes;
