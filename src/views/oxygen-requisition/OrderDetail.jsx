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
  MdPayments,
  MdAssignmentReturn,
  MdFlightTakeoff,
  MdAccountBalance,
} from "react-icons/md";
import {
  capitalize,
  currencyFormatter,
  formatDateTimeForDb,
  formatter,
  reportError,
} from "../../../helpers";
import apiClient from "../../api/Client";
import Breadcrumb from "../../components/Breadcrumb";

const employeeId = localStorage.getItem("employeeId");

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
  dispatch: "#7c3aed",
  dispatchBg: "#ede9fe",
  credit: "#0891b2",
  creditBg: "#ecfeff",
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
  requested: { color: C.success, bg: C.successBg, label: "Fulfilled", step: 2 },
  fulfilled: { color: C.success, bg: C.successBg, label: "Fulfilled", step: 2 },
  paid: { color: C.success, bg: C.successBg, label: "Paid", step: 2 },
  dispatched: {
    color: C.dispatch,
    bg: C.dispatchBg,
    label: "Dispatched",
    step: 3,
  },
  served: {
    color: C.dispatch,
    bg: C.dispatchBg,
    label: "Dispatched",
    step: 3,
  },
  inactive: { color: C.danger, bg: C.dangerBg, label: "Inactive", step: 0 },
};

