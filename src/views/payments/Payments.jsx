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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function Payments({ status }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [admissionID, setAdmissionID] = useState("");
  const [name, setName] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  const sortedPaymentTypes = [
    {
      id: "hostel",
      label: "Hostel",
    },
    {
      id: "oxygen",
      label: "Oxygen",
    },
    {
      id: "farm",
      label: "Farm",
    },
    {
      id: "real_estate",
      label: "Real Estate",
    },
  ];

  const paymentTypeOnChange = (e, value) => {
    setPaymentType(value);
  };

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
  }, [
    name,
    customerID,
    admissionID,
    sangiraNumber,
    paymentType,
    paymentStatus,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?`;

      if (status === "student") {
        url += `Customer_Status=paid&Room_Status=paid&Request_Type=hostel`;
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
        label: `${status === "student" ? "Student Name" : "Customer Name"}`,
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "student_id",
        label: `${status === "student" ? "Student ID" : "Customer ID"}`,
        show: status !== "oxygen",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Student_ID)}</span>
        ),
      },
      status === "student" && {
        id: "gender",
        label: "Gender",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Gender)}</span>
        ),
      },
      status === "student" && {
        id: "program",
        label: "Program",
        format: (row, value) => (
          <span>
            {capitalize(value?.customer?.Program_Study)} (
            {value?.customer?.Year_Study})
          </span>
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
      status === "student" && {
        id: "hostel",
        label: "Hostel",
        minWidth: 170,
        format: (row, value) => <span>{value?.room?.hostel?.Hostel_Name}</span>,
      },
      status === "student" && {
        id: "block",
        label: "Block",
        minWidth: 170,
        format: (row, value) => <span>{value?.room?.block?.Block_Name}</span>,
      },
      status === "student" && {
        id: "requested_room",
        label: "Room",
        minWidth: 170,
        format: (row, value) => <span>{value?.room?.Room_Name}</span>,
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
        <TextField
          size="small"
          id="outlined-basic"
          label={status === "student" ? "Student Name" : "Customer Name"}
          variant="outlined"
          className="w-[25%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="outlined-basic"
          label={status === "student" ? "Student ID" : "Customer ID"}
          variant="outlined"
          className="w-[25%]"
          value={customerID}
          onChange={(e) => setCustomerID(e.target.value)}
          autoFocus
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
        {status === "student" ? (
          <TextField
            size="small"
            id="outlined-basic"
            label="Admission ID"
            variant="outlined"
            className="w-[25%]"
            value={admissionID}
            onChange={(e) => setAdmissionID(e.target.value)}
            autoFocus
          />
        ) : (
          <Autocomplete
            id="combo-box-demo"
            options={sortedPaymentTypes}
            size="small"
            freeSolo
            className="w-[25%]"
            value={paymentType}
            onChange={paymentTypeOnChange}
            renderInput={(params) => (
              <TextField {...params} label="Payment Type" />
            )}
          />
        )}
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
