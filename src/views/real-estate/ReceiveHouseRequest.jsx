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
import { GrDocumentUpdate } from "react-icons/gr";
import { IoArrowUndoCircleOutline } from "react-icons/io5";
import {
  capitalize,
  currencyFormatter,
  formatter,
  removeUnderscore,
  reportError,
} from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient, { baseURL } from "../../api/Client";
import { CgFileRemove } from "react-icons/cg";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import { FcMoneyTransfer } from "react-icons/fc";

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

export default function ReceiveHouseRequest() {
  const { requestID } = useParams();

  const [requestData, setRequestData] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [exchangeRate, setExchangeRate] = useState("");
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

      // Make API request to upload contract
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
        toast.error("Failed to update contract");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error("Failed to update contract");
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
    if (paymentMethod === "cash" && numberOfMonths && requestData?.Price) {
      return numberOfMonths * requestData.Price;
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

      // Make API request to upload contract
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
        reportError(response, "Failed to receive house request");
        return;
      }

      setLoading(false);
      toast.success("House request is received successfully");
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

    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    if (paymentMethod === "cash" && (!numberOfMonths || numberOfMonths < 1)) {
      toast.error("Please enter a valid number of months");
      return;
    }

    // Validate exchange rate for foreign customers
    const isForeigner = requestData?.customer?.Customer_Type === "foreigner";
    if (isForeigner && !exchangeRate) {
      toast.error("Please enter exchange rate for foreign customer");
      return;
    }

    if (isForeigner && exchangeRate < 1) {
      toast.error("Please enter valid exchange rate for foreign customer");
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
        Payment_Mode: paymentMethod,
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Quantity: numberOfMonths || 1,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      if (paymentMethod === "cash") {
        data.months = numberOfMonths;
        data.Grand_Total_Price = calculateGrandTotal();
      }

      // Add exchange rate for foreign customers
      if (isForeigner) {
        // data.Exchange_Rate = exchangeRate;
        data.Grand_Total_Price = calculateGrandTotal() * parseFloat(exchangeRate);
      }

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to accept house request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to accept house request";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("House request is accepted successfully");
      loadData();
      setPaymentMethod("");
      setNumberOfMonths(1);
      setExchangeRate("");
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
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to decline house request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to decline house request";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("House request is declined successfully");
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
        `/customer/customer-request?&&Request_ID=${requestID}Request_Type=house_rent`,
      );

      if (!response.ok) {
        setLoading(false);
        toast.error("Failed to fetch request data");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error("Failed to fetch request data");
        return;
      }

      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      console.log(newData);
      setRequestData(Array.isArray(newData) ? newData[0] : "");

      // Load uploaded contract if exists
      if (newData[0]?.contract) {
        setUploadedContract(newData[0].contract);
      }

      // Load payment details if exists
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

  const renderDetailsTab = () => (
    <div>
      {/* Customer Information */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <LuCircleUserRound className="mr-2 text-blue-600" size={24} />
          Customer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-semibold text-gray-900">
              {requestData?.customer?.Customer_Name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer ID</p>
            <p className="font-semibold text-gray-900">
              {requestData?.customer?.Student_ID}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="font-semibold text-gray-900">
              {requestData?.customer?.Phone_Number}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">
              {requestData?.customer?.Email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-semibold text-gray-900 capitalize">
              {requestData?.customer?.Gender}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nationality</p>
            <p className="font-semibold text-gray-900">
              {requestData?.customer?.Nationality}
            </p>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BsHouse className="mr-2 text-blue-600" size={24} />
          Property Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Property Name</p>
            <p className="font-semibold text-gray-900">
              {requestData?.estate?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-semibold text-gray-900 capitalize">
              {requestData?.estate?.real_estate_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-semibold text-gray-900">
              {requestData?.estate?.location?.Unit_Location ||
                requestData?.estate?.description}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="font-semibold text-green-600 text-lg">
              {currencyFormatter.format(requestData?.Price)}{" "}
              <span className="text-black">/ Month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <LuFileText className="mr-2 text-blue-600" size={24} />
          Request Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Request Date</p>
            <p className="font-semibold text-gray-900">
              {formatDate(requestData?.Request_Date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Request Type</p>
            <p className="font-semibold text-gray-900 capitalize">
              {requestData?.Request_Type?.replace("_", " ")}
            </p>
          </div>
          {requestData.Received_Time && (
            <>
              <div>
                <p className="text-sm text-gray-600">Received Time</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(requestData?.Received_Time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Received By</p>
                <p className="font-semibold text-gray-900">
                  {capitalize(requestData?.received_by?.name || "N/A")}
                </p>
              </div>
            </>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 whitespace-pre-line">
              {requestData?.Description}
            </p>
          </div>
        </div>
        {requestData?.Remarks && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Remarks</p>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-gray-800">{requestData?.Remarks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-6 bg-gray-50">
        {(requestData?.Customer_Status === "pending" ||
          requestData?.Customer_Status === "active") && (
          <button
            onClick={receiveRequest}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <LuClock className="mr-2" size={20} />
            Receive Request
          </button>
        )}

        {requestData?.Customer_Status === "received" && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeclineModal(true)}
              className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              <LuCircleX className="mr-2" size={20} />
              Reject Request
            </button>
            <button
              onClick={() => setShowAcceptModal(true)}
              className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
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
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
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
                className:
                  "bg-white border border-slate-200 rounded-2xl shadow-xl",
              }}
            >
              <DialogTitle className="font-bold border-b border-slate-200 flex justify-between items-center text-slate-800">
                <span>REVOKE HOUSE ALLOCATION</span>
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  size="small"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <MdClose />
                </IconButton>
              </DialogTitle>
              <DialogContent className="pt-6">
                <p className="text-slate-500 text-sm">
                  Are you sure you want to revoke this house request allocation?
                </p>
              </DialogContent>
              <DialogActions className="p-4 border-t border-slate-200 gap-2">
                <Button
                  onClick={handleClose}
                  className="text-slate-500 normal-case hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={(e) => revokeAllocation(e)}
                  className="text-white normal-case font-semibold rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
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
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <LuFileText className="mr-2 text-blue-600" size={24} />
          Contract Management
        </h2>
      </div>

      {requestData?.Contract_attachment &&
      requestData?.previos_contract?.length > 0 &&
      !isUpdating ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <LuCircleCheckBig className="text-green-600 mr-3" size={32} />
              <div>
                <p className="font-semibold text-gray-900">Contract Uploaded</p>
                <p className="text-sm text-gray-600">
                  Uploaded on: {requestData?.Contract_Attached_Time}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadContract}
                className="flex items-center cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                <LuDownload className="mr-2" size={18} />
                Download Contract
              </button>
              <button
                onClick={handleUpdateContract}
                className="flex items-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
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
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200 hover:border-gray-400"
          >
            <LuUpload className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isUpdating ? "Upload New Contract" : "Upload Signed Contract"}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
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
              className="inline-block cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg transition duration-200 mb-4"
            >
              Browse Files
            </label>
            {contractFile && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
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
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FcMoneyTransfer className="mr-2 text-blue-600" size={24} />
        Payment Details
      </h2>

      {requestData?.sangira && (
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sangira Number
              </label>
              <p className="text-black font-semibold">
                {requestData?.sangira?.Sangira_Number}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <p className="text-black font-semibold">
                {currencyFormatter?.format(
                  requestData?.sangira?.Grand_Total_Price || 0,
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sangira Status
              </label>
              <p className="text-black font-semibold">
                {capitalize(requestData?.sangira?.Sangira_Status)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number
              </label>
              <p className="text-black font-semibold">
                {requestData?.sangira?.Receipt_Number}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <p className="text-black font-semibold">
                {requestData?.sangira?.Payment_Date}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <p className="text-black font-semibold">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              <p className="text-black font-semibold">
                {capitalize(
                  removeUnderscore(requestData?.payment?.Payment_Channel),
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <p className="text-black font-semibold">
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
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <CgFileRemove className="mr-2 text-red-600" size={24} />
        Rejection Details
      </h2>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rejection Reason
          </label>
          <p className="text-black font-semibold">
            {requestData?.Rejection_Reason}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejected Date
            </label>
            <p className="text-black font-semibold">
              {requestData?.Rejected_Time}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejected By
            </label>
            <p className="text-black font-semibold">
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
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to revoke house allocation");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to revoke house allocation";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("House allocation is revoked successfully");
      loadData();
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen p-6" style={{ backgroundColor: C.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-8 py-6" style={{ backgroundColor: C.primaryBg }}>
              <div className="flex justify-between items-start">
                <div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: C.text }}
                  >
                    House Request Details
                  </h1>
                  <p className="text-slate-500">
                    Request ID: #{requestData?.Request_ID}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    requestData?.Customer_Status === "pending" ||
                    requestData?.Customer_Status === "active"
                      ? "bg-yellow-100 text-yellow-800"
                      : requestData?.Customer_Status === "received" ||
                          requestData?.Customer_Status === "expired"
                        ? "bg-blue-100 text-blue-800"
                        : requestData?.Customer_Status === "assign" ||
                            requestData?.Customer_Status === "requested"
                          ? "bg-blue-100 text-blue-600"
                          : requestData?.Customer_Status === "served" ||
                              requestData?.Customer_Status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                  }`}
                >
                  {requestData?.Customer_Status === "pending" ||
                  requestData?.Customer_Status === "active"
                    ? "PENDING"
                    : requestData?.Customer_Status === "received"
                      ? "RECEIVED"
                      : requestData?.Customer_Status === "rejected"
                        ? "REJECTED"
                        : requestData?.Customer_Status === "served" ||
                            requestData?.Customer_Status === "paid" ||
                            requestData?.Customer_Status === "assign" ||
                            requestData?.Customer_Status === "requested"
                          ? "ALLOCATED"
                          : requestData?.Customer_Status === "expired"
                            ? "REVOKED"
                            : "LOADING"}
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

        {/* Decline Modal - Using MUI Dialog with matching theme */}
        <Dialog
          open={showDeclineModal}
          onClose={() => {
            setShowDeclineModal(false);
            setDeclineReason("");
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: "bg-white border border-slate-200 rounded-2xl shadow-xl",
          }}
        >
          <DialogTitle className="font-bold border-b border-slate-200 flex justify-between items-center text-slate-800">
            <div className="flex items-center gap-2">
              <LuCircleX style={{ color: C.danger }} size={20} />
              <span>Reject Request</span>
            </div>
            <IconButton
              onClick={() => {
                setShowDeclineModal(false);
                setDeclineReason("");
              }}
              size="small"
              className="text-slate-400 hover:text-slate-600"
            >
              <MdClose />
            </IconButton>
          </DialogTitle>

          <DialogContent className="pt-6">
            <p className="text-slate-500 text-sm mb-5">
              Please provide a reason for rejecting this request:
            </p>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for rejecting..."
              className="bg-white"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: C.border,
                  },
                  "&:hover fieldset": {
                    borderColor: C.danger,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: C.danger,
                  },
                },
              }}
            />
          </DialogContent>

          <DialogActions className="p-4 border-t border-slate-200 gap-2">
            <Button
              onClick={() => {
                setShowDeclineModal(false);
                setDeclineReason("");
              }}
              className="text-slate-500 normal-case hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={declineHouseRequest}
              disabled={!declineReason.trim()}
              variant="contained"
              className="text-white normal-case font-semibold rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
              style={{ backgroundColor: C.danger }}
            >
              Confirm Reject
            </Button>
          </DialogActions>
        </Dialog>

        {/* Accept Modal - Using MUI Dialog with matching theme */}
        <Dialog
          open={showAcceptModal}
          onClose={() => {
            setShowAcceptModal(false);
            setPaymentMethod("");
            setNumberOfMonths(1);
            setExchangeRate("");
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: "bg-white border border-slate-200 rounded-2xl shadow-xl",
          }}
        >
          <DialogTitle className="font-bold border-b border-slate-200 flex justify-between items-center text-slate-800">
            <div className="flex items-center gap-2">
              <LuCircleCheckBig style={{ color: C.success }} size={20} />
              <span>Accept Request</span>
            </div>
            <IconButton
              onClick={() => {
                setShowAcceptModal(false);
                setPaymentMethod("");
                setNumberOfMonths(1);
                setExchangeRate("");
              }}
              size="small"
              className="text-slate-400 hover:text-slate-600"
            >
              <MdClose />
            </IconButton>
          </DialogTitle>

          <DialogContent className="pt-6">
            <p className="text-slate-500 text-sm mb-5">
              Please select a payment method:
            </p>
            <div className="space-y-3 mb-4">
              <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition bg-white">
                <input
                  type="radio"
                  name="payment"
                  value="free"
                  checked={paymentMethod === "free"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4 w-5 h-5 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-semibold text-slate-800">Free</p>
                  <p className="text-sm text-slate-500">No payment required</p>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition bg-white">
                <input
                  type="radio"
                  name="payment"
                  value="salary_deduction"
                  checked={paymentMethod === "salary_deduction"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4 w-5 h-5 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-semibold text-slate-800">
                    Salary Deduction
                  </p>
                  <p className="text-sm text-slate-500">
                    Deduct from monthly salary
                  </p>
                </div>
              </label>
              <label className="block p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition bg-white">
                <div className="flex items-center mb-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Cash Payment</p>
                    <p className="text-sm text-slate-500">Pay in cash</p>
                  </div>
                </div>

                {paymentMethod === "cash" && (
                  <div className="ml-9 space-y-4 mt-4  border-t border-slate-200">
                    <div className="my-1">
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Number of Months"
                        value={numberOfMonths}
                        onChange={(e) =>
                          setNumberOfMonths(parseInt(e.target.value) || 1)
                        }
                        InputProps={{
                          inputProps: { min: 1 },
                        }}
                      />
                    </div>
                    <div className="my-3">
                      <TextField
                        fullWidth
                        size="small"
                        label="Grand Total Amount"
                        value={
                          requestData?.customer?.Customer_Type === "local" ||
                          requestData?.customer?.Customer_Type === null
                            ? currencyFormatter.format(calculateGrandTotal())
                            : `USD ${formatter.format(calculateGrandTotal())}`
                        }
                        disabled
                      />
                    </div>
                    {/* Exchange Rate Field for Foreign Customers */}
                    {requestData?.customer?.Customer_Type === "foreigner" && (
                      <div className="my-2">
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Exchange Rate (to local currency)"
                          value={exchangeRate}
                          onChange={(e) => setExchangeRate(e.target.value)}
                          InputProps={{
                            inputProps: { step: "0.01", min: "0" },
                          }}
                        />
                        {exchangeRate && (
                          <div
                            className="mt-3 p-4 rounded-xl border"
                            style={{
                              backgroundColor: C.infoBg,
                              borderColor: C.info,
                            }}
                          >
                            <p
                              className="text-sm font-medium"
                              style={{ color: C.info }}
                            >
                              Local currency amount:{" "}
                              {currencyFormatter.format(
                                calculateGrandTotal() *
                                  parseFloat(exchangeRate || 0),
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </label>
            </div>
          </DialogContent>

          <DialogActions className="p-4 border-t border-slate-200 gap-2">
            <Button
              onClick={() => {
                setShowAcceptModal(false);
                setPaymentMethod("");
                setNumberOfMonths(1);
                setExchangeRate("");
              }}
              className="text-slate-500 normal-case hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={acceptHouseRequest}
              disabled={!paymentMethod}
              variant="contained"
              className="text-white normal-case font-semibold rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
              style={{ backgroundColor: C.success }}
            >
              Confirm Accept
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}
