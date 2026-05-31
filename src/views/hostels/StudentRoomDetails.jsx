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
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  Autocomplete,
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
  MdCheckCircle,
  MdDownload,
  MdVisibility,
  MdClose,
  MdCalendarToday,
  MdAttachMoney,
  MdDescription,
  MdCreditCard,
  MdReceiptLong,
  MdWarning,
  MdCancel,
  MdSchool,
  MdBusiness,
  MdHome,
  MdEvent,
  MdPeople,
  MdLocalHospital,
} from "react-icons/md";
import { capitalize, currencyFormatter, formatDate } from "../../../helpers";
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

/* ─── Revoke Room Dialog ───────────────────────────────────────────────── */
function RevokeRoomDialog({
  open,
  onClose,
  onConfirm,
  loading,
  roomName,
  studentName,
  reasons,
}) {
  const [revokeReason, setRevokeReason] = React.useState("");

  const reasonOnChange = (e, value) => {
    setRevokeReason(value);
  };

  const sortedReasons = reasons?.map((reason) => ({
    id: reason?.Reason_ID,
    label: reason?.Reason_Description,
  }));

  const handleConfirm = () => {
    if (!revokeReason) {
      toast.error("Please provide a reason for revoking the room allocation");
      return;
    }
    onConfirm(revokeReason);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "bg-white border border-slate-200 rounded-2xl shadow-xl",
      }}
    >
      <DialogTitle className="font-bold border-b border-slate-200 flex justify-between items-center text-slate-800">
        <div className="flex items-center gap-2">
          <MdCancel style={{ color: C.danger }} size={24} />
          <span>Revoke Room Allocation</span>
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
        <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
          <div className="flex items-start gap-3">
            <MdWarning className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-red-800 mb-1">Warning!</h3>
              <p className="text-sm text-red-700">
                You are about to revoke the room allocation for{" "}
                <span className="font-semibold">
                  {studentName || "the student"}
                </span>
                . This action will immediately remove their access to{" "}
                <span className="font-semibold">{roomName || "the room"}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Autocomplete
            id="combo-box-demo"
            options={sortedReasons}
            size="small"
            fullWidth
            freeSolo
            required
            className="bg-white"
            value={revokeReason}
            onChange={reasonOnChange}
            renderInput={(params) => (
              <TextField {...params} label="Select Reason for Revocation *" />
            )}
          />
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">
              What happens after revocation:
            </p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Student will lose access to the room immediately</li>
              <li>Room will be marked as available for new allocation</li>
              <li>Student will be notified via email/SMS (if configured)</li>
            </ul>
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
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          className="normal-case font-semibold text-white"
        //   style={{ backgroundColor: C.danger }}
          startIcon={loading ? null : <MdCancel />}
        >
          {loading ? "Revoking..." : "Yes, Revoke Room"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main Student Room Details Page ──────────────────────────────────── */
export default function StudentRoomDetails() {
  const { requestID } = useParams();
  const navigate = useNavigate();

  const [revokeReasons, setReasons] = React.useState([]);
  const [roomRequest, setRoomRequest] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false);

  // Get employee info from localStorage
  const employeeId = localStorage.getItem("employeeId");
  const customer = roomRequest?.customer;
  const room = roomRequest?.room;
  const sangira = roomRequest?.sangira;

  React.useEffect(() => {
    loadRoomRequestData();
    loadReasons();
  }, [requestID]);

  const loadRoomRequestData = async () => {
    setLoading(true);
    try {
      // API call to fetch room request by ID

      let url = `/customer/customer-request?&Customer_Status=served&Room_Status=paid&Request_Type=hostel&Request_ID=${requestID}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        // setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch student room details",
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        // setLoading(false);
        toast.error(
          response.data.error || "Failed to fetch student room details",
        );
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data[0];

      setRoomRequest(userData);
    } catch (e) {
      console.error("Failed to load room request data:", e);
      toast.error("Failed to load room data");
    } finally {
      setLoading(false);
    }
  };

  const loadReasons = async () => {
    try {
      const response = await apiClient.get(
        "/settings/reason?&Project_Type=hostel&limit=50",
      );

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const reasonsData = response?.data?.data?.data;
      const newData = reasonsData?.map((reason, index) => ({
        ...reason,
        key: index + 1,
      }));
      setReasons(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch reasons error:", error);
    }
  };

  const handleRevokeRoom = async (reason) => {
    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!reason) {
      toast.error("Please select reason for revocation");
      return;
    }

    if (!room) {
      toast.error("Please srefresh to get student room");
      return;
    }

    setActionLoading(true);
    try {
      // API call to revoke room allocation

      const data = {
        Reason_ID: reason?.id,
        Request_ID: requestID,
        Room_ID: room?.Room_ID,
        Customer_ID: customer?.Customer_ID,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post(
        "/customer/remove-student-from-room",
        data,
      );

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage =
            response?.data?.error || response?.data?.message;

          let errorText;

          console.log(response);
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to revoke room allocation";
          }

          toast.error(errorText);
        }
        return;
      }

      toast.success("Room allocation revoked successfully");
      setRevokeDialogOpen(false);
      navigate(-1);
    } catch (e) {
      console.error("Revoke room error:", e);
      toast.error("Failed to revoke room allocation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calculate totals
  const totalAmount = roomRequest?.Price * roomRequest?.Quantity || 0;
  const paidAmount = roomRequest?.Sangira?.Grand_Total_Price || 0;
  const outstandingBalance = totalAmount - paidAmount;

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: C.bg }}>
        <LinearProgress
          className="rounded"
          style={{ backgroundColor: C.primaryBg }}
        />
        <div className="flex items-center gap-2 mt-4">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
          <p className="text-slate-500">Loading room details…</p>
        </div>
      </div>
    );
  }

  if (!roomRequest) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: C.bg }}
      >
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-slate-500 text-lg font-medium">
            Room request not found
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
                Room Accommodation Details
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Request ID: #{roomRequest.Request_ID} |{" "}
                {room?.Room_Name || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Button
              variant="contained"
              className="normal-case font-semibold"
              style={{ backgroundColor: C.primary }}
              startIcon={<MdDownload />}
              onClick={() => {
                toast.success("Receipt download feature coming soon");
              }}
            >
              Download Receipt
            </Button> */}
            <Button
              variant="contained"
              className="normal-case font-semibold"
              style={{ backgroundColor: C.danger }}
              startIcon={<MdCancel />}
              onClick={() => setRevokeDialogOpen(true)}
            >
              Revoke Room Allocation
            </Button>
          </div>
        </div>

        {/* Student Information Cards - Matching heights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Student Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  sx={{
                    bgcolor: C.primary,
                    width: 64,
                    height: 64,
                  }}
                >
                  <MdPerson size={32} />
                </Avatar>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                    Student Information
                  </p>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">
                    {customer?.Customer_Name || "N/A"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Active Student
                    </span>
                  </div>
                </div>
              </div>
              <Divider className="mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Student ID</p>
                    <p className="text-sm font-medium text-slate-700">
                      {customer?.Student_ID || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Program</p>
                    <p className="text-sm font-medium text-slate-700">
                      {customer?.Program_Study || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Year of Study</p>
                    <p className="text-sm font-medium text-slate-700">
                      Year {customer?.Year_Study || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {customer?.Email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-700">
                      {customer?.Phone_Number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Nationality</p>
                    <p className="text-sm font-medium text-slate-700">
                      {customer?.Nationality || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Card - Same height as student card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  sx={{
                    bgcolor: C.warningBg,
                    width: 64,
                    height: 64,
                  }}
                >
                  <MdPeople size={32} style={{ color: C.warning }} />
                </Avatar>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                    Emergency Contact
                  </p>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">
                    {customer?.Emergency_Contact_Name || "N/A"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <MdPeople size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {customer?.Next_Kin_Relationship || "Emergency Contact"}
                    </span>
                  </div>
                </div>
              </div>
              <Divider className="mb-4" />
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">
                    Emergency Phone Number
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {customer?.Emergency_Contact_Phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Relationship</p>
                  <p className="text-sm font-medium text-slate-700">
                    {customer?.Next_Kin_Relationship || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment Method</p>
                  <p className="text-sm font-medium text-slate-700">
                    {capitalize(customer?.Payment_Method || "N/A")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room & Financial Details Section - No card styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MdHome className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                  Room Assignment Details
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Hostel</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {room?.hostel?.Hostel_Name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Block</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {room?.block?.Block_Name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Floor</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {room?.flow?.Flow_Name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Room Name</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {room?.Room_Name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Room Type</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {capitalize(room?.Room_Type || "N/A")}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Number of Beds</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {room?.No_Bed || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MdAttachMoney className="text-slate-400" size={20} />
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                  Payment & Billing
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                  <p className="font-bold text-slate-800 text-lg">
                    {currencyFormatter.format(totalAmount)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {roomRequest.Quantity} months @{" "}
                    {currencyFormatter.format(roomRequest.Price)}/month
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Amount Paid</p>
                  <p className="font-bold text-green-600 text-lg">
                    {currencyFormatter.format(paidAmount)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                  <p className="text-xs text-slate-400 mb-1">
                    Outstanding Balance
                  </p>
                  <p
                    className={`font-bold text-xl ${outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {currencyFormatter.format(outstandingBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sangira Information - No card styling */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MdReceiptLong className="text-slate-400" size={20} />
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                Transaction Reference (Sangira)
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Sangira Number</p>
                <p className="font-semibold text-slate-800 font-mono text-sm break-all">
                  {sangira?.Sangira_Number || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Receipt Number</p>
                <p className="font-semibold text-slate-800">
                  {sangira?.Receipt_Number || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Payment Date</p>
                <p className="font-semibold text-slate-800">
                  {sangira?.Payment_Date
                    ? formatDate(sangira.Payment_Date)
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Expiry Date</p>
                <p className="font-semibold text-slate-800">
                  {sangira?.Expire_Date
                    ? formatDate(sangira.Expire_Date)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="border-b border-slate-200 px-4"
            TabIndicatorProps={{ style: { backgroundColor: C.primary } }}
          >
            <Tab
              label="Payment Details"
              icon={<MdPayment size={18} />}
              iconPosition="start"
              className="normal-case font-semibold text-sm"
            />
            <Tab
              label="Contract Information"
              icon={<MdDescription size={18} />}
              iconPosition="start"
              className="normal-case font-semibold text-sm"
            />
          </Tabs>

          {/* Payment Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="p-4">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Unit Price (TZS)</StyledTableCell>
                      <StyledTableCell>Total Amount (TZS)</StyledTableCell>
                      <StyledTableCell>Billing Type</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow className="hover:bg-slate-50">
                      <StyledTableCell className="font-semibold">
                        {roomRequest.item?.Item_Name || "Accommodation Fee"}
                      </StyledTableCell>
                      <StyledTableCell>
                        {roomRequest.Quantity}{" "}
                        {roomRequest.Quantity > 1 ? "months" : "month"}
                      </StyledTableCell>
                      <StyledTableCell>
                        {currencyFormatter.format(roomRequest.Price)}
                      </StyledTableCell>
                      <StyledTableCell className="font-bold">
                        {currencyFormatter.format(totalAmount)}
                      </StyledTableCell>
                      <StyledTableCell>
                        {capitalize(roomRequest.Billing_Type || "cash")}
                      </StyledTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </TabPanel>

          {/* Contract Information Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <MdDescription className="text-slate-400" size={18} />
                      <span>Contract Details</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Request Date:
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatDate(roomRequest.Request_Date)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Room Expiry Date:
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {roomRequest.Room_Expire_Date
                            ? formatDate(roomRequest.Room_Expire_Date)
                            : "N/A"}
                        </span>
                      </div>
                      {/* <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">Served Date:</span>
                        <span className="text-sm font-semibold text-slate-700">{roomRequest.Served_Date ? formatDate(roomRequest.Served_Date) : "N/A"}</span>
                      </div> */}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-500">
                          Payment Date:
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {roomRequest.Payment_Date
                            ? formatDate(roomRequest.Payment_Date)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <MdEvent className="text-slate-400" size={18} />
                      <span>Important Dates</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Contract Start:
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatDate(roomRequest.Request_Date)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Contract End:
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {roomRequest.Room_Expire_Date
                            ? formatDate(roomRequest.Room_Expire_Date)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-500">
                          Duration:
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {roomRequest.Quantity} Months
                        </span>
                      </div>
                    </div>
                  </div>

                  {roomRequest.Remarks && (
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                      <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <MdWarning className="text-amber-600" size={18} />
                        <span>Remarks</span>
                      </h3>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        {roomRequest.Remarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>

      {/* Revoke Room Dialog */}
      <RevokeRoomDialog
        open={revokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        onConfirm={handleRevokeRoom}
        loading={actionLoading}
        roomName={room?.Room_Name}
        studentName={customer?.Customer_Name}
        reasons={revokeReasons}
      />
    </>
  );
}
