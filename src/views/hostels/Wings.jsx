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
  const hasFetchedData = React.useRef(false);

  React.useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadData();
    }
  }, [blockID]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/settings/wing`, {
        Block_ID: blockID
      });

      if (!response.ok) {
        setLoading(false);
        toast.error( "Failed to fetch wings");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error( "Failed to fetch wings");
        return;
      }

      // Adjust based on your API response structure
      const blockData = response?.data?.data;
      const newData = blockData?.map((block, index) => ({
        ...block,
        key: index + 1,
      }));
      // console.log(newData);
      setWings(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch blocks error:", error);
      setLoading(false);
      toast.error("Failed to load wings");
    }
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  // Inside the Hostels component, replace the columns definition with:
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
    []
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
                    //   onClick={() => handleRowClick(row)}
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
                            {column.format
                              ? column.format(value, row, )
                              : value}
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
          count={wings?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
