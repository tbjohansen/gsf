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
import { capitalize, currencyFormatter, extractBank } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TbDownload } from "react-icons/tb";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function FarmsPayments() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [payments, setPayments] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [name, setName] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  const sortedPaymentTypes = [
    { id: "house", label: "Rental House" },
    { id: "business_land", label: "Rental Space" },
  ];

  const paymentTypeOnChange = (e, value) => {
    setPaymentType(value);
  };

  const sortedPaymentStatus = [
    { id: "pending", label: "Pending" },
    { id: "expired", label: "Expired" },
    { id: "completed", label: "Completed" },
  ];

  const paymentStatuOnChange = (e, value) => {
    setPaymentStatus(value);
  };

  useEffect(() => {
    loadData();
  }, [
    name,
    customerID,
    sangiraNumber,
    // paymentType,
    // paymentStatus,
    page,
    rowsPerPage,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=farm&Customer_Status=paid&limit=${rowsPerPage}&page=${page}`;

      if (name) {
        url += `&Customer_Name=${name}`;
      }

      if (sangiraNumber) {
        url += `&Sangira_Number=${sangiraNumber}`;
      }

      // if (paymentType) {
      //   url += `&Request_Type=${paymentType?.id}`;
      // }

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

      const responseData = response?.data?.data;
      const unitsData = responseData?.data || [];

      const newData = unitsData.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setPayments(Array.isArray(newData) ? newData : []);

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

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GSF Farm Payments List", 40, 40);

    // Sub-title with current date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 58);

    // Table headers & rows
    const tableColumns = [
      "S/N",
      "Customer Name",
      "Farm Name",
      "Plot Size",
      "Total Amount",
      "Sangira",
      "Payment Date",
      "Receipt",
      "Bank",
    ];

    const tableRows = payments.map((row, index) => [
      index + 1,
      capitalize(row?.customer?.Customer_Name) || "-",
      row?.item?.Item_Name || "-",
      row?.Quantity ? `${row.Quantity} hectare` : "-",
      currencyFormatter.format(row?.Sangira?.Grand_Total_Price || row?.Price) ||
        "-",
      row?.Sangira?.Sangira_Number || "-",
      row?.Sangira?.Completed_Date || "-",
      row?.Sangira?.Receipt_Number || "-",
      extractBank(row?.payment?.Payment_Channel) || "-",
    ]);

    autoTable(doc, {
      startY: 72,
      head: [tableColumns],
      body: tableRows,
      styles: {
        fontSize: 11,
        cellPadding: 4,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [245, 246, 250],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 28 }, // S/N
        6: { cellWidth: 68 }, // Total Amount
      },
      margin: { left: 40, right: 40 },
    });

    doc.save("GSF-Farms-Payments.pdf");
  };
  // ─────────────────────────────────────────────────────────────────────────

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
          <span>{currencyFormatter?.format(value?.item?.Item_Price)}</span>
        ),
      },
      {
        id: "requested_room",
        label: "Plot Size",
        minWidth: 170,
        format: (row, value) => <span>{value?.Quantity} hectare</span>,
      },
      {
        id: "total_amount",
        label: "Total Amount",
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
    ],
    [],
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12 flex items-center justify-between">
        <h4>Payments List</h4>
        <Button
          variant="contained"
          size="small"
          startIcon={<TbDownload />}
          onClick={handleDownloadPDF}
          disabled={loading || payments.length === 0}
          sx={{ textTransform: "none" }}
        >
          Download PDF
        </Button>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="name-filter"
          label={"Customer Name"}
          variant="outlined"
          className="w-[33%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="customerid-filter"
          label={"Customer ID"}
          variant="outlined"
          className="w-[33%]"
          value={customerID}
          onChange={(e) => setCustomerID(e.target.value)}
        />
        <TextField
          size="small"
          id="sangira-filter"
          label="Sangira Number"
          variant="outlined"
          className="w-[34%]"
          value={sangiraNumber}
          onChange={(e) => setSangiraNumber(e.target.value)}
        />
        {/* <Autocomplete
          id="payment-type-filter"
          options={[]}
          size="small"
          freeSolo
          className="w-[25%]"
          value={paymentType}
          onChange={paymentTypeOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Farm" />
          )}
        /> */}
        {/* <Autocomplete
          id="payment-status-filter"
          options={sortedPaymentStatus}
          size="small"
          freeSolo
          className="w-[25%]"
          value={paymentStatus}
          onChange={paymentStatuOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Payment Status" />
          )}
        /> */}
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
