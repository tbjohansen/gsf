import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Badge from "../../components/Badge";
import { capitalize, formatDateTimeForDb } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate, useParams } from "react-router-dom";
import EditBlock from "./EditBlock";
import AddBlock from "./AddBlock";
import Breadcrumb from "../../components/Breadcrumb";
import AddWing from "./AddWing";
import EditWing from "./EditWIng";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function Wings() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [wings, setWings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const navigate = useNavigate();
  const { blockID } = useParams();

  // ─────────────────────────────────────────────────────────────
  // loadData — memoized on blockID so refetches use the current block
  // ─────────────────────────────────────────────────────────────
  const loadData = React.useCallback(
    async (signal) => {
      if (!blockID) return; // don't fire without a block ID

      setLoading(true);
      try {
        const response = await apiClient.get(
          `/settings/wing`,
          { Block_ID: blockID },
          { signal },
        );

        // Ignore cancellations (component unmounted or block changed)
        if (response.problem === "CANCEL_ERROR") return;

        if (!response.ok) {
          setLoading(false);

          if (response.problem === "NETWORK_ERROR") {
            toast.error("Network error. Please check your connection");
          } else if (response.problem === "TIMEOUT_ERROR") {
            toast.error("Request timeout. Please try again");
          } else {
            const serverMessage =
              response?.data?.error || response?.data?.message;
            toast.error(
              typeof serverMessage === "string"
                ? serverMessage
                : "Failed to fetch wings",
            );
          }
          return;
        }

        if (response.data?.error || response.data?.code >= 400) {
          setLoading(false);
          const serverMessage =
            typeof response.data?.error === "string"
              ? response.data.error
              : response.data?.message || "Failed to fetch wings";
          toast.error(serverMessage);
          return;
        }

        const blockData = response?.data?.data;
        const newData = blockData?.map((block, index) => ({
          ...block,
          key: index + 1,
        }));
        setWings(Array.isArray(newData) ? newData : []);
        setLoading(false);
      } catch (error) {
        // Silent cancellation
        if (
          error.isAborted ||
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        // Global 429 after retries exhausted
        if (error.is429) {
          setLoading(false);
          toast.error(
            error.userMessage || "Too many requests. Please slow down.",
          );
          return;
        }

        console.error("Fetch wings error:", error);
        setLoading(false);
        toast.error("Failed to load wings");
      }
    },
    [blockID],
  );

  // ─────────────────────────────────────────────────────────────
  // Fetch on mount and whenever blockID changes.
  // Aborts the previous request when the block changes.
  // ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    setPage(0);
    setWings([]);

    const controller = new AbortController();
    loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // ─────────────────────────────────────────────────────────────
  // Columns — memoized with loadData dep so EditWing always
  // receives the freshest loadData bound to the current blockID
  // ─────────────────────────────────────────────────────────────
  const columns = React.useMemo(
    () => [
      { id: "key", label: "S/N" },
      { id: "Wing_Name", label: "Name" },
      { id: "Wing_Gender", label: "Gender" },
      {
        id: "Wing_Status",
        label: "Status",
        format: (value) => (
          <Badge
            name={capitalize(value)}
            color={value === "active" ? "green" : "red"}
          />
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        align: "left",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "actions",
        label: "Actions",
        align: "center",
        format: (value, row) => (
          <div className="flex gap-4 justify-center">
            <EditWing wing={row} loadData={loadData} />
          </div>
        ),
      },
    ],
    [loadData],
  );

  return (
    <>
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Block Wings List</h4>
          <AddWing loadData={loadData} />
        </div>
      </div>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <StyledTableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ padding: 0 }}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              )}
              {wings
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.key || row.id}
                      sx={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedRow?.key === row.key
                            ? "rgba(0, 0, 0, 0.04)"
                            : "inherit",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.08)",
                        },
                      }}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            onClick={(e) => {
                              // Prevent click event from bubbling up to the row
                              // when clicking on action buttons
                              if (column.id === "actions") {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={wings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
