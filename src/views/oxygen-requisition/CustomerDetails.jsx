import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

/* ─── Styled helpers ───────────────────────────────────────────────────── */
const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#f8fafc",
    color: C.textDim,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${C.border}`,
    padding: "10px 16px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: C.text,
    borderBottom: `1px solid ${C.border}`,
    padding: "14px 16px",
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
  loading,
}) {
  const [invoiceAmount, setInvoiceAmount] = React.useState("");
  const [invoiceNotes, setInvoiceNotes] = React.useState("");

  // Calculate total from pending invoices (cash deposits)
  const totalFromInvoices = React.useMemo(() => {
    if (!pendingInvoices || pendingInvoices.length === 0) return 0;
    return pendingInvoices.reduce(
      (sum, inv) => sum + (inv.Grand_Total_Price || inv.Price * inv.Quantity || 0),
      0,
    );
  }, [pendingInvoices]);

  const handleGenerateAndDownload = async () => {
    let amount = invoiceAmount;
    if (!amount && totalFromInvoices > 0) {
      amount = totalFromInvoices;
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
      // Clear form and close dialog
      setInvoiceAmount("");
      setInvoiceNotes("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <IconButton
          onClick={onClose}
          size="small"
          className="text-slate-400 hover:text-slate-600"
        >
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-6">
        {/* Pending Invoices Summary (Cash Deposits) */}
        {/* {pendingInvoices && pendingInvoices.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6 border border-amber-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MdPendingActions className="text-amber-600" size={20} />
              Pending Cash Deposit Invoices
            </h3>
            <div className="space-y-2">
              {pendingInvoices.map((invoice, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <span className="font-medium">{invoice.item?.Item_Name || "Cash Deposit"}</span>
                    {invoice.Sangira_Number && (
                      <span className="text-xs text-slate-500 ml-2">
                        Ref: {invoice.Sangira_Number}
                      </span>
                    )}
                  </div>
                  <div>
                    {invoice.Quantity && <span className="mr-2">×{invoice.Quantity}</span>}
                    <span className="font-semibold">
                      {currencyFormatter.format(invoice.Grand_Total_Price || invoice.Price * invoice.Quantity)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t border-amber-200 pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total Pending Amount:</span>
                  <span className="text-amber-700">
                    {currencyFormatter.format(totalFromInvoices)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Generate New Invoice */}
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
                totalFromInvoices > 0
                  ? `Recommended: ${currencyFormatter.format(totalFromInvoices)}`
                  : "Enter amount"
              }
              helperText={
                totalFromInvoices > 0
                  ? `Based on pending cash deposits: ${currencyFormatter.format(totalFromInvoices)}`
                  : ""
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
          onClick={onClose}
          className="text-slate-500 normal-case hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerateAndDownload}
          disabled={loading}
          variant="contained"
          className="normal-case font-semibold"
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

  React.useEffect(() => {
    loadCustomerData();
  }, [customerID]);

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
          item => item.Request_Type === "oxygen"
        );
        const cashDepositItems = requestItems.filter(
          item => item.Request_Type === "cash_deposit"
        );
        
        setOxygenOrders(oxygenItems);
        setCashDeposits(cashDepositItems);
        setPendingInvoices(pendingCashDeposit);
        
        const servedOrders = oxygenItems.filter(
          order => order?.Customer_Status?.toLowerCase() === "served"
        );
        setFulfilledOrders(servedOrders);
      }
    } catch (e) {
      console.error("Failed to load customer data:", e);
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoicePDF = (invoiceData, customerData, apiResponse, pendingInvoicesList) => {
    const doc = new jsPDF();

    // Add company header
    doc.setFontSize(24);
    doc.setTextColor(C.primary);
    doc.setFont("helvetica", "bold");
    doc.text("OXYGEN SUPPLIES INVOICE", 105, 20, { align: "center" });

    // Company info
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

    // Draw line
    doc.setDrawColor(C.border);
    doc.line(14, 48, 196, 48);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(C.text);
    doc.setFont("helvetica", "normal");
    
    const invoiceNumber = apiResponse?.sangiraData?.Sangira_Number || 
                         apiResponse?.Sangira_Number || 
                         `INV-${Date.now()}`;
    
    doc.text(`Invoice #: ${invoiceNumber}`, 14, 58);
    doc.text(`Date: ${formatDate(new Date())}`, 14, 65);
    doc.text(
      `Due Date: ${formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}`,
      14,
      72,
    );

    // Customer details
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 85);
    doc.setFont("helvetica", "normal");
    doc.text(customerData?.Customer_Name || "N/A", 14, 92);
    doc.text(customerData?.Phone_Number || "N/A", 14, 99);
    doc.text(customerData?.Email || "N/A", 14, 106);

    // Items table
    const tableData = [];
    if (pendingInvoicesList && pendingInvoicesList.length > 0) {
      pendingInvoicesList.forEach((inv) => {
        tableData.push([
          inv.item?.Item_Name || "Cash Deposit",
          inv.Quantity || 1,
          currencyFormatter.format(inv.Price || inv.Grand_Total_Price),
          currencyFormatter.format(inv.Grand_Total_Price || inv.Price * inv.Quantity),
        ]);
      });
    } else {
      tableData.push([
        "Oxygen Supply & Services",
        1,
        currencyFormatter.format(invoiceData.Grand_Total_Price || 0),
        currencyFormatter.format(invoiceData.Grand_Total_Price || 0),
      ]);
    }

    autoTable(doc, {
      startY: 115,
      head: [["Description", "Qty", "Unit Price", "Amount"]],
      body: tableData,
      foot: [
        [
          "",
          "",
          "Total Amount",
          currencyFormatter.format(invoiceData.Grand_Total_Price || 0),
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

    // Payment terms
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(C.muted);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Terms:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Payment is due within 30 days of invoice date.", 14, finalY + 6);

    // Notes
    if (invoiceData.Notes) {
      doc.text("Notes:", 14, finalY + 16);
      doc.text(invoiceData.Notes, 14, finalY + 22);
    }

    // Sangira Reference
    if (apiResponse?.sangiraData) {
      doc.text("Reference Information:", 14, finalY + 36);
      doc.setFont("helvetica", "bold");
      doc.text(`Sangira Number:`, 14, finalY + 42);
      doc.setFont("helvetica", "normal");
      doc.text(apiResponse.sangiraData.Sangira_Number, 70, finalY + 42);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Status:`, 14, finalY + 48);
      doc.setFont("helvetica", "normal");
      doc.text(apiResponse.sangiraData.Sangira_Status, 40, finalY + 48);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Expiry Date:`, 14, finalY + 54);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(apiResponse.sangiraData.Expire_Date), 60, finalY + 54);
    }

    // Footer
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
      `Invoice_${invoiceNumber}_${customerData?.Customer_Name || "Customer"}.pdf`,
    );
  };

  const handleGenerateInvoice = async (invoiceData) => {
    setActionLoading(true);
    try {
      const response = await apiClient.post(
        "/oxygen/oxygen-deposit",
        invoiceData
      );
      
      if (response.ok && !response.data?.error) {
        toast.success("Invoice generated successfully");
        
        // Generate and download PDF with response data
        generateInvoicePDF(invoiceData, customer, response.data, pendingInvoices);
        
        // Reload customer data to refresh pending invoices
        await loadCustomerData();
        
        return true;
      } else {
        toast.error(response.data?.error || "Failed to generate invoice");
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
    // Create PDF for a single pending invoice
    const doc = new jsPDF();

    // Add company header
    doc.setFontSize(24);
    doc.setTextColor(C.primary);
    doc.setFont("helvetica", "bold");
    doc.text("OXYGEN SUPPLIES INVOICE", 105, 20, { align: "center" });

    // Company info
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

    // Draw line
    doc.setDrawColor(C.border);
    doc.line(14, 48, 196, 48);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(C.text);
    doc.setFont("helvetica", "normal");
    
    const invoiceNumber = invoice.sangira?.Sangira_Number || invoice.Sangira_Number || `INV-${invoice.Sangira_ID}`;
    
    doc.text(`Invoice #: ${invoiceNumber}`, 14, 58);
    doc.text(`Date: ${formatDate(invoice.Request_Date)}`, 14, 65);
    doc.text(
      `Due Date: ${invoice.sangira?.Expire_Date ? formatDate(invoice.sangira.Expire_Date) : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}`,
      14,
      72,
    );

    // Customer details
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 85);
    doc.setFont("helvetica", "normal");
    doc.text(customer?.Customer_Name || "N/A", 14, 92);
    doc.text(customer?.Phone_Number || "N/A", 14, 99);
    doc.text(customer?.Email || "N/A", 14, 106);

    // Items table
    const tableData = [[
      invoice.item?.Item_Name || "Cash Deposit",
      invoice.Quantity || 1,
      currencyFormatter.format(invoice.Price || invoice.Grand_Total_Price),
      currencyFormatter.format(invoice.Grand_Total_Price || invoice.Price * invoice.Quantity),
    ]];

    autoTable(doc, {
      startY: 115,
      head: [["Description", "Qty", "Unit Price", "Amount"]],
      body: tableData,
      foot: [
        [
          "",
          "",
          "Total Amount",
          currencyFormatter.format(invoice.Grand_Total_Price || invoice.Price * invoice.Quantity || 0),
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

    // Payment terms
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(C.muted);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Terms:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Payment is due within 30 days of invoice date.", 14, finalY + 6);

    // Sangira Reference
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

    // Footer
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
      (sum, item) => sum + (item.Price * (item.Quantity || 1)),
      0,
    );
  }, [cashDeposits]);

  const totalPendingInvoiceAmount = React.useMemo(() => {
    return pendingInvoices.reduce(
      (sum, inv) => sum + (inv.Grand_Total_Price || inv.Price * (inv.Quantity || 1) || 0),
      0,
    );
  }, [pendingInvoices]);

  const outstandingBalance = totalOrdered - totalCashDeposited;

  const getStatusChip = (status) => {
    const config = {
      pending: { color: C.accent, bg: C.accentBg },
      approved: { color: C.primary, bg: C.primaryBg },
      served: { color: C.success, bg: C.successBg },
      dispatched: { color: C.info, bg: C.infoBg },
      requested: { color: C.warning, bg: C.warningBg },
      paid: { color: C.success, bg: C.successBg },
    };
    const cfg = config[status?.toLowerCase()] || config.pending;
    return (
      <Chip
        label={capitalize(status || "pending")}
        size="small"
        style={{
          backgroundColor: cfg.bg,
          color: cfg.color,
          fontWeight: "bold",
        }}
      />
    );
  };

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
          {pendingInvoices.length > 0 && (
            <Button
              onClick={() => setInvoiceOpen(true)}
              variant="contained"
              className="normal-case font-semibold"
              style={{ backgroundColor: C.primary }}
              startIcon={<MdReceipt />}
            >
              Generate Invoice ({pendingInvoices.length})
            </Button>
          )}
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                <MdEmail className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Contact
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
                <MdMonetizationOn className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Cash Deposits
                </span>
              </div>
              <div className="font-bold text-xl text-green-600">
                {currencyFormatter?.format(totalCashDeposited)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {cashDeposits.length} payment(s)
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <MdPayment className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Balance
                </span>
              </div>
              <div
                className={`font-bold text-xl ${outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {currencyFormatter.format(outstandingBalance)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {outstandingBalance > 0 ? "Outstanding" : "Settled"}
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
                  <h3 className="font-bold text-amber-800">Pending Cash Deposit Invoices</h3>
                  <p className="text-sm text-amber-700">
                    {pendingInvoices.length} invoice(s) awaiting payment totaling {currencyFormatter.format(totalPendingInvoiceAmount)}
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

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="border-b border-slate-200 px-4"
            TabIndicatorProps={{ style: { backgroundColor: C.primary } }}
          >
            <Tab
              label={`Oxygen Orders (${oxygenOrders.length})`}
              icon={<MdLocalShipping size={18} />}
              iconPosition="start"
              className="normal-case font-semibold text-sm"
            />
            <Tab
              label={`Cash Deposits (${cashDeposits.length})`}
              icon={<MdMonetizationOn size={18} />}
              iconPosition="start"
              className="normal-case font-semibold text-sm"
            />
            <Tab
              label={`Fulfilled Orders (${fulfilledOrders.length})`}
              icon={<MdCheckCircle size={18} />}
              iconPosition="start"
              className="normal-case font-semibold text-sm"
            />
            <Tab
              label={`Pending Invoices (${pendingInvoices.length})`}
              icon={<MdPendingActions size={18} />}
              iconPosition="start"
              className="normal-case font-semibold text-sm"
            />
          </Tabs>

          {/* Oxygen Orders Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="p-4">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Request ID</StyledTableCell>
                      <StyledTableCell>Item</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Unit Price</StyledTableCell>
                      <StyledTableCell>Total</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Request Date</StyledTableCell>
                      <StyledTableCell>Billing Type</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oxygenOrders.length > 0 ? (
                      oxygenOrders.map((item) => (
                        <TableRow
                          key={item.Request_ID}
                          className="hover:bg-slate-50"
                        >
                          <StyledTableCell className="font-semibold text-blue-600">
                            #{item.Request_ID}
                          </StyledTableCell>
                          <StyledTableCell>
                            {item.item?.Item_Name || `Item ${item.Item_ID}`}
                          </StyledTableCell>
                          <StyledTableCell>{item.Quantity}</StyledTableCell>
                          <StyledTableCell>
                            {currencyFormatter.format(item.Price)}
                          </StyledTableCell>
                          <StyledTableCell className="font-bold">
                            {currencyFormatter.format(
                              item.Price * item.Quantity,
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            {getStatusChip(item.Customer_Status)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatDate(item.Request_Date)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={capitalize(item.Billing_Type || "credit")}
                              size="small"
                              style={{
                                backgroundColor: item.Billing_Type === "credit" ? C.primaryBg : C.successBg,
                                color: item.Billing_Type === "credit" ? C.primary : C.success,
                              }}
                            />
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell
                          colSpan={8}
                          className="text-center text-slate-400 py-8"
                        >
                          No oxygen orders found
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {oxygenOrders.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-right">
                  <span className="text-sm text-blue-700 font-semibold">
                    Total Oxygen Orders: {currencyFormatter.format(totalOrdered)}
                  </span>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Cash Deposits Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="p-4">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Request ID</StyledTableCell>
                      <StyledTableCell>Item</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Amount</StyledTableCell>
                      <StyledTableCell>Payment Date</StyledTableCell>
                      <StyledTableCell>Sangira Number</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cashDeposits.length > 0 ? (
                      cashDeposits.map((deposit) => (
                        <TableRow
                          key={deposit.Request_ID}
                          className="hover:bg-slate-50"
                        >
                          <StyledTableCell className="font-semibold">
                            #{deposit.Request_ID}
                          </StyledTableCell>
                          <StyledTableCell>
                            {deposit.item?.Item_Name || "Cash Deposit"}
                          </StyledTableCell>
                          <StyledTableCell>{deposit.Quantity || 1}</StyledTableCell>
                          <StyledTableCell className="font-bold text-green-600">
                            {currencyFormatter.format(deposit.Price * (deposit.Quantity || 1))}
                          </StyledTableCell>
                          <StyledTableCell>
                            {deposit.Payment_Date ? formatDate(deposit.Payment_Date) : "—"}
                          </StyledTableCell>
                          <StyledTableCell className="text-slate-500">
                            {deposit.Sangira_ID || "—"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {getStatusChip(deposit.Customer_Status)}
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell
                          colSpan={7}
                          className="text-center text-slate-400 py-8"
                        >
                          No cash deposits recorded
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {cashDeposits.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-right">
                  <span className="text-sm text-green-700 font-semibold">
                    Total Cash Deposited: {currencyFormatter.format(totalCashDeposited)}
                  </span>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Fulfilled Orders Tab */}
          <TabPanel value={tabValue} index={2}>
            <div className="p-4">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Request ID</StyledTableCell>
                      <StyledTableCell>Item</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Amount</StyledTableCell>
                      <StyledTableCell>Served Date</StyledTableCell>
                      <StyledTableCell>Served By</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fulfilledOrders.length > 0 ? (
                      fulfilledOrders.map((order) => (
                        <TableRow
                          key={order.Request_ID}
                          className="hover:bg-slate-50"
                        >
                          <StyledTableCell className="font-semibold text-green-600">
                            #{order.Request_ID}
                          </StyledTableCell>
                          <StyledTableCell>
                            {order.item?.Item_Name || `Item ${order.Item_ID}`}
                          </StyledTableCell>
                          <StyledTableCell>{order.Quantity}</StyledTableCell>
                          <StyledTableCell className="font-bold text-green-600">
                            {currencyFormatter.format(order.Price * order.Quantity)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {order.Served_Date ? formatDate(order.Served_Date) : "—"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {order.served_by?.name || `Employee ${order.Served_By}`}
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell
                          colSpan={6}
                          className="text-center text-slate-400 py-8"
                        >
                          No fulfilled orders yet
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </TabPanel>

          {/* Pending Invoices Tab - With Download Button */}
          <TabPanel value={tabValue} index={3}>
            <div className="p-4">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Sangira Number</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Amount</StyledTableCell>
                      <StyledTableCell>Request Date</StyledTableCell>
                      <StyledTableCell>Expiry Date</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingInvoices.length > 0 ? (
                      pendingInvoices.map((invoice) => (
                        <TableRow
                          key={invoice.Sangira_ID}
                          className="hover:bg-slate-50"
                        >
                          <StyledTableCell className="font-mono text-sm">
                            {invoice.sangira?.Sangira_Number || invoice.Sangira_Number}
                          </StyledTableCell>
                          <StyledTableCell>{invoice.Quantity || 1}</StyledTableCell>
                          <StyledTableCell className="font-bold text-amber-600">
                            {currencyFormatter.format(invoice.Grand_Total_Price || invoice.Price * (invoice.Quantity || 1))}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatDate(invoice.Request_Date)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {invoice.sangira?.Expire_Date ? formatDate(invoice.sangira.Expire_Date) : "—"}
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={capitalize(invoice.sangira?.Sangira_Status || invoice.Customer_Status || "pending")}
                              size="small"
                              style={{
                                backgroundColor: C.accentBg,
                                color: C.accent,
                                fontWeight: "bold",
                              }}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<MdDownload />}
                              onClick={() => handleDownloadSingleInvoice(invoice)}
                              style={{ borderColor: C.primary, color: C.primary }}
                            >
                              Download
                            </Button>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell
                          colSpan={8}
                          className="text-center text-slate-400 py-8"
                        >
                          No pending invoices
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pendingInvoices.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-right">
                  <span className="text-sm text-amber-700 font-semibold">
                    Total Pending Invoices: {currencyFormatter.format(totalPendingInvoiceAmount)}
                  </span>
                </div>
              )}
            </div>
          </TabPanel>
        </div>
      </div>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        customer={customer}
        pendingInvoices={pendingInvoices}
        onGenerateInvoice={handleGenerateInvoice}
        loading={actionLoading}
      />
    </>
  );
}