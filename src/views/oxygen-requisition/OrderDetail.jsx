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
  Divider,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdCheckCircle,
  MdLocalShipping,
  MdInventory,
  MdPerson,
  MdCalendarToday,
  MdReceipt,
  MdClose,
  MdAdd,
  MdRemove,
  MdWarning,
} from "react-icons/md";
import {
  capitalize,
  currencyFormatter,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";
import apiClient from "../../api/Client";
import Breadcrumb from "../../components/Breadcrumb";

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

/* ─── Status config ────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: { color: C.accent, bg: C.accentBg, label: "Pending", step: 0 },
  approved: { color: C.primary, bg: C.primaryBg, label: "Approved", step: 1 },
  fulfilled: { color: C.success, bg: C.successBg, label: "Fulfilled", step: 2 },
  inactive: { color: C.danger, bg: C.dangerBg, label: "Inactive", step: 0 },
};

const STEPS = ["Pending", "Approved", "Fulfilled"];

/* ─── Reusable card ────────────────────────────────────────────────────── */
function InfoCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1 min-w-[220px] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="rounded-lg p-1.5 flex items-center"
          style={{ backgroundColor: C.primaryBg }}
        >
          <Icon size={16} style={{ color: C.primary }} />
        </div>
        <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ─── Fulfill dialog ────────────────────────────────────────────────────── */
function FulfillDialog({ open, onClose, order, onSubmit, loading }) {
  const [quantities, setQuantities] = React.useState({});
  const [reasons, setReasons] = React.useState({});
  const [stockGiven, setStockGiven] = React.useState({});
  const [stockReasons, setStockReasons] = React.useState({});

  React.useEffect(() => {
    if (order?.request) {
      const init = {};
      const initReasons = {};
      const initStock = {};
      const initStockReasons = {};
      order.request.forEach((r) => {
        init[r.Request_ID] = r.Quantity;
        initReasons[r.Request_ID] = "";
        initStock[r.Request_ID] = r.Quantity; // Start with full requested amount
        initStockReasons[r.Request_ID] = "";
      });
      setQuantities(init);
      setReasons(initReasons);
      setStockGiven(initStock);
      setStockReasons(initStockReasons);
    }
  }, [order]);

  const adjust = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(
        0,
        Math.min(
          order.request.find((r) => r.Request_ID === id)?.Quantity || 0,
          (prev[id] || 0) + delta,
        ),
      ),
    }));
  };

  const handleStockChange = (requestId, value) => {
    const originalQty =
      order.request.find((r) => r.Request_ID === requestId)?.Quantity || 0;
    let newValue = parseInt(value) || 1;

    // Ensure value is at least 1
    if (newValue < 1) newValue = 1;

    // Ensure value doesn't exceed the requested amount
    if (newValue > originalQty) newValue = originalQty;

    setStockGiven((prev) => ({
      ...prev,
      [requestId]: newValue,
    }));

    // Clear reason if stock is now at maximum
    if (newValue >= originalQty) {
      setStockReasons((prev) => ({
        ...prev,
        [requestId]: "",
      }));
    }
  };

  const isQuantityLess = (requestId) => {
    const originalQty =
      order.request.find((r) => r.Request_ID === requestId)?.Quantity || 0;
    return (quantities[requestId] || 0) < originalQty;
  };

  const isStockLess = (requestId) => {
    const originalQty =
      order.request.find((r) => r.Request_ID === requestId)?.Quantity || 0;
    return (stockGiven[requestId] || 0) < originalQty;
  };

  const handleSubmit = () => {
    // Validate reasons for items with reduced quantities
    const validationErrors = [];
    order.request.forEach((r) => {
      if (isQuantityLess(r.Request_ID) && !reasons[r.Request_ID]?.trim()) {
        validationErrors.push(
          `Please provide a reason for reduced quantity of ${r?.item?.Item_Name}`,
        );
      }
      if (isStockLess(r.Request_ID) && !stockReasons[r.Request_ID]?.trim()) {
        validationErrors.push(
          `Please provide a reason for reduced stock cylinders of ${r?.item?.Item_Name}`,
        );
      }
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    const fulfillData = order.request.map((r) => ({
      Request_ID: r.Request_ID,
      Quantity_Fulfilled: quantities[r.Request_ID] ?? r.Quantity,
      Quantity_To_Production: isQuantityLess(r.Request_ID)
        ? r.Quantity - (quantities[r.Request_ID] || 0)
        : 0,
      Reason_If_Less: isQuantityLess(r.Request_ID)
        ? reasons[r.Request_ID]
        : null,
      Stock_Cylinders_Given: stockGiven[r.Request_ID] || 1,
      Stock_To_Production: isStockLess(r.Request_ID)
        ? r.Quantity - (stockGiven[r.Request_ID] || 0)
        : 0,
      Stock_Reason_If_Less: isStockLess(r.Request_ID)
        ? stockReasons[r.Request_ID]
        : null,
    }));
    onSubmit(fulfillData);
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
          <MdLocalShipping style={{ color: C.primary }} size={20} />
          <span>Fulfill Order</span>
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
        <p className="text-slate-500 text-sm mb-5">
          Set the quantity to provide for each item. If less than ordered,
          provide a reason and the remaining will be sent back to production.
        </p>

        <div className="flex flex-col gap-4">
          {order?.request?.map((r) => {
            const providedQty = quantities[r.Request_ID] ?? r.Quantity;
            const originalQty = r.Quantity;
            const isLess = providedQty < originalQty;
            const toProduction = isLess ? originalQty - providedQty : 0;
            const currentStock = stockGiven[r.Request_ID] || 1;
            const stockIsLess = currentStock < originalQty;
            const stockToProduction = stockIsLess
              ? originalQty - currentStock
              : 0;

            return (
              <div
                key={r.Request_ID}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-sm text-slate-700">
                      {r?.item?.Item_Name}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Ordered: {formatter.format(originalQty)} units
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <IconButton
                      size="small"
                      onClick={() => adjust(r.Request_ID, -1)}
                      disabled={providedQty <= 0}
                      className="bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 disabled:opacity-50"
                    >
                      <MdRemove size={14} />
                    </IconButton>
                    <span
                      className={`min-w-[40px] text-center font-bold text-lg ${isLess ? "text-orange-600" : "text-slate-800"}`}
                    >
                      {providedQty}
                    </span>
                    <IconButton
                      size="small"
                      onClick={() => adjust(r.Request_ID, 1)}
                      disabled={providedQty >= originalQty}
                      className="bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 disabled:opacity-50"
                    >
                      <MdAdd size={14} />
                    </IconButton>
                  </div>
                </div>

                {/* Warning and reason for partial fulfillment */}
                {isLess && (
                  <div className="space-y-3 mb-3">
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                      <MdWarning className="text-orange-600" size={16} />
                      <div className="text-sm text-orange-700">
                        <span className="font-medium">
                          {toProduction} units
                        </span>{" "}
                        will be sent back to production
                      </div>
                    </div>

                    <TextField
                      fullWidth
                      size="small"
                      label="Reason for reduced quantity"
                      value={reasons[r.Request_ID] || ""}
                      onChange={(e) =>
                        setReasons((prev) => ({
                          ...prev,
                          [r.Request_ID]: e.target.value,
                        }))
                      }
                      required
                      placeholder="Please explain why the full quantity cannot be fulfilled"
                      className="bg-white"
                    />
                  </div>
                )}

                {/* Stock cylinders input with validation */}
                <div className="space-y-3">
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={`Stock Cylinders Given to Customer (Min: 1, Max: ${originalQty})`}
                    value={currentStock}
                    onChange={(e) =>
                      handleStockChange(r.Request_ID, e.target.value)
                    }
                    InputProps={{
                      inputProps: {
                        min: 1,
                        max: originalQty,
                      },
                    }}
                    helperText={`You can provide between 1 and ${originalQty} stock cylinders`}
                    className="bg-white"
                  />

                  {/* Warning and reason for reduced stock cylinders */}
                  {stockIsLess && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <MdWarning className="text-yellow-600" size={16} />
                        <div className="text-sm text-yellow-700">
                          <span className="font-medium">
                            {stockToProduction} stock cylinders
                          </span>{" "}
                          will be sent back to production
                        </div>
                      </div>

                      <TextField
                        fullWidth
                        size="small"
                        label="Reason for reduced stock cylinders"
                        value={stockReasons[r.Request_ID] || ""}
                        onChange={(e) =>
                          setStockReasons((prev) => ({
                            ...prev,
                            [r.Request_ID]: e.target.value,
                          }))
                        }
                        required
                        placeholder="Please explain why fewer stock cylinders are being provided"
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          className="text-white normal-case font-semibold rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: C.success }}
        >
          {loading ? "Fulfilling…" : "Confirm Fulfillment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main component ───────────────────────────────────────────────────── */
export default function OrderDetail() {
  const { orderID } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [fulfillOpen, setFulfillOpen] = React.useState(false);

  /* load order */
  React.useEffect(() => {
    loadOrder();
  }, [orderID]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/oxygen/oxygen-request?Request_Batch_ID=${orderID}`,
      );
      if (response.ok && !response.data?.error) {
        setOrder(response?.data?.data?.data[0]);
      } else {
        toast.error(response.data?.error || "Failed to load order");
      }
    } catch (e) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  /* ── action helpers ── */
  const handleApprove = async () => {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.post(`/oxygen/approve-oxygen-request`, {
        action: "approve",
        Customer_ID: order?.Customer_ID,
        Employee_ID: employeeId,
        Request_Batch_ID: orderID,
      });
      if (response.ok && !response.data?.error) {
        toast.success("Order approved successfully");
        loadOrder();
      } else {
        toast.error(response.data?.error || "Failed to approve order");
      }
    } catch (e) {
      toast.error("Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfill = async (fulfillData) => {
    setActionLoading(true);
    try {
      const response = await apiClient.post(
        `/oxygen/oxygen-request/${orderID}/fulfill`,
        {
          items: fulfillData,
        },
      );
      if (response.ok && !response.data?.error) {
        toast.success("Order fulfilled successfully");
        setFulfillOpen(false);
        loadOrder();
      } else {
        toast.error(response.data?.error || "Failed to fulfill order");
      }
    } catch (e) {
      toast.error("Fulfillment failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── derived values ── */
  const derivedStatus = (o) => {
    if (!o) return "pending";
    return (o.request?.[0]?.Customer_Status || "pending").toLowerCase();
  };

  const totalAmount = React.useMemo(() => {
    if (!order?.request) return 0;
    return order.request.reduce((s, i) => s + i.Price * i.Quantity, 0);
  }, [order]);

  const status = derivedStatus(order);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  /* ── action button logic ── */
  const primaryAction = React.useMemo(() => {
    if (status === "pending")
      return {
        label: "Approve Order",
        icon: MdCheckCircle,
        color: C.primary,
        handler: handleApprove,
      };
    return null;
  }, [status]);

  const canFulfill = status === "approved";

  /* ── render ── */
  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: C.bg }}>
        <LinearProgress
          className="rounded"
          style={{ backgroundColor: C.primaryBg }}
        />
        <div className="flex items-center gap-2 mt-4">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
          <p className="text-slate-500">Loading order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: C.bg }}
      >
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-slate-500 text-lg font-medium">Order not found</p>
          <p className="text-slate-400 text-sm mt-1">
            The requested order could not be located
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb />
      <div className="" style={{ backgroundColor: C.bg }}>
        {/* ── Top bar ── */}
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
                Order No: <span style={{ color: C.primary }}>{orderID}</span>
              </h1>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-3">
            <div
              className="rounded-full px-4 py-1.5 flex items-center gap-1.5 border shadow-sm backdrop-blur-sm"
              style={{
                backgroundColor: statusCfg.bg,
                borderColor: `${statusCfg.color}33`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: statusCfg.color }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: statusCfg.color }}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* ── Progress stepper ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
          <Stepper activeStep={statusCfg.step} alternativeLabel>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    style: {
                      color: statusCfg.step >= index ? C.primary : C.border,
                      transition: "color 0.3s ease",
                    },
                  }}
                >
                  <span className="text-xs text-slate-400 font-semibold">
                    {label}
                  </span>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        {/* ── Info cards row ── */}
        <div className="flex gap-4 flex-wrap mb-6">
          <InfoCard title="Customer" icon={MdPerson}>
            <div className="font-bold text-base text-slate-800">
              {order.customer?.Customer_Name || "N/A"}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {order.customer?.Phone_Number || "—"}
            </div>
            <div className="text-slate-400 text-sm">
              {order.customer?.Email || "—"}
            </div>
          </InfoCard>

          <InfoCard title="Order Info" icon={MdReceipt}>
            <div className="text-xl font-bold" style={{ color: C.primary }}>
              {currencyFormatter.format(totalAmount)}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {order.request?.length || 0} line item
              {order.request?.length !== 1 ? "s" : ""}
            </div>
          </InfoCard>

          <InfoCard title="Ordered By" icon={MdPerson}>
            <div className="font-bold text-sm text-slate-800">
              {capitalize(order.employee?.name || "N/A")}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {order.employee?.email || "—"}
            </div>
          </InfoCard>

          <InfoCard title="Order Date" icon={MdCalendarToday}>
            <div className="font-semibold text-sm text-slate-700">
              {order.Request_Batch_Date
                ? formatDateTimeForDb(order.Request_Batch_Date)
                : "N/A"}
            </div>
          </InfoCard>
        </div>

        {/* ── Items table ── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          <div
            className="p-4 sm:px-6 border-b border-slate-200 flex items-center gap-2"
            style={{ backgroundColor: C.primaryBg }}
          >
            <MdInventory style={{ color: C.primary }} size={18} />
            <span
              className="font-bold text-sm"
              style={{ color: C.primaryDark }}
            >
              Order Items
            </span>
            <span className="ml-auto text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
              {order.request?.length || 0} items
            </span>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {["#", "Item", "Unit Price", "Quantity", "Line Total"].map(
                    (col) => (
                      <StyledTableCell key={col}>{col}</StyledTableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {order.request?.map((r, idx) => {
                  const lineTotal = r.Price * r.Quantity;
                  return (
                    <TableRow
                      key={r.Request_ID || idx}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <StyledTableCell className="text-slate-400">
                        {idx + 1}
                      </StyledTableCell>
                      <StyledTableCell>
                        <div className="font-semibold text-slate-800">
                          {r?.item?.Item_Name}
                        </div>
                      </StyledTableCell>
                      <StyledTableCell className="text-slate-700">
                        {currencyFormatter.format(r.Price)}
                      </StyledTableCell>
                      <StyledTableCell className="text-slate-700">
                        {formatter.format(r.Quantity)}
                      </StyledTableCell>
                      <StyledTableCell
                        className="font-bold"
                        style={{ color: C.primary }}
                      >
                        {currencyFormatter.format(lineTotal)}
                      </StyledTableCell>
                    </TableRow>
                  );
                })}

                {/* Totals row */}
                <TableRow style={{ backgroundColor: C.primaryBg }}>
                  <StyledTableCell
                    colSpan={4}
                    className="text-right font-bold text-slate-600"
                  >
                    Order Total
                  </StyledTableCell>
                  <StyledTableCell
                    className="font-extrabold text-base"
                    style={{ color: C.success }}
                  >
                    {currencyFormatter.format(totalAmount)}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* ── Action bar ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-3 flex-wrap shadow-sm">
          <div>
            <div className="text-sm text-slate-400">Current Status</div>
            <div
              className="font-bold text-lg"
              style={{ color: statusCfg.color }}
            >
              {statusCfg.label}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Approve */}
            {primaryAction && (
              <button
                onClick={primaryAction.handler}
                disabled={actionLoading}
                className="text-white border-none rounded-lg px-6 py-2.5 font-bold text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: primaryAction.color }}
              >
                <primaryAction.icon size={18} />
                {actionLoading ? "Processing…" : primaryAction.label}
              </button>
            )}

            {/* Fulfill */}
            {canFulfill && (
              <button
                onClick={() => setFulfillOpen(true)}
                disabled={actionLoading}
                className="text-white border-none rounded-lg px-6 py-2.5 font-bold text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: C.success }}
              >
                <MdLocalShipping size={18} />
                Fulfill Order
              </button>
            )}

            {status === "fulfilled" && (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <MdCheckCircle size={20} />
                Order Complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fulfill dialog ── */}
      <FulfillDialog
        open={fulfillOpen}
        onClose={() => setFulfillOpen(false)}
        order={order}
        onSubmit={handleFulfill}
        loading={actionLoading}
      />
    </>
  );
}
