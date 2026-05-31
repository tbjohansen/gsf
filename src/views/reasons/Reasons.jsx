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
import {
  capitalize,
  currencyFormatter,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { IconButton } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import AddReason from "./AddReason";
import EditReason from "./EditReason";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function Reasons({ status }) {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [reasons, setReasons] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const [pagination, setPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  // Fetch hostels from API
  React.useEffect(() => {
    loadData();
  }, [page, rowsPerPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/settings/reason?&Project_Type=${status}&page=${page}&limit=${rowsPerPage}`;

      const response = await apiClient.get(url);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage =
            response?.data?.error || response?.data?.message;

          let errorText;

          console.log(response);
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to fetch reasons";
          }

          toast.error(errorText);
        }
        return;
      }

      // Adjust based on your API response structure
      const responseData = response?.data?.data;
      const userData = responseData?.data;

      // Update customers with keys
      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));
      // console.log(newData);
      setReasons(Array.isArray(newData) ? newData : []);

      // Update pagination state
      setPagination({
        total: responseData?.total || 0,
        perPage: responseData?.per_page || 25,
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
      toast.error("Failed to load reasons");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleRowClick = (row) => {
    // if (row?.Item_Type === "caution_money") {
    //   return null;
    // }
    console.log(status);
    setSelectedRow(row);
    // navigate(
    //   status === "oxygen"
    //     ? `projects/${status}/items/${row?.Item_ID}/mapped-items`
    //     : status === "student_accomodation" || status === "student_accomodatio"
    //       ? `/projects/hostels/items/${row?.Item_ID}/mapped-items`
    //       : `/items/${row?.Item_ID}/mapped-items`,
    // );
  };

  // Inside the Hostels component, replace the columns definition with:
  const columns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      { id: "Reason_Description", label: "Item Name" },
      {
        id: "status",
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
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "actions",
        label: "Actions",
        align: "center",
        format: (value, row) => (
          <div className="flex gap-4 justify-center">
            <EditReason item={row} loadData={loadData} Project_Type={status} />
          </div>
        ),
      },
    ];
  }, [status]);

  return (
    <>
      {/* <Breadcrumb /> */}
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <div className="flex flex-row gap-4 mb-1">
            {/* <IconButton
              onClick={() => navigate(-1)}
              className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <MdArrowBack />
            </IconButton>
            <h4 className="my-2">Reasons List</h4> */}
          </div>
          <AddReason Project_Type={status} loadData={loadData} />
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
              {reasons?.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.key || row.id}
                    onClick={() =>
                      status === "student_accomodation" ||
                      status === "student_accomodatio"
                        ? handleRowClick(row)
                        : null
                    }
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
                    {columns
                      .filter((e) => typeof e.show === "undefined" || !!e.show)
                      .map((column) => {
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
                              ? column.format(value, row, handleRowClick)
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
          rowsPerPageOptions={[25, 50, 100, 200, 1000]}
          component="div"
          count={pagination.total}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count}`
          }
          showFirstButton
          showLastButton
        />
      </Paper>
    </>
  );
}
