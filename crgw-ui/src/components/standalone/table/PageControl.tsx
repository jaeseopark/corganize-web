import { useEffect } from "react";
import Butt from "components/reusable/Button";

import "./PageControl.scss";
import { ReactTableInstance } from "components/standalone/table/props";
import { goToRandomPage } from "components/standalone/table/tableUtils";

const PageControl = ({
  tableInstance,
}: {
  tableInstance: ReactTableInstance;
}) => {
  const {
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state,
  } = tableInstance;
  const { pageIndex } = state;

  // Re-render when pageCount changes.
  useEffect(() => {}, [pageCount]);

  return (
    <div className="page-control">
      <div className="page-nav">
        <div className="buttons">
          <Butt onClick={() => goToRandomPage(tableInstance)} tabIndex={3}>
            Random
          </Butt>
          <Butt
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            tabIndex={3}
          >
            &lt;&lt;
          </Butt>
          <Butt
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            tabIndex={3}
          >
            &lt;
          </Butt>
          <Butt onClick={() => nextPage()} disabled={!canNextPage} tabIndex={3}>
            &gt;
          </Butt>
          <Butt
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            tabIndex={3}
          >
            &gt;&gt;
          </Butt>
        </div>
        <div className="page-indicator">
          <span>
            Page{" "}
            <input
              className="page-jump-field"
              type="number"
              value={pageIndex + 1}
              onChange={(e) => {
                const targetPage = e.target.value
                  ? Number(e.target.value) - 1
                  : 0;
                gotoPage(targetPage);
              }}
              tabIndex={2}
            />{" "}
            of {pageCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageControl;
