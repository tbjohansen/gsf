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
import { capitalize, formatter } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { values } from "lodash";
import DatePick from "../../components/DatePicker";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function CustomerOxygenPayments({ status }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  const employeeData = localStorage.getItem("userInfo");
  const employee = JSON.parse(employeeData);
  const customer = employee?.customer;

  const sortedPaymentStatus = [
    {
      id: "pending",
      label: "Pending",
    },
    {
      id: "expired",
      label: "Expired",
    },
    {
      id: "completed",
      label: "Completed",
    },
  ];

  const paymentStatuOnChange = (e, value) => {
    setPaymentStatus(value);
  };

  // Fetch payments from API
  useEffect(() => {
    loadData();
  }, [startDate, endDate, sangiraNumber, paymentStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=oxygen&Customer_ID=${customer?.Customer_ID}`;

      if (startDate) {
        url += `&Start_Date=${formatDateForDb(startDate)}`;
      }

      if (endDate) {
        url += `&End_Date=${formatDateForDb(endDate)}`;
      }

      if (sangiraNumber) {
        url += `&Sangira_Number=${sangiraNumber}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error("Failed to fetch payments");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error("Failed to fetch payments");
        return;
      }

      // Adjust based on your API response structure
      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      // console.log(newData);
      setPayments(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch payments error:", error);
      setLoading(false);
      toast.error("Failed to load payments");
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
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "name",
        label: `${"Customer Name"}`,
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "total_amount",
        label: "Amount (TZS)",
        minWidth: 150,
        format: (row, value) => (
          <span>
            {formatter.format(
              value?.Sangira?.Grand_Total_Price || value?.Price
            )}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        align: "center",
        format: (row, value) => (
          <Badge
            name={capitalize(value?.Sangira?.Sangira_Status || "Expired")}
            color={
              value?.Sangira?.Sangira_Status === "completed"
                ? "green"
                : value?.Sangira?.Sangira_Status === "pending"
                ? "blue"
                : "red"
            }
          />
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
        id: "Request_Type",
        label: "Payment Type",
        minWidth: 170,
        format: (row, value) => <span>{capitalize(value?.Request_Type)}</span>,
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
      {
        id: "bank",
        label: "Bank Name",
        minWidth: 170,
        format: (row, value) => (
          <span>{value?.Sangira?.Payment_Direction}</span>
        ),
      },
      {
        id: "requested_at",
        label: "Requested Date",
        minWidth: 180,
        format: (row, value) => <span>{value?.Sangira?.Requested_Date}</span>,
      },
    ],
    []
  );

  return (
    <>
      {status ? <Breadcrumb /> : null}
      <div className="w-full h-12">
        <h4>Payments List</h4>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <DatePick
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          className="w-[25%]"
        />
        <DatePick
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          className="w-[25%]"
        />
        <TextField
          size="small"
          id="outlined-basic"
          label="Sangira Number"
          variant="outlined"
          className="w-[25%]"
          value={sangiraNumber}
          onChange={(e) => setSangiraNumber(e.target.value)}
          autoFocus
        />
        <Autocomplete
          id="combo-box-demo"
          options={sortedPaymentStatus}
          size="small"
          freeSolo
          className="w-[25%]"
          value={paymentStatus}
          onChange={paymentStatuOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Payment Status" />
          )}
        />
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
              {payments
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.key || row.id}
                      sx={{
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
          rowsPerPageOptions={[25, 100]}
          component="div"
          count={payments?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
