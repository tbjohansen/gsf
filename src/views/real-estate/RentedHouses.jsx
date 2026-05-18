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
  formatter,
  removeUnderscore,
} from "../../../helpers";
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

export default function RentedHouses() {
  const [page, setPage] = React.useState(1); // Backend uses 1-based indexing
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [requestsList, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  // Add pagination state from backend
  const [pagination, setPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    loadData();
  }, [page, rowsPerPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=house_rent&page=${page}&limit=${rowsPerPage}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch rented houses");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch rented houses");
        return;
      }

      // Adjust based on your API response structure
      const responseData = response?.data?.data;
      const paymentsData = responseData?.data || [];

      const filteredData = paymentsData?.filter(
        (house) =>
          house?.Customer_Status === "served" ||
          house?.Customer_Status === "assign" ||
          house?.Customer_Status === "requested",
      );

      // Calculate sequential keys based on pagination
      const newData = filteredData?.map((payment, index) => ({
        ...payment,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      console.log(newData);
      setList(Array.isArray(newData) ? newData : []);

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
      console.error("Fetch requests error:", error);
      setLoading(false);
      toast.error("Failed to load rented houses");
    }
  };

  const handleChangePage = (event, newPage) => {
    // MUI TablePagination uses 0-based indexing, backend uses 1-based
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
  };

  // Inside the Hostels component, replace the columns definition with:
  const columns = React.useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "requested_room",
        label: "Unit Name",
        minWidth: 170,
        format: (row, value) => <span>{value?.estate?.name}</span>,
      },
      {
        id: "requested_room",
        label: "Unit Location",
        minWidth: 170,
        format: (row, value) => (
          <span>
            {value?.estate?.location?.Unit_Location ||
              value?.estate?.description}
          </span>
        ),
      },
      {
        id: "price",
        label: "Monthly Price",
        minWidth: 170,
        format: (row, value) => (
          <span>{currencyFormatter?.format(value?.estate?.price)}</span>
        ),
      },
      {
        id: "name",
        label: "Customer Name",
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
        id: "phone",
        label: "Phone Number",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Phone_Number)}</span>
        ),
      },

      {
        id: "total_amount",
        label: "Total Amount",
        minWidth: 170,
        format: (row, value) => (
          <span>
            {value?.Sangira
              ? currencyFormatter?.format(
                  value?.Sangira?.Grand_Total_Price || 0,
                )
              : value?.payment
                ? currencyFormatter?.format(value?.payment?.Amount_Paid || 0)
                : currencyFormatter?.format(value?.Price || 0)}
          </span>
        ),
      },
      {
        id: "payment_method",
        label: "Payment Method",
        format: (row, value) => (
          <span>
            {value?.payment
              ? capitalize(removeUnderscore(value?.payment?.Payment_Mode))
              : "SANGIRA"}
          </span>
        ),
      },
      {
        id: "sangira_number",
        label: "Sangira",
        minWidth: 170,
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
        minWidth: 150,
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
    [],
  );

  const handleRowClick = (row) => {
    navigate(`/projects/real-estates/rented-houses/${row?.Request_ID}/details`);
  };

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Rented Houses List</h4>
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
              {!loading && requestsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No rented houses found
                  </TableCell>
                </TableRow>
              )}
              {requestsList?.map((row) => {
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
          rowsPerPageOptions={[25, 50, 100, 1000]}
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
