import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdReceipt,
  MdPayment,
  MdLocalShipping,
  MdCheckCircle,
  MdPending,
  MdDownload,
  MdVisibility,
  MdClose,
  MdFileDownload,
  MdCalendarToday,
  MdAttachMoney,
  MdShoppingCart,
  MdInventory,
  MdDescription,
  MdBusiness,
  MdPendingActions,
  MdMonetizationOn,
  MdPreview,
} from "react-icons/md";
import {
  capitalize,
  currencyFormatter,
  formatDateTimeForDb,
  formatter,
  formatDate,
} from "../../../helpers";
import apiClient from "../../api/Client";
import Breadcrumb from "../../components/Breadcrumb";
import Badge from "../../components/Badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Design tokens ───────────────────────────────────────────────────── */
const C = {
  bg: "#f0f4f8",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#dce3ea",
  primary: "#1f4389",
  primaryLight: "#2d5bb5",
  primaryDark: "#162d5e",
  primaryBg: "#e8edf5",
  accent: "#f59e0b",
  accentLight: "#fbbf24",
  accentBg: "#fef3c7",
  success: "#059669",
  successLight: "#10b981",
  successBg: "#d1fae5",
  warning: "#d97706",
  warningBg: "#fef3c7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  info: "#6366f1",
  infoBg: "#e0e7ff",
  muted: "#64748b",
  text: "#1e293b",
  textDim: "#94a3b8",
};

/* ─── Styled helpers (matching CylinderInventory) ───────────────────────────────────────────────────── */
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#f5f6fa",
    color: theme.palette.common.black,
    fontWeight: 600,
    fontSize: 13,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

