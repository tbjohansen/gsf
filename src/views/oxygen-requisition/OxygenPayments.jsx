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
import { Autocomplete, TextField, Button, IconButton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { MdArrowBack, MdFileDownload } from "react-icons/md";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function OxygenPayments() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [payments, setPayments] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  const sortedPaymentStatus = [
    { id: "pending", label: "Pending" },
    { id: "expired", label: "Expired" },
    { id: "completed", label: "Completed" },
  ];

  const paymentStatusOnChange = (e, value) => {
    setPaymentStatus(value);
  };

  // Fetch payments from API
  useEffect(() => {
    loadPaymentsData();
  }, [
    page,
    rowsPerPage,
    paymentStatus,
    customerName,
    customerPhone,
    sangiraNumber,
  ]);

  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/oxygen-request?Billing_Type=cash,cash_deposit&page=${page + 1}&limit=${rowsPerPage}`;

      // Add search filters
      if (customerName) url += `&Customer_Name=${customerName}`;
      if (customerPhone) url += `&Phone_Number=${customerPhone}`;
      if (sangiraNumber) url += `&Sangira_Number=${sangiraNumber}`;
      if (paymentStatus?.id) url += `&Sangira_Status=${paymentStatus.id}`;

      const response = await apiClient.get(url);

      if (!response.ok || response.data?.code >= 400) {
        setLoading(false);
        setPayments([]);
        toast.error(response.data?.error || "Failed to fetch payments");
        return;
      }

      // Adjust based on your API response structure
      const responseData = response?.data?.data;
      const userData = responseData?.data || [];

      const newData = userData.map((batch, index) => {
        // Flatten the batch and its requests into a single row per request
        const request = batch?.request?.[0] || {};
        return {
          ...batch,
          ...request,
          key:
            (responseData?.current_page - 1) * responseData?.per_page +
            index +
            1,
        };
      });

      setPayments(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch payments error:", error);
      setLoading(false);
      setPayments([]);
      toast.error("Failed to load payments");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const columns = useMemo(
    () => [
      { id: "key", label: "S/N", minWidth: 50 },
      {
        id: "customer_name",
        label: "Customer Name",
        minWidth: 170,
        format: (row) => (
          <span>{capitalize(row?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "phone_number",
        label: "Phone Number",
        minWidth: 150,
        format: (row) => <span>{row?.customer?.Phone_Number || "N/A"}</span>,
      },
      {
        id: "email",
        label: "Email",
        minWidth: 170,
        format: (row) => <span>{row?.customer?.Email || "N/A"}</span>,
      },
      {
        id: "payment_method",
        label: "Payment Method",
        minWidth: 150,
        format: (row) => (
          <span>{capitalize(row?.customer?.Payment_Method || "N/A")}</span>
        ),
      },
      {
        id: "item_name",
        label: "Item",
        minWidth: 170,
        format: (row) => <span>{row?.item?.Item_Name || "N/A"}</span>,
      },
      {
        id: "quantity",
        label: "Quantity",
        minWidth: 100,
        align: "center",
        format: (row) => <span>{row?.Quantity || 0}</span>,
      },
      {
        id: "price",
        label: "Unit Price (TZS)",
        minWidth: 150,
        format: (row) => <span>{formatter.format(row?.Price || 0)}</span>,
      },
      {
        id: "grand_total",
        label: "Total Amount (TZS)",
        minWidth: 170,
        format: (row) => (
          <span>{formatter.format(row?.sangira?.Grand_Total_Price || 0)}</span>
        ),
      },
      {
        id: "billing_type",
        label: "Billing Type",
        minWidth: 150,
        format: (row) => (
          <span>
            {capitalize(row?.Billing_Type?.replace("_", " ") || "N/A")}
          </span>
        ),
      },
      {
        id: "sangira_number",
        label: "Sangira Number",
        minWidth: 200,
        format: (row) => <span>{row?.sangira?.Sangira_Number || "N/A"}</span>,
      },
      {
        id: "sangira_status",
        label: "Status",
        align: "center",
        minWidth: 130,
        format: (row) => (
          <Badge
            name={capitalize(row?.sangira?.Sangira_Status || "N/A")}
            color={
              row?.sangira?.Sangira_Status === "completed"
                ? "green"
                : row?.sangira?.Sangira_Status === "pending"
                  ? "blue"
                  : row?.sangira?.Sangira_Status === "expired"
                    ? "red"
                    : "yellow"
            }
          />
        ),
      },
      {
        id: "receipt_number",
        label: "Receipt Number",
        minWidth: 170,
        format: (row) => <span>{row?.sangira?.Receipt_Number || "N/A"}</span>,
      },
      {
        id: "requested_date",
        label: "Requested Date",
        minWidth: 180,
        format: (row) => <span>{row?.sangira?.Requested_Date || "N/A"}</span>,
      },
      {
        id: "expire_date",
        label: "Expiry Date",
        minWidth: 180,
        format: (row) => <span>{row?.sangira?.Expire_Date || "N/A"}</span>,
      },
      {
        id: "completed_date",
        label: "Payment Date",
        minWidth: 180,
        format: (row) => <span>{row?.sangira?.Completed_Date || "N/A"}</span>,
      },
    ],
    [],
  );

  // Client-side filtering (as backup/additional filtering)
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (
        paymentStatus?.id &&
        payment?.sangira?.Sangira_Status !== paymentStatus.id
      ) {
        return false;
      }
      if (
        customerName &&
        !payment?.customer?.Customer_Name?.toLowerCase().includes(
          customerName.toLowerCase(),
        )
      ) {
        return false;
      }
      if (
        customerPhone &&
        !payment?.customer?.Phone_Number?.includes(customerPhone)
      ) {
        return false;
      }
      if (
        sangiraNumber &&
        !payment?.sangira?.Sangira_Number?.includes(sangiraNumber)
      ) {
        return false;
      }
      return true;
    });
  }, [payments, paymentStatus, customerName, customerPhone, sangiraNumber]);

  // Client-side pagination
  const paginatedPayments = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, page, rowsPerPage]);

  // Download Excel function
  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredPayments.map((row, index) => ({
        "S/N": index + 1,
        "Customer Name": capitalize(row?.customer?.Customer_Name || ""),
        "Phone Number": row?.customer?.Phone_Number || "",
        Email: row?.customer?.Email || "",
        "Payment Method": capitalize(row?.customer?.Payment_Method || ""),
        Item: row?.item?.Item_Name || "",
        Quantity: row?.Quantity || 0,
        "Unit Price (TZS)": row?.Price || 0,
        "Total Amount (TZS)": row?.sangira?.Grand_Total_Price || 0,
        "Billing Type": capitalize(row?.Billing_Type?.replace("_", " ") || ""),
        "Sangira Number": row?.sangira?.Sangira_Number || "",
        Status: capitalize(row?.sangira?.Sangira_Status || ""),
        "Receipt Number": row?.sangira?.Receipt_Number || "",
        "Requested Date": row?.sangira?.Requested_Date || "",
        "Expiry Date": row?.sangira?.Expire_Date || "",
        "Payment Date": row?.sangira?.Completed_Date || "",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-adjust column widths
      const maxWidth = 50;
      const wsColWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.min(
          maxWidth,
          Math.max(
            key.length,
            ...excelData.map((row) => String(row[key] || "").length),
          ) + 2,
        ),
      }));
      worksheet["!cols"] = wsColWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Oxygen Payments");

      // Generate filename with current date
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const fileName = `Oxygen_Payments_${dateStr}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);

      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Download Excel error:", error);
      toast.error("Failed to download Excel file");
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="w-full py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <MdArrowBack />
          </IconButton>
          <h4 className="text-xl font-semibold">Oxygen Payments List</h4>
        </div>
        <Button
          variant="contained"
          startIcon={<MdFileDownload />}
          onClick={handleDownloadExcel}
          disabled={loading || filteredPayments.length === 0}
          sx={{
            backgroundColor: "#4CAF50",
            "&:hover": {
              backgroundColor: "#45a049",
            },
            "&:disabled": {
              backgroundColor: "#cccccc",
            },
          }}
        >
          Download Excel
        </Button>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="customer-name"
          label="Customer Name"
          variant="outlined"
          className="w-[25%]"
          value={customerName}
          onChange={(e) => {
            setCustomerName(e.target.value);
            setPage(0);
          }}
          autoFocus
        />
        <TextField
          size="small"
          id="phone-number"
          label="Phone Number"
          variant="outlined"
          className="w-[25%]"
          value={customerPhone}
          onChange={(e) => {
            setCustomerPhone(e.target.value);
            setPage(0);
          }}
        />
        <TextField
          size="small"
          id="sangira-number"
          label="Sangira Number"
          variant="outlined"
          className="w-[25%]"
          value={sangiraNumber}
          onChange={(e) => {
            setSangiraNumber(e.target.value);
            setPage(0);
          }}
        />
        <Autocomplete
          id="payment-status"
          options={sortedPaymentStatus}
          size="small"
          freeSolo
          className="w-[25%]"
          value={paymentStatus}
          onChange={paymentStatusOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Payment Status" />
          )}
        />
      </div>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="oxygen payments table">
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
              {!loading && paginatedPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
              {paginatedPayments.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.key}
                    onClick={() => setSelectedRow(row)}
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
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(row) : row[column.id]}
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
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
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
