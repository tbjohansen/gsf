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
  extractBank,
  formatter,
  reportError,
  removeUnderscore,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function RealEstatePayments() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [payments, setPayments] = useState([]);
  const [units, setUnits] = useState([]);

  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [name, setName] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const sortedPaymentTypes = [
    {
      id: "house",
      label: "Rental House",
    },
    {
      id: "business_land",
      label: "Rental Space",
    },
  ];

  const paymentTypeOnChange = (e, value) => {
    setPaymentType(value);
  };

  const sortedPaymentStatus = [
    {
      id: "requested",
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
  }, [page, rowsPerPage, name, sangiraNumber, paymentType, paymentStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=house_rent&limit=${rowsPerPage}&page=${page}`;

      if (name) {
        url += `&Customer_Name=${name}`;
      }

      if (sangiraNumber) {
        url += `&Sangira_Number=${sangiraNumber}`;
      }

      if (paymentType) {
        url += `&Request_Type=${paymentType?.id}`;
      }

      if (paymentStatus) {
        url += `&Customer_Status=${paymentStatus?.id}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to fetch payments");
        return;
      }

      const responseData = response?.data?.data;
      const unitsData = responseData?.data || [];

      const newData = unitsData.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setPayments(Array.isArray(newData) ? newData : []);

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
      console.error("Fetch payments error:", error);
      setLoading(false);
      toast.error("Failed to load payments");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 25);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  // Inside the Hostels component, replace the columns definition with:
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
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
        id: "total_amount",
        label: "Amount",
        minWidth: 150,
        format: (row, value) => (
          <span>
            {currencyFormatter.format(
              value?.Sangira?.Grand_Total_Price || value?.Price,
            )}
          </span>
        ),
      },
      {
        id: "Request_Type",
        label: "Payment Type",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(removeUnderscore(value?.Request_Type))}</span>
        ),
      },
      {
        id: "Request_Type",
        label: "Payment Mode",
        minWidth: 170,
        format: (row, value) => (
          <span>
            {value?.Sangira?.Sangira_Number
              ? "SANGIRA NUMBER"
              : "SALARY DEDUCTION"}
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
        id: "status",
        label: "Status",
        align: "center",
        format: (row, value) => (
          <>
            {value?.Sangira?.Sangira_Status ? (
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
        id: "requested_at",
        label: "Requested Date",
        minWidth: 180,
        format: (row, value) => <span>{value?.Sangira?.Requested_Date}</span>,
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
          <span>{extractBank(value?.payment?.Payment_Channel)}</span>
        ),
      },
      {
        id: "requested_room",
        label: "Unit Name",
        minWidth: 170,
        format: (row, value) => <span>{value?.estate?.name}</span>,
      },
      {
        id: "price",
        label: "Monthly Price",
        minWidth: 170,
        format: (row, value) => (
          <span>{currencyFormatter?.format(value?.estate?.price)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <h4>Payments List</h4>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="outlined-basic"
          label={"Customer Name"}
          variant="outlined"
          className="w-[25%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
              {payments?.map((row) => {
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
          rowsPerPageOptions={[25, 50, 100, 200, 500, 1000]}
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