/* ─── Tab Panel ────────────────────────────────────────────────────────── */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/* ─── Invoice Dialog (for generating new invoices) ───────────────────────── */
function InvoiceDialog({
  open,
  onClose,
  customer,
  pendingInvoices,
  onGenerateInvoice,
  outstandingBalance,
  loading,
}) {
  const [invoiceAmount, setInvoiceAmount] = React.useState("");
  const [invoiceNotes, setInvoiceNotes] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setInvoiceAmount(
        outstandingBalance > 0 ? outstandingBalance.toString() : "",
      );
      setInvoiceNotes("");
    }
  }, [open, outstandingBalance]);

  const handleClose = () => {
    setInvoiceAmount("");
    setInvoiceNotes("");
    onClose();
  };

  const handleGenerateAndDownload = async () => {
    let amount = invoiceAmount;
    if (!amount && outstandingBalance > 0) {
      amount = outstandingBalance;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid invoice amount");
      return;
    }

    const success = await onGenerateInvoice({
      Customer_ID: customer?.Customer_ID,
      Grand_Total_Price: parseFloat(amount),
      Phone_Number: customer?.Phone_Number,
      Notes: invoiceNotes,
    });

    if (success) {
      setInvoiceAmount("");
      setInvoiceNotes("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white border border-slate-200 rounded-2xl shadow-xl",
      }}
    >
      <DialogTitle className="font-bold border-b border-slate-200 flex justify-between items-center text-slate-800">
        <div className="flex items-center gap-2">
          <MdReceipt style={{ color: C.primary }} size={20} />
          <span>Generate Invoice</span>
        </div>
        <IconButton onClick={handleClose} size="small" className="text-slate-400 hover:text-slate-600">
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-6">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="grid grid-cols-1 gap-4">
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Invoice Amount (TZS)"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              placeholder={
                outstandingBalance > 0
                  ? `Recommended amount: ${currencyFormatter.format(outstandingBalance)}`
                  : "Enter amount"
              }
              helperText={
                outstandingBalance > 0 ? (
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💰 Outstanding balance: <strong>{currencyFormatter.format(outstandingBalance)}</strong></span>
                    {(!invoiceAmount || parseFloat(invoiceAmount) !== outstandingBalance) && (
                      <Button 
                        size="small" 
                        onClick={() => setInvoiceAmount(outstandingBalance.toString())}
                        style={{ textTransform: 'none', fontSize: '11px', padding: '2px 8px', minWidth: 'auto' }}
                      >
                        Use full amount
                      </Button>
                    )}
                  </span>
                ) : ""
              }
              InputProps={{
                inputProps: { min: 0, step: "0.01" },
              }}
              className="bg-white"
            />
            <TextField
              fullWidth
              size="small"
              label="Notes (Optional)"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Additional notes or payment terms..."
              multiline
              rows={2}
              className="bg-white"
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions className="p-4 border-t border-slate-200 gap-2">
        <Button
          onClick={handleClose}
          className="text-slate-500 normal-case hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerateAndDownload}
          disabled={loading}
          variant="contained"
          className="normal-case font-semibold text-white"
          style={{ backgroundColor: C.primary }}
          startIcon={loading ? null : <MdFileDownload />}
        >
          {loading ? "Generating..." : "Generate & Download Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main Customer Page ────────────────────────────────────────────────── */
export default function CustomerDetails() {
  const { customerID } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = React.useState(null);
  const [oxygenOrders, setOxygenOrders] = React.useState([]);
  const [cashDeposits, setCashDeposits] = React.useState([]);
  const [pendingInvoices, setPendingInvoices] = React.useState([]);
  const [fulfilledOrders, setFulfilledOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);

  // Pagination states
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  // Display data for each tab with pagination
  const [displayedOxygenOrders, setDisplayedOxygenOrders] = React.useState([]);
  const [displayedCashDeposits, setDisplayedCashDeposits] = React.useState([]);
  const [displayedFulfilledOrders, setDisplayedFulfilledOrders] = React.useState([]);
  const [displayedPendingInvoices, setDisplayedPendingInvoices] = React.useState([]);

  React.useEffect(() => {
    loadCustomerData();
  }, [customerID]);

  // Update displayed data when page, rowsPerPage, or data changes
  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setDisplayedOxygenOrders(oxygenOrders.slice(start, end));
  }, [oxygenOrders, page, rowsPerPage]);

  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setDisplayedCashDeposits(cashDeposits.slice(start, end));
  }, [cashDeposits, page, rowsPerPage]);

  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setDisplayedFulfilledOrders(fulfilledOrders.slice(start, end));
  }, [fulfilledOrders, page, rowsPerPage]);

  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setDisplayedPendingInvoices(pendingInvoices.slice(start, end));
  }, [pendingInvoices, page, rowsPerPage]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [customerRes, ordersRes] = await Promise.all([
        apiClient.get(`/customer/customer?Customer_ID=${customerID}`),
        apiClient.get(`/oxygen/oxygen-payment-track?Customer_ID=${customerID}`),
      ]);

      if (customerRes.ok && !customerRes.data?.error) {
        setCustomer(
          customerRes?.data?.data?.data[0] || customerRes?.data?.data[0],
        );
      }

      if (ordersRes.ok && !ordersRes.data?.error) {
        const responseData = ordersRes?.data?.data || ordersRes.data || {};

        const requestItems = responseData.requestItem || [];
        const pendingCashDeposit = responseData.totalPendingCashDeposit || [];

        const oxygenItems = requestItems.filter(
          (item) => item.Request_Type === "oxygen",
        );
        const cashDepositItems = requestItems.filter(
          (item) => item.Request_Type === "cash_deposit",
        );

        setOxygenOrders(oxygenItems);
        setCashDeposits(cashDepositItems);
        setPendingInvoices(pendingCashDeposit);

        const servedOrders = oxygenItems.filter(
          (order) => order?.Customer_Status?.toLowerCase() === "served",
        );
        setFulfilledOrders(servedOrders);
        
        setPage(0); // Reset to first page when new data arrives
      }
    } catch (e) {
      console.error("Failed to load customer data:", e);
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (invoiceData) => {
    setActionLoading(true);
    try {
      const response = await apiClient.post(
        "/oxygen/oxygen-deposit",
        invoiceData,
      );

      if (response.ok && !response.data?.error) {
        toast.success("Invoice generated successfully");
        await loadCustomerData();
        return true;
      } else {
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage = response?.data?.error || response?.data?.message;
          let errorText;

          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (typeof serverMessage === "object" && serverMessage !== null) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to generate invoice";
          }

          toast.error(errorText);
        }
        return false;
      }
    } catch (e) {
      console.error("Invoice generation error:", e);
      toast.error("Failed to generate invoice");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadSingleInvoice = (invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.setTextColor(C.primary);
    doc.setFont("helvetica", "bold");
    doc.text("OXYGEN SUPPLIES INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(C.muted);
    doc.text("Oxygen Medical Supplies Ltd.", 105, 30, { align: "center" });
    doc.text("P.O. Box 12345, Dar es Salaam, Tanzania", 105, 36, {
      align: "center",
    });
    doc.text(
      "Tel: +255 123 456 789 | Email: info@oxygensupplies.co.tz",
      105,
      42,
      { align: "center" },
    );

    doc.setDrawColor(C.border);
    doc.line(14, 48, 196, 48);

    doc.setFontSize(10);
    doc.setTextColor(C.text);
    doc.setFont("helvetica", "normal");

    const invoiceNumber =
      invoice.sangira?.Sangira_Number ||
      invoice.Sangira_Number ||
      `INV-${invoice.Sangira_ID}`;

    doc.text(`Invoice #: ${invoiceNumber}`, 14, 58);
    doc.text(`Date: ${formatDate(invoice.Request_Date)}`, 14, 65);
    doc.text(
      `Due Date: ${invoice.sangira?.Expire_Date ? formatDate(invoice.sangira.Expire_Date) : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}`,
      14,
      72,
    );

    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 85);
    doc.setFont("helvetica", "normal");
    doc.text(customer?.Customer_Name || "N/A", 14, 92);
    doc.text(customer?.Phone_Number || "N/A", 14, 99);
    doc.text(customer?.Email || "N/A", 14, 106);

    const tableData = [
      [
        invoice.item?.Item_Name || "Cash Deposit",
        invoice.Quantity || 1,
        currencyFormatter.format(invoice.Price || invoice.Grand_Total_Price),
        currencyFormatter.format(
          invoice.Grand_Total_Price || invoice.Price * invoice.Quantity,
        ),
      ],
    ];

    autoTable(doc, {
      startY: 115,
      head: [["Description", "Qty", "Unit Price", "Amount"]],
      body: tableData,
      foot: [
        [
          "",
          "",
          "Total Amount",
          currencyFormatter.format(
            invoice.Grand_Total_Price || invoice.Price * invoice.Quantity || 0,
          ),
        ],
      ],
      headStyles: {
        fillColor: [31, 67, 137],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      footStyles: {
        fillColor: [232, 237, 245],
        textColor: [5, 150, 105],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(C.muted);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Terms:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Payment is due within 30 days of invoice date.", 14, finalY + 6);

    if (invoice.sangira) {
      doc.text("Reference Information:", 14, finalY + 20);
      doc.setFont("helvetica", "bold");
      doc.text(`Sangira Number:`, 14, finalY + 26);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.sangira.Sangira_Number, 70, finalY + 26);

      doc.setFont("helvetica", "bold");
      doc.text(`Status:`, 14, finalY + 32);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.sangira.Sangira_Status, 40, finalY + 32);

      doc.setFont("helvetica", "bold");
      doc.text(`Expiry Date:`, 14, finalY + 38);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(invoice.sangira.Expire_Date), 60, finalY + 38);
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(C.textDim);
    doc.text("Thank you for your business!", 105, pageHeight - 20, {
      align: "center",
    });
    doc.text(
      "This is a computer-generated invoice. For inquiries, please contact our billing department.",
      105,
      pageHeight - 15,
      { align: "center" },
    );

    doc.save(
      `Invoice_${invoiceNumber}_${customer?.Customer_Name || "Customer"}.pdf`,
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Calculate totals
  const totalOrdered = React.useMemo(() => {
    return oxygenOrders.reduce(
      (sum, item) => sum + item.Price * item.Quantity,
      0,
    );
  }, [oxygenOrders]);

  const totalCashDeposited = React.useMemo(() => {
    return cashDeposits.reduce(
      (sum, item) => sum + item.Price * (item.Quantity || 1),
      0,
    );
  }, [cashDeposits]);

  const totalPendingInvoiceAmount = React.useMemo(() => {
    return pendingInvoices.reduce(
      (sum, inv) =>
        sum + (inv.Grand_Total_Price || inv.Price * (inv.Quantity || 1) || 0),
      0,
    );
  }, [pendingInvoices]);

  const outstandingBalance = totalOrdered - totalCashDeposited;

  const getStatusBadge = (status) => {
    let color = "blue";
    if (status === "active" || status === "served" || status === "approved" || status === "paid") {
      color = "green";
    } else if (status === "inactive" || status === "pending") {
      color = "red";
    } else if (status === "credit") {
      color = "orange";
    } else if (status === "cash") {
      color = "green";
    }
    return <Badge name={capitalize(status || "pending")} color={color} />;
  };

  // Column definitions (like CylinderInventory)
  const oxygenOrdersColumns = [
    { id: "Request_ID", label: "Request ID" },
    { id: "Item_Name", label: "Item" },
    { id: "Quantity", label: "Quantity", align: "center" },
    { id: "Unit_Price", label: "Unit Price", align: "right" },
    { id: "Total", label: "Total", align: "right" },
    { id: "Status", label: "Status", align: "center" },
    { id: "Payment_Method", label: "Payment Method", align: "center" },
    { id: "Origin", label: "Origin", align: "center" },
    { id: "Request_Date", label: "Request Date" },
  ];

  const cashDepositsColumns = [
    { id: "Request_ID", label: "Request ID" },
    { id: "Item_Name", label: "Item" },
    { id: "Quantity", label: "Quantity", align: "center" },
    { id: "Amount", label: "Amount", align: "right" },
    { id: "Payment_Method", label: "Payment Method", align: "center" },
    { id: "Customer_Status", label: "Customer Status", align: "center" },
    { id: "Origin", label: "Origin", align: "center" },
    { id: "Payment_Date", label: "Payment Date" },
    { id: "Sangira_Number", label: "Sangira Number" },
    { id: "Status", label: "Status", align: "center" },
  ];

  const fulfilledOrdersColumns = [
    { id: "Request_ID", label: "Request ID" },
    { id: "Item_Name", label: "Item" },
    { id: "Quantity", label: "Quantity", align: "center" },
    { id: "Amount", label: "Amount", align: "right" },
    { id: "Payment_Method", label: "Payment Method", align: "center" },
    { id: "Customer_Status", label: "Customer Status", align: "center" },
    { id: "Origin", label: "Origin", align: "center" },
    { id: "Served_Date", label: "Served Date" },
    { id: "Served_By", label: "Served By" },
  ];

  const pendingInvoicesColumns = [
    { id: "Sangira_Number", label: "Sangira Number" },
    { id: "Quantity", label: "Quantity", align: "center" },
    { id: "Amount", label: "Amount", align: "right" },
    { id: "Request_Date", label: "Request Date" },
    { id: "Expiry_Date", label: "Expiry Date" },
    { id: "Status", label: "Status", align: "center" },
    { id: "Action", label: "Action", align: "center" },
  ];

  // Helper function to get value from row
  const getValue = (row, columnId) => {
    switch (columnId) {
      case "Item_Name":
        return row.item?.Item_Name || `Item ${row.Item_ID}`;
      case "Quantity":
        return row.Quantity || 1;
      case "Unit_Price":
        return row.Price;
      case "Total":
        return row.Price * row.Quantity;
      case "Status":
        return row.Customer_Status;
      case "Payment_Method":
        return row.Billing_Type || "credit";
      case "Origin":
        return customer?.customer_origin === "outside" ? "External" : "Internal";
      case "Amount":
        return row.Price * (row.Quantity || 1);
      case "Customer_Status":
        return customer?.Customer_Status || "active";
      case "Payment_Date":
        return row.Payment_Date;
      case "Sangira_Number":
        return row.sangira?.Sangira_Number || row.Sangira_Number || "—";
      case "Served_Date":
        return row.Served_Date;
      case "Served_By":
        return row.served_by?.name || `Employee ${row.Served_By}`;
      case "Expiry_Date":
        return row.sangira?.Expire_Date;
      case "Action":
        return "download";
      default:
        return row[columnId];
    }
  };

  // Format function for table cells
  const formatValue = (columnId, value, row) => {
    switch (columnId) {
      case "Unit_Price":
      case "Amount":
      case "Total":
        return currencyFormatter.format(value || 0);
      case "Status":
      case "Customer_Status":
        return getStatusBadge(value);
      case "Payment_Method":
        return (
          <Chip
            label={capitalize(value || "credit")}
            size="small"
            style={{
              backgroundColor:
                value === "credit" ? C.primaryBg : C.successBg,
              color: value === "credit" ? C.primary : C.success,
            }}
          />
        );
      case "Origin":
        return (
          <Chip
            label={value}
            size="small"
            style={{
              backgroundColor: value === "External" ? C.accentBg : C.successBg,
              color: value === "External" ? C.accent : C.success,
            }}
          />
        );
      case "Action":
        return (
          <Button
            size="small"
            variant="outlined"
            startIcon={<MdDownload />}
            onClick={() => handleDownloadSingleInvoice(row)}
            sx={{
              textTransform: "none",
              borderColor: C.primary,
              color: C.primary,
              "&:hover": {
                borderColor: C.primaryDark,
                backgroundColor: C.primaryBg,
              },
            }}
          >
            Download
          </Button>
        );
      case "Request_Date":
      case "Payment_Date":
      case "Served_Date":
        return value ? formatDate(value) : "—";
      case "Expiry_Date":
        return value ? formatDate(value) : "—";
      default:
        return value || "—";
    }
  };

  const getCurrentData = () => {
    switch (tabValue) {
      case 0:
        return displayedOxygenOrders;
      case 1:
        return displayedCashDeposits;
      case 2:
        return displayedFulfilledOrders;
      case 3:
        return displayedPendingInvoices;
      default:
        return displayedOxygenOrders;
    }
  };

  const getTotalCount = () => {
    switch (tabValue) {
      case 0:
        return oxygenOrders.length;
      case 1:
        return cashDeposits.length;
      case 2:
        return fulfilledOrders.length;
      case 3:
        return pendingInvoices.length;
      default:
        return oxygenOrders.length;
    }
  };

  const getCurrentColumns = () => {
    switch (tabValue) {
      case 0:
        return oxygenOrdersColumns;
      case 1:
        return cashDepositsColumns;
      case 2:
        return fulfilledOrdersColumns;
      case 3:
        return pendingInvoicesColumns;
      default:
        return oxygenOrdersColumns;
    }
  };

  const currentData = getCurrentData();
  const currentColumns = getCurrentColumns();
  const totalCount = getTotalCount();

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: C.bg }}>
        <LinearProgress
          className="rounded"
          style={{ backgroundColor: C.primaryBg }}
        />
        <div className="flex items-center gap-2 mt-4">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
          <p className="text-slate-500">Loading customer data…</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: C.bg }}
      >
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-slate-500 text-lg font-medium">
            Customer not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb />
      <div style={{ backgroundColor: C.bg }} className="min-h-screen p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={() => navigate(-1)}
              className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <MdArrowBack />
            </IconButton>
            <div>
              <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-800">
                {customer.Customer_Name || "Customer Details"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Customer ID: {customer.Customer_ID}
              </p>
            </div>
          </div>
          {outstandingBalance > 0 && (
            <Button
              onClick={() => setInvoiceOpen(true)}
              variant="contained"
              className="normal-case font-semibold"
              style={{ backgroundColor: C.primary }}
              startIcon={<MdReceipt />}
            >
              Generate Invoice
            </Button>
          )}
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdPerson className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Customer
                </span>
              </div>
              <div className="font-bold text-lg text-slate-800">
                {customer.Customer_Name}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                ID: {customer.Customer_ID}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdPayment className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Payment Method
                </span>
              </div>
              <div className="font-bold text-lg text-slate-800">
                <Chip
                  label={capitalize(customer.Payment_Method || "credit")}
                  size="small"
                  style={{
                    backgroundColor:
                      customer.Payment_Method === "credit"
                        ? C.primaryBg
                        : C.successBg,
                    color:
                      customer.Payment_Method === "credit"
                        ? C.primary
                        : C.success,
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Default payment method
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdLocalShipping className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Customer Status
                </span>
              </div>
              <div className="font-bold text-lg">
                {getStatusBadge(customer.Customer_Status || "active")}
              </div>
              <div className="text-xs text-slate-500 mt-1">Account status</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdBusiness className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Customer Origin
                </span>
              </div>
              <div className="font-bold text-lg text-slate-800">
                <Chip
                  label={customer.customer_origin === "outside" ? "External" : "Internal"}
                  size="small"
                  style={{
                    backgroundColor:
                      customer.customer_origin === "outside"
                        ? C.accentBg
                        : C.successBg,
                    color:
                      customer.customer_origin === "outside"
                        ? C.accent
                        : C.success,
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {customer.customer_origin === "outside"
                  ? "External customer"
                  : "Internal customer"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second row with contact and balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdEmail className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Contact Info
                </span>
              </div>
              <div className="text-sm text-slate-700">
                {customer.Email || "N/A"}
              </div>
              <div className="text-sm text-slate-700 mt-1">
                {customer.Phone_Number || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdLocalShipping className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Oxygen Orders
                </span>
              </div>
              <div className="font-bold text-xl text-slate-800">
                {currencyFormatter?.format(totalOrdered)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {oxygenOrders.length} item(s)
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdAttachMoney className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Outstanding Balance
                </span>
              </div>
              <div
                className={`font-bold text-xl ${outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {currencyFormatter.format(outstandingBalance)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {outstandingBalance > 0 ? "Amount due" : "Fully paid"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Invoices Alert */}
        {pendingInvoices.length > 0 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdPendingActions className="text-amber-600" size={24} />
                <div>
                  <h3 className="font-bold text-amber-800">
                    Pending Cash Deposit Invoices
                  </h3>
                  <p className="text-sm text-amber-700">
                    {pendingInvoices.length} invoice(s) awaiting payment
                    totaling{" "}
                    {currencyFormatter.format(totalPendingInvoiceAmount)}
                  </p>
                </div>
              </div>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setInvoiceOpen(true)}
                style={{ borderColor: C.accent, color: C.accent }}
              >
                Generate New Invoice
              </Button>
            </div>
          </div>
        )}

        {/* Tabs with Tables styled like CylinderInventory */}
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            <Tab
              label={`Oxygen Orders (${oxygenOrders.length})`}
              icon={<MdLocalShipping size={18} />}
              iconPosition="start"
            />
            <Tab
              label={`Cash Deposits (${cashDeposits.length})`}
              icon={<MdMonetizationOn size={18} />}
              iconPosition="start"
            />
            <Tab
              label={`Fulfilled Orders (${fulfilledOrders.length})`}
              icon={<MdCheckCircle size={18} />}
              iconPosition="start"
            />
            <Tab
              label={`Pending Invoices (${pendingInvoices.length})`}
              icon={<MdPendingActions size={18} />}
              iconPosition="start"
            />
          </Tabs>

          {/* Table Container with Pagination */}
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="customer data table">
              <TableHead>
                <TableRow>
                  {currentColumns.map((column) => (
                    <StyledTableCell
                      key={column.id}
                      align={column.align}
                    >
                      {column.label}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={currentColumns.length} sx={{ padding: 0 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && currentData?.map((row, index) => (
                  <TableRow hover key={row.Request_ID || row.Sangira_ID || index}>
                    {currentColumns.map((column) => {
                      const value = getValue(row, column.id);
                      return (
                        <StyledTableCell
                          key={column.id}
                          align={column.align}
                        >
                          {formatValue(column.id, value, row)}
                        </StyledTableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {!loading && currentData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={currentColumns.length} align="center">
                      <div className="py-8 text-gray-500">
                        No data found
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 500, 1000]}
            component="div"
            count={totalCount}
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
      </div>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        customer={customer}
        pendingInvoices={pendingInvoices}
        outstandingBalance={outstandingBalance}
        onGenerateInvoice={handleGenerateInvoice}
        loading={actionLoading}
      />
    </>
  );
}