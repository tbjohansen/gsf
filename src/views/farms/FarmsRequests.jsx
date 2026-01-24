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
import { capitalize, currencyFormatter, formatter } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function FarmsRequests() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [requestsList, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const navigate = useNavigate();

  const hasFetchedData = React.useRef(false);

  React.useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        "/customer/customer-request?&Request_Type=farm"
      );

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch requests");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch requests");
        return;
      }

      // Adjust based on your API response structure
      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      console.log(newData);
      setList(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch requests error:", error);
      setLoading(false);
      toast.error("Failed to load requests");
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
      {
        id: "name",
        label: "Full Name",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "gender",
        label: "Gender",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Gender)}</span>
        ),
      },
      {
        id: "student_id",
        label: "Customer ID",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Student_ID)}</span>
        ),
      },
      {
        id: "Customer_Status",
        label: "Request Status",
        minWidth: 170,
        align: "center",
        format: (row, value) => (
          <Badge
            name={
              value?.Customer_Status === "active"
                ? "Pending"
                : capitalize(value?.Customer_Status)
            }
            color={
              value?.Customer_Status === "served" ||
              value?.Customer_Status === "assign"
                ? "green"
                : value?.Customer_Status === "active"
                ? "yellow"
                : value?.Customer_Status === "received" ||
                  value?.Customer_Status === "requested"
                ? "blue"
                : "red"
            }
          />
        ),
      },
      {
        id: "requested_room",
        label: "Farm Name",
        minWidth: 170,
        format: (row, value) => <span>{value?.item?.Item_Name}</span>,
      },
      {
        id: "price",
        label: "Price",
        minWidth: 170,
        format: (row, value) => (
          <span>{currencyFormatter?.format(value?.Price)}</span>
        ),
      },
      {
        id: "total_amount",
        label: "Amount",
        format: (row, value) => (
          <span>
            {value?.Sangira
              ? currencyFormatter?.format(
                  value?.Sangira?.Grand_Total_Price || 0
                )
              : null}
          </span>
        ),
      },
      {
        id: "sangira_number",
        label: "Sangira",
        format: (row, value) => (
          <span>{value?.Sangira?.Sangira_Number || ""}</span>
        ),
      },
      {
        id: "requested_at",
        label: "Requested Date",
        minWidth: 170,
        format: (row, value) => <span>{value?.Sangira?.Requested_Date}</span>,
      },
      {
        id: "status",
        label: "Payment Status",
        minWidth: 170,
        align: "center",
        format: (row, value) => (
          <>
            {value?.Sangira ? (
              <Badge
                name={capitalize(value?.Sangira?.Sangira_Status)}
                color={
                  value?.Sangira?.Sangira_Status === "completed"
                    ? "green"
                    : value?.Sangira?.Sangira_Status === "pending"
                    ? "blue"
                    : "red"
                }
              />
            ) : null}
          </>
        ),
      },
      {
        id: "completed_date",
        label: "Payment Date",
        minWidth: 170,
        format: (row, value) => <span>{value?.Sangira?.Completed_Date}</span>,
      },
      {
        id: "payment_receipt",
        label: "Receipt",
        format: (row, value) => <span>{value?.Sangira?.Receipt_Number}</span>,
      },
    ],
    []
  );

  const handleRowClick = (row) => {
    navigate(
      `/projects/farms/requests/${row?.Request_ID}/receive`
    );
  };

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Requests List</h4>
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
              {requestsList
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.key || row.id}
                      onClick={() => handleRowClick(row)}
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
          count={requestsList?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
