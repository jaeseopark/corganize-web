import { Fragment, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { useBlanket } from "providers/blanket/hook";

const BlanketResetter = () => {
  const { exitBlanket } = useBlanket();
  useEffect(() => {
    exitBlanket();
  }, []);
  return <Fragment />;
};

const ScrapeRouteHandler = () => {
  useEffect(() => {}, []);
  return <label></label>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<BlanketResetter />} />
    <Route path="/scrape" element={<ScrapeRouteHandler />} />
    {/* <Route
        path="*"
        element={<Navigate to="/" replace />}
    /> */}
  </Routes>
);

export default AppRoutes;