const STEPS = ["Pending", "Approved", "Fulfilled", "Dispatched"];

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
  const { orderID } = useParams();

  React.useEffect(() => {
    if (order?.request) {
      const init = {};
      const initReasons = {};
      const initStock = {};
      const initStockReasons = {};
      order.request.forEach((r) => {
        init[r.Request_ID] = r.Quantity;
        initReasons[r.Request_ID] = "";
        initStock[r.Request_ID] = r.Quantity;
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

    if (newValue < 1) newValue = 1;
    if (newValue > originalQty) newValue = originalQty;

    setStockGiven((prev) => ({
      ...prev,
      [requestId]: newValue,
    }));

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

  // Calculate grand total for fulfilled quantities
  const grandTotalFulfilled = React.useMemo(() => {
    if (!order?.request) return 0;
    return order.request.reduce((sum, r) => {
      const fulfilledQty = quantities[r.Request_ID] ?? r.Quantity;
      return sum + r.Price * fulfilledQty;
    }, 0);
  }, [order, quantities]);

  const isCashCustomer = React.useMemo(() => {
    return (
      (
        order?.request?.[0]?.Billing_Type ||
        order?.customer?.Payment_Method ||
        ""
      ).toLowerCase() === "cash"
    );
  }, [order]);

  const isCreditCustomer = React.useMemo(() => {
    return (
      (
        order?.request?.[0]?.Billing_Type ||
        order?.customer?.Payment_Method ||
        ""
      ).toLowerCase() === "credit"
    );
  }, [order]);

  const handleSubmit = () => {
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

    // const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    // Create payload in the required format
    const requestIDs = order?.request?.map((r) => r.Request_ID);

    const items = order?.request?.map((r) => ({
      Request_ID: r.Request_ID,
      Quantity: quantities[r.Request_ID] ?? r.Quantity,
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

    const fulfillPayload = {
      Request_ID: requestIDs,
      items: items,
      Employee_ID: employeeId,
      Billing_Type:
        order?.request?.[0]?.Billing_Type || order?.customer?.Payment_Method,
      Customer_ID: order?.customer?.Customer_ID,
      Customer_Name: order?.customer?.Customer_Name,
      Grand_Total_Price: grandTotalFulfilled,
      Phone_Number: order?.customer?.Phone_Number,
      Request_Batch_ID: orderID,
    };

    onSubmit(fulfillPayload);
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

        {/* Billing Type Info */}
        <div
          className={`mb-4 p-3 rounded-lg border ${isCashCustomer ? "bg-amber-50 border-amber-200" : "bg-cyan-50 border-cyan-200"}`}
        >
          <div className="flex items-center gap-2">
            {isCashCustomer ? (
              <MdPayments className="text-amber-600" size={18} />
            ) : (
              <MdAccountBalance className="text-cyan-600" size={18} />
            )}
            <span
              className={`text-sm font-semibold ${isCashCustomer ? "text-amber-700" : "text-cyan-700"}`}
            >
              {isCashCustomer
                ? "Cash Customer - Sangira will be generated"
                : "Credit Customer - Order will be added to bill"}
            </span>
          </div>
        </div>

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

/* ─── Dispatch dialog ────────────────────────────────────────────────────── */
function DispatchDialog({ open, onClose, order, onSubmit, loading }) {
  const [gsfCylinders, setGsfCylinders] = React.useState({});
  const [dispatchNotes, setDispatchNotes] = React.useState("");
  const { orderID } = useParams();

  React.useEffect(() => {
    if (order?.request) {
      const init = {};
      order.request.forEach((r) => {
        init[r.Request_ID] = 0;
      });
      setGsfCylinders(init);
    }
  }, [order]);

  const handleGsfChange = (requestId, value) => {
    const fulfilledQty =
      order.request.find((r) => r.Request_ID === requestId)
        ?.Quantity_Fulfilled ||
      order.request.find((r) => r.Request_ID === requestId)?.Quantity ||
      0;
    let newValue = parseInt(value) || 0;

    if (newValue < 0) newValue = 0;
    if (newValue > fulfilledQty) newValue = fulfilledQty;

    setGsfCylinders((prev) => ({
      ...prev,
      [requestId]: newValue,
    }));
  };

  const getFulfilledQuantity = (request) => {
    if (
      request.Quantity_Fulfilled !== undefined &&
      request.Quantity_Fulfilled !== null
    ) {
      return request.Quantity_Fulfilled;
    }
    const status = (request.Customer_Status || "").toLowerCase();
    if (
      status === "requested" ||
      status === "fulfilled" ||
      status === "dispatched" ||
      status === "paid"
    ) {
      return request.Quantity;
    }
    return 0;
  };

  const totalFulfilledCost = React.useMemo(() => {
    if (!order?.request) return 0;
    return order.request.reduce((sum, r) => {
      return sum + r.Price * getFulfilledQuantity(r);
    }, 0);
  }, [order]);

  const totalOrderedCost = React.useMemo(() => {
    if (!order?.request) return 0;
    return order.request.reduce((sum, r) => sum + r.Price * r.Quantity, 0);
  }, [order]);

  const handleSubmit = () => {
    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    // Create payload in the required format
    const requestIDs = order?.request?.map((r) => r.Request_ID);

    const dispatchData = {
      items: order?.request?.map((r) => ({
        Request_ID: r.Request_ID,
        Gsf_Mitungi_Quantity: gsfCylinders[r.Request_ID] || 0,
      })),
      remarks: dispatchNotes,
      action: "served",
      Customer_ID: order?.Customer_ID,
      Employee_ID: employeeId,
      Request_Batch_ID: orderID,
      Request_ID: requestIDs,
    };
    onSubmit(dispatchData);
  };

  // Get payment details
  const paymentMethod =
    order?.request?.[0]?.Billing_Type ||
    order?.customer?.Payment_Method ||
    "cash";
  const isCashCustomer = paymentMethod.toLowerCase() === "cash";
  const isCreditCustomer = paymentMethod.toLowerCase() === "credit";
  const sangiraNumber = order?.request?.[0]?.sangira?.Sangira_Number || null;
  const sangiraStatus = order?.request?.[0]?.sangira?.Sangira_Status || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "bg-white border border-slate-200 rounded-2xl shadow-xl",
      }}
    >
      <DialogTitle className="font-bold border-b border-slate-200 flex justify-between items-center text-slate-800">
        <div className="flex items-center gap-2">
          <MdFlightTakeoff style={{ color: C.dispatch }} size={20} />
          <span>Dispatch Order</span>
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
        {/* Payment and Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MdPayments className="text-slate-600" size={18} />
              <span className="text-sm font-semibold text-slate-700">
                Payment Method
              </span>
            </div>
            <div className="text-lg font-bold" style={{ color: C.primary }}>
              {capitalize(paymentMethod)}
            </div>
            {isCashCustomer && (
              <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                <div className="text-sm text-amber-700 font-medium">
                  Cash Payment Required
                </div>
                <div className="text-lg font-bold text-amber-800 mt-1">
                  {currencyFormatter.format(totalFulfilledCost)}
                </div>
              </div>
            )}
            {isCreditCustomer && (
              <div className="mt-2 p-2 bg-cyan-50 rounded border border-cyan-200">
                <div className="text-sm text-cyan-700 font-medium">
                  Credit Customer
                </div>
                <div className="text-sm text-cyan-600 mt-1">
                  Added to customer bill
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MdAssignmentReturn className="text-slate-600" size={18} />
              <span className="text-sm font-semibold text-slate-700">
                {isCashCustomer ? "Sangira Number" : "Order Reference"}
              </span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {isCashCustomer
                ? sangiraNumber || "N/A"
                : `Order #${order?.Request_Batch_ID || "N/A"}`}
            </div>
            {isCashCustomer && sangiraStatus && (
              <Chip
                label={capitalize(sangiraStatus)}
                size="small"
                style={{
                  backgroundColor:
                    sangiraStatus === "completed" ? C.successBg : C.warningBg,
                  color: sangiraStatus === "completed" ? C.success : C.warning,
                  fontWeight: "bold",
                  marginTop: "4px",
                }}
              />
            )}
            {isCreditCustomer && (
              <Chip
                label="Paid"
                size="small"
                style={{
                  backgroundColor: C.successBg,
                  color: C.success,
                  fontWeight: "bold",
                  marginTop: "4px",
                }}
              />
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MdReceipt className="text-slate-600" size={18} />
              <span className="text-sm font-semibold text-slate-700">
                Cost Summary
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ordered:</span>
                <span className="font-semibold">
                  {currencyFormatter.format(totalOrderedCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fulfilled:</span>
                <span className="font-semibold text-green-600">
                  {currencyFormatter.format(totalFulfilledCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-4">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <span className="font-bold text-sm text-slate-700">
              Dispatch Items
            </span>
          </div>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Item</StyledTableCell>
                  <StyledTableCell align="center">Ordered Qty</StyledTableCell>
                  <StyledTableCell align="center">
                    Fulfilled Qty
                  </StyledTableCell>
                  <StyledTableCell align="right">Unit Price</StyledTableCell>
                  <StyledTableCell align="right">Ordered Cost</StyledTableCell>
                  <StyledTableCell align="right">
                    Fulfilled Cost
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    GSF Cylinders
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order?.request?.map((r) => {
                  const fulfilledQty = getFulfilledQuantity(r);
                  const orderedCost = r.Price * r.Quantity;
                  const fulfilledCost = r.Price * fulfilledQty;

                  return (
                    <TableRow key={r.Request_ID} className="hover:bg-slate-50">
                      <StyledTableCell>
                        <div className="font-semibold text-slate-800">
                          {r?.item?.Item_Name}
                        </div>
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        className="text-slate-600"
                      >
                        {formatter.format(r.Quantity)}
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        className="text-green-600 font-semibold"
                      >
                        {formatter.format(fulfilledQty)}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {currencyFormatter.format(r.Price)}
                      </StyledTableCell>
                      <StyledTableCell align="right" className="text-slate-600">
                        {currencyFormatter.format(orderedCost)}
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        className="text-green-600 font-semibold"
                      >
                        {currencyFormatter.format(fulfilledCost)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={gsfCylinders[r.Request_ID] || 0}
                          onChange={(e) =>
                            handleGsfChange(r.Request_ID, e.target.value)
                          }
                          InputProps={{
                            inputProps: {
                              min: 0,
                              max: fulfilledQty,
                            },
                          }}
                          sx={{ width: 100 }}
                        />
                      </StyledTableCell>
                    </TableRow>
                  );
                })}

                {/* Totals Row */}
                <TableRow style={{ backgroundColor: C.primaryBg }}>
                  <StyledTableCell
                    colSpan={1}
                    className="font-bold text-slate-700"
                  >
                    Totals
                  </StyledTableCell>
                  <StyledTableCell align="center" className="font-bold">
                    {formatter.format(
                      order?.request?.reduce((sum, r) => sum + r.Quantity, 0) ||
                        0,
                    )}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    className="font-bold text-green-600"
                  >
                    {formatter.format(
                      order?.request?.reduce(
                        (sum, r) => sum + getFulfilledQuantity(r),
                        0,
                      ) || 0,
                    )}
                  </StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell align="right" className="font-bold">
                    {currencyFormatter.format(totalOrderedCost)}
                  </StyledTableCell>
                  <StyledTableCell
                    align="right"
                    className="font-bold text-green-600"
                  >
                    {currencyFormatter.format(totalFulfilledCost)}
                  </StyledTableCell>
                  <StyledTableCell align="center" className="font-bold">
                    {formatter.format(
                      Object.values(gsfCylinders).reduce(
                        (sum, val) => sum + (val || 0),
                        0,
                      ),
                    )}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Dispatch Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Dispatch Notes"
          value={dispatchNotes}
          onChange={(e) => setDispatchNotes(e.target.value)}
          placeholder="Add any notes about the dispatch..."
          className="bg-white"
        />
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
          style={{ backgroundColor: C.dispatch }}
        >
          {loading ? "Dispatching…" : "Confirm Dispatch"}
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
  const [dispatchOpen, setDispatchOpen] = React.useState(false);

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
        `/oxygen/request-sangira-number`,
        fulfillData,
      );
      if (response.ok && !response.data?.error) {
        toast.success("Order fulfilled successfully");
        setFulfillOpen(false);
        loadOrder();
      } else {
        reportError(response, "Failed to fulfill order");
      }
    } catch (e) {
      toast.error("Fulfillment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async (dispatchData) => {
    setActionLoading(true);
    try {
      const response = await apiClient.post(
        `/oxygen/approve-oxygen-request`,
        dispatchData,
      );
      if (response.ok && !response.data?.error) {
        toast.success("Order dispatched successfully");
        setDispatchOpen(false);
        loadOrder();
      } else {
        toast.error(response.data?.error || "Failed to dispatch order");
      }
    } catch (e) {
      toast.error("Dispatch failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── derived values ── */
  const derivedStatus = (o) => {
    if (!o) return "pending";
    const status = (o.request?.[0]?.Customer_Status || "pending").toLowerCase();
    if (status === "requested") return "fulfilled";
    if (status === "paid") return "paid";
    return status;
  };

  const originalStatus = React.useMemo(() => {
    if (!order?.request?.[0]?.Customer_Status) return "pending";
    return order.request[0].Customer_Status.toLowerCase();
  }, [order]);

  const isFulfilledOrRequested = React.useMemo(() => {
    if (!order?.request?.[0]?.Customer_Status) return false;
    const status = order.request[0].Customer_Status.toLowerCase();
    return (
      status === "fulfilled" ||
      status === "requested" ||
      status === "dispatched" ||
      status === "paid"
    );
  }, [order]);

  const isCashCustomer = React.useMemo(() => {
    return (
      (
        order?.request?.[0]?.Billing_Type ||
        order?.customer?.Payment_Method ||
        ""
      ).toLowerCase() === "cash"
    );
  }, [order]);

  const isCreditCustomer = React.useMemo(() => {
    return (
      (
        order?.request?.[0]?.Billing_Type ||
        order?.customer?.Payment_Method ||
        ""
      ).toLowerCase() === "credit"
    );
  }, [order]);

  const hasSangira = React.useMemo(() => {
    return order?.request?.[0]?.sangira && order.request[0].sangira !== null;
  }, [order]);

  const getFulfilledQuantity = (request) => {
    if (
      request.Quantity_Fulfilled !== undefined &&
      request.Quantity_Fulfilled !== null
    ) {
      return request.Quantity_Fulfilled;
    }
    const status = (request.Customer_Status || "").toLowerCase();
    if (
      status === "requested" ||
      status === "fulfilled" ||
      status === "dispatched" ||
      status === "paid"
    ) {
      return request.Quantity;
    }
    return 0;
  };

  const totalAmount = React.useMemo(() => {
    if (!order?.request) return 0;
    return order.request.reduce((s, i) => s + i.Price * i.Quantity, 0);
  }, [order]);

  const totalFulfilledAmount = React.useMemo(() => {
    if (!order?.request) return 0;
    return order.request.reduce((s, i) => {
      const fulfilledQty = getFulfilledQuantity(i);
      return s + i.Price * fulfilledQty;
    }, 0);
  }, [order]);

  const sangiraNumber = React.useMemo(() => {
    if (!order?.request?.[0]?.sangira?.Sangira_Number) return null;
    return order.request[0].sangira.Sangira_Number;
  }, [order]);

  const sangiraStatus = React.useMemo(() => {
    if (!order?.request?.[0]?.sangira?.Sangira_Status) return null;
    return order.request[0].sangira.Sangira_Status;
  }, [order]);

  const sangiraGrandTotal = React.useMemo(() => {
    if (!order?.request?.[0]?.sangira?.Grand_Total_Price) return 0;
    return order.request[0].sangira.Grand_Total_Price;
  }, [order]);

  const paymentDate = React.useMemo(() => {
    if (!order?.request?.[0]?.Payment_Date) return null;
    return order.request[0].Payment_Date;
  }, [order]);

  const billingType = React.useMemo(() => {
    if (!order?.request?.[0]?.Billing_Type)
      return order?.customer?.Payment_Method || "N/A";
    return order.request[0].Billing_Type;
  }, [order]);

  const status = derivedStatus(order);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  /* ── action button logic ── */
  const primaryAction = React.useMemo(() => {
    if (originalStatus === "pending")
      return {
        label: "Approve Order",
        icon: MdCheckCircle,
        color: C.primary,
        handler: handleApprove,
      };
    return null;
  }, [originalStatus]);

  const canFulfill = originalStatus === "approved";
  const canDispatch =
    originalStatus === "fulfilled" ||
    originalStatus === "requested" ||
    originalStatus === "paid";

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
            {isCreditCustomer && (
              <Chip
                label="Credit"
                size="small"
                style={{
                  backgroundColor: C.creditBg,
                  color: C.credit,
                  fontWeight: "bold",
                }}
              />
            )}
            {isCashCustomer && (
              <Chip
                label="Cash"
                size="small"
                style={{
                  backgroundColor: C.warningBg,
                  color: C.warning,
                  fontWeight: "bold",
                }}
              />
            )}
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
            {isFulfilledOrRequested && (
              <div className="text-sm text-green-600 font-semibold mt-1">
                Fulfilled: {currencyFormatter.format(totalFulfilledAmount)}
              </div>
            )}
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

        {/* ── Additional Info Cards for Fulfilled/Requested/Paid Orders ── */}
        {isFulfilledOrRequested && (
          <div className="flex gap-4 flex-wrap mb-6">
            {/* Sangira Number - Only for cash customers */}
            {isCashCustomer && (
              <InfoCard title="Sangira Number" icon={MdAssignmentReturn}>
                <div className="font-bold text-base text-slate-800">
                  {sangiraNumber || "N/A"}
                </div>
                {sangiraStatus && sangiraStatus !== "N/A" && (
                  <Chip
                    label={capitalize(sangiraStatus)}
                    size="small"
                    style={{
                      backgroundColor:
                        sangiraStatus === "completed"
                          ? C.successBg
                          : C.warningBg,
                      color:
                        sangiraStatus === "completed" ? C.success : C.warning,
                      fontWeight: "bold",
                      marginTop: "4px",
                    }}
                  />
                )}
              </InfoCard>
            )}

            {/* Billing Details */}
            <InfoCard title="Billing Details" icon={MdPayments}>
              <div className="text-sm text-slate-700">
                <span className="font-semibold">Type: </span>
                {capitalize(billingType)}
              </div>
              {isCashCustomer && (
                <div className="text-sm text-amber-600 font-semibold mt-1">
                  Amount Due:{" "}
                  {currencyFormatter.format(
                    sangiraGrandTotal || totalFulfilledAmount,
                  )}
                </div>
              )}
              {isCreditCustomer && (
                <div className="text-sm text-cyan-600 font-semibold mt-1">
                  Added to Customer Bill
                </div>
              )}
              {paymentDate && (
                <div className="text-xs text-slate-500 mt-1">
                  Paid: {formatDateTimeForDb(paymentDate)}
                </div>
              )}
            </InfoCard>

            {/* Status Card */}
            <InfoCard
              title={isCashCustomer ? "Sangira Status" : "Payment Status"}
              icon={MdReceipt}
            >
              <div className="space-y-2">
                {isCashCustomer &&
                  hasSangira &&
                  sangiraStatus === "completed" && (
                    <Chip
                      label="Payment Completed"
                      size="small"
                      style={{
                        backgroundColor: C.successBg,
                        color: C.success,
                        fontWeight: "bold",
                      }}
                    />
                  )}
                {isCashCustomer &&
                  hasSangira &&
                  sangiraStatus === "pending" && (
                    <div className="text-amber-600 text-sm">
                      Awaiting cash payment
                    </div>
                  )}
                {isCashCustomer && !hasSangira && (
                  <div className="text-amber-600 text-sm">
                    Sangira not generated yet
                  </div>
                )}
                {isCreditCustomer && (
                  <div className="space-y-2">
                    <Chip
                      label="Paid"
                      size="small"
                      style={{
                        backgroundColor: C.successBg,
                        color: C.success,
                        fontWeight: "bold",
                      }}
                    />
                    <div className="text-xs text-slate-500">
                      Order added to customer billing
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Credit Customer - Show Order Reference instead of Sangira */}
            {isCreditCustomer && (
              <InfoCard title="Order Reference" icon={MdAccountBalance}>
                <div className="font-bold text-base text-slate-800">
                  #{order?.Request_Batch_ID || "N/A"}
                </div>
                <div className="text-xs text-slate-500 mt-1">Credit Order</div>
              </InfoCard>
            )}
          </div>
        )}

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
                  <StyledTableCell>#</StyledTableCell>
                  <StyledTableCell>Item</StyledTableCell>
                  <StyledTableCell>Unit Price</StyledTableCell>
                  <StyledTableCell align="center">Ordered Qty</StyledTableCell>
                  {isFulfilledOrRequested && (
                    <StyledTableCell align="center">
                      Fulfilled Qty
                    </StyledTableCell>
                  )}
                  <StyledTableCell>Ordered Total</StyledTableCell>
                  {isFulfilledOrRequested && (
                    <StyledTableCell>Fulfilled Total</StyledTableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {order.request?.map((r, idx) => {
                  const lineTotal = r.Price * r.Quantity;
                  const fulfilledQty = getFulfilledQuantity(r);
                  const fulfilledTotal = r.Price * fulfilledQty;
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
                      <StyledTableCell
                        align="center"
                        className="text-slate-700"
                      >
                        {formatter.format(r.Quantity)}
                      </StyledTableCell>
                      {isFulfilledOrRequested && (
                        <StyledTableCell
                          align="center"
                          className="text-green-600 font-semibold"
                        >
                          {formatter.format(fulfilledQty)}
                        </StyledTableCell>
                      )}
                      <StyledTableCell
                        className="font-bold"
                        style={{ color: C.primary }}
                      >
                        {currencyFormatter.format(lineTotal)}
                      </StyledTableCell>
                      {isFulfilledOrRequested && (
                        <StyledTableCell className="font-bold text-green-600">
                          {currencyFormatter.format(fulfilledTotal)}
                        </StyledTableCell>
                      )}
                    </TableRow>
                  );
                })}

                {/* Totals row */}
                <TableRow style={{ backgroundColor: C.primaryBg }}>
                  <StyledTableCell
                    colSpan={isFulfilledOrRequested ? 3 : 3}
                    className="text-right font-bold text-slate-600"
                  >
                    Order Total
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    className="font-bold text-slate-700"
                  >
                    {formatter.format(
                      order.request?.reduce((sum, r) => sum + r.Quantity, 0) ||
                        0,
                    )}
                  </StyledTableCell>
                  {isFulfilledOrRequested && (
                    <StyledTableCell
                      align="center"
                      className="font-bold text-green-600"
                    >
                      {formatter.format(
                        order.request?.reduce(
                          (sum, r) => sum + getFulfilledQuantity(r),
                          0,
                        ) || 0,
                      )}
                    </StyledTableCell>
                  )}
                  <StyledTableCell
                    className="font-extrabold text-base"
                    style={{ color: C.success }}
                  >
                    {currencyFormatter.format(totalAmount)}
                  </StyledTableCell>
                  {isFulfilledOrRequested && (
                    <StyledTableCell className="font-extrabold text-base text-green-600">
                      {currencyFormatter.format(totalFulfilledAmount)}
                    </StyledTableCell>
                  )}
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

            {/* Dispatch */}
            {canDispatch && (
              <button
                onClick={() => setDispatchOpen(true)}
                disabled={actionLoading}
                className="text-white border-none rounded-lg px-6 py-2.5 font-bold text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: C.dispatch }}
              >
                <MdFlightTakeoff size={18} />
                Dispatch Order
              </button>
            )}

            {originalStatus === "dispatched" && (
              <div className="flex items-center gap-2 text-purple-600 font-semibold bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                <MdCheckCircle size={20} />
                Journey Complete
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

      {/* ── Dispatch dialog ── */}
      <DispatchDialog
        open={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
        order={order}
        onSubmit={handleDispatch}
        loading={actionLoading}
      />
    </>
  );
}
