import React, { useState, useRef, useEffect } from "react";
import { BsHouse } from "react-icons/bs";
import {
  LuCircleCheckBig,
  LuCircleUserRound,
  LuCircleX,
  LuClock,
  LuFileText,
  LuUpload,
  LuDownload,
  LuReceipt,
} from "react-icons/lu";
import { CgFileRemove } from "react-icons/cg";
import { GrDocumentUpdate } from "react-icons/gr";
import {
  capitalize,
  currencyFormatter,
  removeUnderscore,
  reportError,
} from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient, { baseURL } from "../../api/Client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { IconButton } from "@mui/material";
import { MdClose } from "react-icons/md";
import { IoArrowUndoCircleOutline } from "react-icons/io5";
import { FcMoneyTransfer } from "react-icons/fc";

// Design tokens
const colors = {
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
  bg: "#f1f5f9",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  muted: "#64748b",
  text: "#1e293b",
  textDim: "#94a3b8",
};

export default function ReceiveSpaceRequest() {
  const { requestID } = useParams();

  const [requestData, setRequestData] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [numberOfYears, setNumberOfYears] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [open, setOpen] = useState(false);
  const handleConfirmOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Contract management states
  const [contractFile, setContractFile] = useState(null);
  const [uploadedContract, setUploadedContract] = useState(null);

  // Payment details states
  const [paymentDetails, setPaymentDetails] = useState({
    sangilaNumber: "",
    receiptNumber: "",
    paymentDate: "",
    amount: "",
    remarks: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateContract = () => {
    setIsUpdating(true);
    setContractFile(null);
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setContractFile(null);
  };

  const handleContractUpdate = async (e) => {
    e.preventDefault();

    if (!contractFile) {
      toast.error("Please select a contract file to upload");
      return;
    }

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("contract", contractFile);
      formData.append("Contract_attachment", contractFile);
      formData.append("Request_ID", requestID);
      formData.append("Employee_ID", employeeId);

      const response = await apiClient.post(
        "/estate/attach-contract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to update contract");
        return;
      }

      setLoading(false);
      toast.success("Contract updated successfully");
      setUploadedContract(response?.data?.data);
      setContractFile(null);
      setIsUpdating(false);
      loadData();
    } catch (error) {
      console.error("Upload contract error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const showTabs =
    requestData?.Customer_Status === "served" ||
    requestData?.Customer_Status === "paid" ||
    requestData?.Customer_Status === "requested" ||
    requestData?.Customer_Status === "rejected";

  // Calculate grand total
  const calculateGrandTotal = () => {
    if (paymentMethod === "monthly" && numberOfMonths && requestData?.Price) {
      return numberOfMonths * requestData?.Price;
    }

    if (paymentMethod === "yearly" && numberOfYears && requestData?.Price) {
      const convertedMonths = numberOfYears * 12;
      return convertedMonths * requestData?.Price;
    }
    return 0;
  };

  const handleContractUpload = async (e) => {
    e.preventDefault();

    if (!contractFile) {
      toast.error("Please select a contract file to upload");
      return;
    }

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("contract", contractFile);
      formData.append("Contract_attachment", contractFile);
      formData.append("Request_ID", requestID);
      formData.append("Employee_ID", employeeId);

      const response = await apiClient.post(
        "/estate/attach-contract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to upload contract");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to upload contract");
        return;
      }

      setLoading(false);
      toast.success("Contract uploaded successfully");
      setUploadedContract(response?.data?.data);
      setContractFile(null);
      loadData();
    } catch (error) {
      console.error("Upload contract error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const handleDownloadContract = () => {
    if (requestData?.Contract_attachment) {
      const path = `${baseURL}/${requestData?.Contract_attachment}`;
      window.open(path, "_blank");
    }
  };

  const receiveRequest = async (e) => {
    e.preventDefault();

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!requestData) {
      toast.error(
        "Request information not found. Please refresh and try again.",
      );
      return;
    }

    setLoading(true);

    try {
      const data = {
        Customer_Status: "received",
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Quantity: 1,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to receive rental space request");
        return;
      }

      setLoading(false);
      toast.success("Rental space request is received successfully");
      loadData();
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const acceptHouseRequest = async (e) => {
    e.preventDefault();

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (
      paymentMethod === "monthly" &&
      (!numberOfMonths || numberOfMonths < 1)
    ) {
      toast.error("Please enter a valid number of months");
      return;
    }

    if (paymentMethod === "yearly" && (!numberOfYears || numberOfYears < 1)) {
      toast.error("Please enter a valid number of years");
      return;
    }

    if (!requestData) {
      toast.error(
        "Request information not found. Please refresh and try again.",
      );
      return;
    }

    setLoading(true);

    try {
      const data = {
        Customer_Status: "assign",
        Payment_Mode: "cash",
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      if (paymentMethod === "yearly") {
        const convertedMonths = numberOfYears * 12;
        data.months = convertedMonths;
        data.Quantity = convertedMonths;
      } else {
        data.months = numberOfMonths;
        data.Quantity = numberOfMonths;
      }
      data.Grand_Total_Price = calculateGrandTotal();

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to accept rental space request");
        return;
      }

      setLoading(false);
      toast.success("Rental space request is accepted successfully");
      loadData();
      setPaymentMethod("");
      setNumberOfMonths(1);
      setShowAcceptModal(false);
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const declineHouseRequest = async (e) => {
    e.preventDefault();

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!declineReason) {
      toast.error("Please enter reason to decline");
      return;
    }

    if (!requestData) {
      toast.error(
        "Request information not found. Please refresh and try again.",
      );
      return;
    }

    setLoading(true);

    try {
      const data = {
        Customer_Status: "rejected",
        Rejection_Reason: declineReason,
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Quantity: 1,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to decline rental space request");
        return;
      }

      setLoading(false);
      toast.success("Rental space request is declined successfully");
      loadData();
      setDeclineReason("");
      setShowDeclineModal(false);
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/customer/customer-request?&Request_ID=${requestID}Request_Type=business_land`,
      );

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to fetch request data");
        return;
      }

      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      console.log(newData);
      setRequestData(Array.isArray(newData) ? newData[0] : "");

      if (newData[0]?.contract) {
        setUploadedContract(newData[0].contract);
      }

      if (newData[0]?.paymentDetails) {
        setPaymentDetails(newData[0]?.sangira);
      }

      setLoading(false);
    } catch (error) {
      console.error("Fetch requests error:", error);
      setLoading(false);
      toast.error("Failed to load request data");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      active: "bg-amber-100 text-amber-800 border-amber-200",
      received: "bg-indigo-100 text-indigo-800 border-indigo-200",
      expired: "bg-indigo-100 text-indigo-800 border-indigo-200",
      assign: "bg-blue-100 text-blue-800 border-blue-200",
      requested: "bg-blue-100 text-blue-800 border-blue-200",
      served: "bg-emerald-100 text-emerald-800 border-emerald-200",
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return statusColors[status] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "PENDING",
      active: "PENDING",
      received: "RECEIVED",
      rejected: "REJECTED",
      served: "ALLOCATED",
      paid: "ALLOCATED",
      assign: "ALLOCATED",
      requested: "ALLOCATED",
      expired: "REVOKED",
    };
    return labels[status] || "LOADING";
  };

  const renderDetailsTab = () => (
    <div>
      {/* Customer Information */}
      <div className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <LuCircleUserRound className="mr-2" style={{ color: colors.primary }} size={24} />
          Customer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-semibold text-slate-900">
              {requestData?.customer?.Customer_Name}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Customer ID</p>
            <p className="font-semibold text-slate-900">
              {requestData?.customer?.Customer_ID}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Phone Number</p>
            <p className="font-semibold text-slate-900">
              {requestData?.customer?.Phone_Number}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-semibold text-slate-900">
              {requestData?.customer?.Email}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Gender</p>
            <p className="font-semibold text-slate-900 capitalize">
              {requestData?.customer?.Gender}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Nationality</p>
            <p className="font-semibold text-slate-900">
              {requestData?.customer?.Nationality}
            </p>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <BsHouse className="mr-2" style={{ color: colors.primary }} size={24} />
          Property Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Property Name</p>
            <p className="font-semibold text-slate-900">
              {requestData?.estate?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Type</p>
            <p className="font-semibold text-slate-900 capitalize">
              {requestData?.estate?.real_estate_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Location</p>
            <p className="font-semibold text-slate-900">
              {requestData?.estate?.location?.Unit_Location ||
                requestData?.estate?.description}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Price</p>
            <p className="font-semibold text-emerald-600 text-lg">
              {currencyFormatter.format(requestData?.Price)}{" "}
              <span className="text-slate-900">/ Month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <LuFileText className="mr-2" style={{ color: colors.primary }} size={24} />
          Request Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-500">Request Date</p>
            <p className="font-semibold text-slate-900">
              {formatDate(requestData?.Request_Date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Request Type</p>
            <p className="font-semibold text-slate-900 capitalize">
              {requestData?.Request_Type?.replace("_", " ")}
            </p>
          </div>
          {requestData?.Received_Time && (
            <>
              <div>
                <p className="text-sm text-slate-500">Received Time</p>
                <p className="font-semibold text-slate-900">
                  {formatDate(requestData?.Received_Time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Received By</p>
                <p className="font-semibold text-slate-900">
                  {capitalize(requestData?.received_by?.name || "N/A")}
                </p>
              </div>
            </>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-2">Description</p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-slate-800 whitespace-pre-line">
              {requestData?.Description}
            </p>
          </div>
        </div>
        {requestData?.Remarks && (
          <div className="mt-4">
            <p className="text-sm text-slate-500 mb-2">Remarks</p>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-slate-800">{requestData?.Remarks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-6 bg-slate-50">
        {(requestData?.Customer_Status === "pending" ||
          requestData?.Customer_Status === "active") && (
          <button
            onClick={receiveRequest}
            className="w-full cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: colors.primary }}
          >
            <LuClock className="mr-2" size={20} />
            Receive Request
          </button>
        )}

        {requestData?.Customer_Status === "received" && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeclineModal(true)}
              className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center hover:shadow-lg"
            >
              <LuCircleX className="mr-2" size={20} />
              Reject Request
            </button>
            <button
              onClick={() => setShowAcceptModal(true)}
              className="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center hover:shadow-lg"
            >
              <LuCircleCheckBig className="mr-2" size={20} />
              Accept Request
            </button>
          </div>
        )}

        {(requestData?.Customer_Status === "served" ||
          requestData?.Customer_Status === "requested") && (
          <div>
            <button
              onClick={handleConfirmOpen}
              className="w-full cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: colors.primary }}
            >
              <IoArrowUndoCircleOutline className="mr-2" size={20} />
              Revoke House Allocation
            </button>
            <Dialog
              open={open}
              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
              PaperProps={{
                className: "bg-white border border-slate-200 rounded-2xl shadow-xl",
              }}
            >
              <DialogTitle className="font-bold text-slate-800 flex justify-between items-center">
                {"REVOKE HOUSE ALLOCATION"}
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <MdClose />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <DialogContentText className="text-slate-600">
                  Are you sure you want to revoke this space rental request
                  allocation?
                </DialogContentText>
              </DialogContent>
              <DialogActions className="p-4 gap-2">
                <Button variant="outlined" onClick={handleClose} className="text-slate-600 border-slate-300">
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={(e) => revokeAllocation(e)}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  REVOKE
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}

        {requestData?.Customer_Status === "rejected" && (
          <div className="text-center py-4">
            <LuCircleX className="mx-auto text-red-600 mb-2" size={48} />
            <p className="text-xl font-semibold text-red-600">
              Request Rejected
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContractTab = () => (
    <div className="px-8 py-6">
      <div className="flex flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center">
          <LuFileText className="mr-2" style={{ color: colors.primary }} size={24} />
          Contract Management
        </h2>
      </div>

      {requestData?.Contract_attachment &&
      requestData?.previos_contract?.length > 0 &&
      !isUpdating ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center">
              <LuCircleCheckBig
                className="text-emerald-600 mr-3 mt-1 sm:mt-0"
                size={32}
              />
              <div>
                <p className="font-semibold text-slate-900">Contract Uploaded</p>
                <p className="text-sm text-slate-600 break-all">
                  Uploaded on: {requestData?.Contract_Attached_Time}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadContract}
                className="flex items-center justify-center w-full sm:w-auto cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 hover:shadow-md"
              >
                <LuDownload className="mr-2" size={18} />
                Download Contract
              </button>

              <button
                onClick={handleUpdateContract}
                className="flex items-center justify-center w-full sm:w-auto cursor-pointer text-white font-semibold py-2 px-4 rounded-lg transition duration-200 hover:shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                <GrDocumentUpdate className="mr-2" size={18} />
                Update Contract
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={isUpdating ? handleContractUpdate : handleContractUpload}
        >
          {isUpdating && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-semibold">
                You are updating the existing contract. The previous version
                will be replaced.
              </p>
            </div>
          )}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
              const file = e.dataTransfer.files[0];
              if (
                file &&
                (file.type === "application/pdf" ||
                  file.type === "application/msword" ||
                  file.type ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
              ) {
                setContractFile(file);
              } else {
                alert(
                  "Please upload only PDF or Word documents (.pdf, .doc, .docx)",
                );
              }
            }}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center transition-colors duration-200 hover:border-slate-400"
          >
            <LuUpload className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isUpdating ? "Upload New Contract" : "Upload Signed Contract"}
            </h3>
            <p className="text-slate-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Accepted formats: PDF, DOC, DOCX
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setContractFile(file);
              }}
              className="hidden"
              id="contract-file-input"
            />
            <label
              htmlFor="contract-file-input"
              className="inline-block cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-lg transition duration-200 mb-4"
            >
              Browse Files
            </label>
            {contractFile && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  Selected file:{" "}
                  <span className="font-semibold">{contractFile.name}</span>
                </p>
              </div>
            )}
            {contractFile && (
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading
                    ? isUpdating
                      ? "Updating..."
                      : "Uploading..."
                    : isUpdating
                      ? "Update Contract"
                      : "Upload Contract"}
                </button>
                {isUpdating && (
                  <button
                    type="button"
                    onClick={handleCancelUpdate}
                    disabled={loading}
                    className="cursor-pointer bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );

  const renderPaymentTab = () => (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
        <FcMoneyTransfer className="mr-2" size={24} />
        Payment Details
      </h2>

      {requestData?.sangira && (
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Sangira Number
              </label>
              <p className="text-slate-900 font-semibold">
                {requestData?.sangira?.Sangira_Number}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Amount
              </label>
              <p className="text-slate-900 font-semibold">
                {currencyFormatter?.format(
                  requestData?.sangira?.Grand_Total_Price || 0,
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Sangira Status
              </label>
              <p className="text-slate-900 font-semibold">
                {capitalize(requestData?.sangira?.Sangira_Status)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Receipt Number
              </label>
              <p className="text-slate-900 font-semibold">
                {requestData?.sangira?.Receipt_Number}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Payment Date
              </label>
              <p className="text-slate-900 font-semibold">
                {requestData?.sangira?.Payment_Date}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Remarks
              </label>
              <p className="text-slate-900 font-semibold">
                {requestData?.sangira?.Remarks}
              </p>
            </div>
          </div>
        </form>
      )}

      {requestData?.payment && (
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Payment Method
              </label>
              <p className="text-slate-900 font-semibold">
                {capitalize(
                  removeUnderscore(requestData?.payment?.Payment_Channel),
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Amount
              </label>
              <p className="text-slate-900 font-semibold">
                {currencyFormatter?.format(
                  requestData?.payment?.Amount_Paid || 0,
                )}
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  const renderRejectionTab = () => (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
        <CgFileRemove className="mr-2 text-red-600" size={24} />
        Rejection Details
      </h2>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">
            Rejection Reason
          </label>
          <p className="text-slate-900 font-semibold">
            {requestData?.Rejection_Reason}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Rejected Date
            </label>
            <p className="text-slate-900 font-semibold">
              {requestData?.Rejected_Time}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Rejected By
            </label>
            <p className="text-slate-900 font-semibold">
              {capitalize(requestData?.rejected_by?.name)}
            </p>
          </div>
        </div>
      </form>
    </div>
  );

  const revokeAllocation = async (e) => {
    e.preventDefault();

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!requestData) {
      toast.error(
        "Request information not found. Please refresh and try again.",
      );
      return;
    }

    setLoading(true);

    try {
      const data = {
        Customer_Status: "expired",
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Quantity: 1,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to revoke rental space allocation");
        return;
      }

      setLoading(false);
      toast.success("Rental space allocation is revoked successfully");
      loadData();
      handleClose();
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen p-6" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-8 py-6" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})` }}>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Rental Space Request Details
                  </h1>
                  <p className="text-blue-100">
                    Request ID: #{requestData?.Request_ID}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(requestData?.Customer_Status)}`}
                >
                  {getStatusLabel(requestData?.Customer_Status)}
                </div>
              </div>
            </div>

            {/* Tabs */}
            {showTabs && (
              <div className="border-b border-slate-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "details"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Request Details
                  </button>
                  {["requested", "served", "assign", "paid"].includes(
                    requestData?.Customer_Status,
                  ) && (
                    <button
                      onClick={() => setActiveTab("contract")}
                      className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "contract"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Contract Management
                    </button>
                  )}
                  {["requested", "served", "assign", "paid"].includes(
                    requestData?.Customer_Status,
                  ) && (
                    <button
                      onClick={() => setActiveTab("payment")}
                      className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "payment"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Payment Details
                    </button>
                  )}
                  {requestData?.Customer_Status === "rejected" && (
                    <button
                      onClick={() => setActiveTab("rejection")}
                      className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "rejection"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Rejection Details
                    </button>
                  )}
                </nav>
              </div>
            )}

            {/* Tab Content */}
            {showTabs ? (
              <>
                {activeTab === "details" && renderDetailsTab()}
                {activeTab === "contract" && renderContractTab()}
                {activeTab === "payment" && renderPaymentTab()}
                {activeTab === "rejection" && renderRejectionTab()}
              </>
            ) : (
              renderDetailsTab()
            )}
          </div>
        </div>

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-200 shadow-xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Reject Request
              </h3>
              <p className="text-slate-600 mb-4">
                Please provide a reason for rejecting this request:
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 mb-4 min-h-32 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="Enter reason for rejecting..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason("");
                  }}
                  className="flex-1 cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={declineHouseRequest}
                  disabled={!declineReason.trim()}
                  className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accept Modal */}
        {showAcceptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-200 shadow-xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Accept Request
              </h3>
              <p className="text-slate-600 mb-4">
                Please select a payment duration:
              </p>
              <div className="space-y-2 mb-4">
                <label className="block p-2 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <div className="flex items-center mb-3">
                    <input
                      type="radio"
                      name="payment"
                      value="monthly"
                      checked={paymentMethod === "monthly"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4 text-emerald-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Monthly</p>
                      <p className="text-sm text-slate-600">
                        Pay in cash using month(s) structure
                      </p>
                    </div>
                  </div>

                  {paymentMethod === "monthly" && (
                    <div className="ml-7 space-y-2 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Number of Months
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={numberOfMonths}
                          onChange={(e) =>
                            setNumberOfMonths(parseInt(e.target.value) || 1)
                          }
                          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          placeholder="Enter number of months"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Grand Total Amount
                        </label>
                        <input
                          type="text"
                          value={currencyFormatter.format(
                            calculateGrandTotal(),
                          )}
                          disabled
                          className="w-full border border-slate-300 rounded-lg p-2 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                </label>

                <label className="block p-2 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <div className="flex items-center mb-3">
                    <input
                      type="radio"
                      name="payment"
                      value="yearly"
                      checked={paymentMethod === "yearly"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4 text-emerald-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Yearly</p>
                      <p className="text-sm text-slate-600">
                        Pay in cash using year(s) structure
                      </p>
                    </div>
                  </div>

                  {paymentMethod === "yearly" && (
                    <div className="ml-7 space-y-2 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Number of Years
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={numberOfYears}
                          onChange={(e) =>
                            setNumberOfYears(parseInt(e.target.value) || 1)
                          }
                          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          placeholder="Enter number of years"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Grand Total Amount
                        </label>
                        <input
                          type="text"
                          value={currencyFormatter.format(
                            calculateGrandTotal(),
                          )}
                          disabled
                          className="w-full border border-slate-300 rounded-lg p-2 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setPaymentMethod("");
                    setNumberOfMonths(1);
                  }}
                  className="flex-1 cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={acceptHouseRequest}
                  disabled={!paymentMethod}
                  className="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}