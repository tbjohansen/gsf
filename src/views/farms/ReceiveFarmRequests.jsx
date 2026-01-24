import React, { useState, useRef, useEffect } from "react";
import {
  LuCircleCheckBig,
  LuCircleUserRound,
  LuCircleX,
  LuClock,
  LuFileText,
  LuPlus,
  LuMinus,
} from "react-icons/lu";
import { CgFileRemove } from "react-icons/cg";
import {
  capitalize,
  currencyFormatter,
  removeUnderscore,
} from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../api/Client";
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
import { GiFarmTractor } from "react-icons/gi";

export default function ReceiveFarmRequest() {
  const { requestID } = useParams();

  const [requestData, setRequestData] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [farmSize, setFarmSize] = useState(0.25);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [open, setOpen] = useState(false);
  const handleConfirmOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
        Item_ID: requestData?.item?.Item_ID,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/farm-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to receive farm request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to receive farm request";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("Farm request is received successfully");
      loadData();
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const acceptFarmRequest = async (e) => {
    e.preventDefault();

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!farmSize) {
      toast.error("Please enter a valid farm plot size");
      return;
    }

    if (farmSize < 0 && farmSize > 2) {
      toast.error("Please enter a valid farm plot size");
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
        Item_ID: requestData?.Item_ID,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
        Requested_Farm_Size: farmSize,
        Grand_Total_Price: calculateCost(farmSize),
      };

      const response = await apiClient.put(`/estate/farm-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to accept farm request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to accept farm request";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("Farm request is accepted successfully");
      loadData();
      setPaymentMethod("");
      setFarmSize(1);
      setShowAcceptModal(false);
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const declineFarmRequest = async (e) => {
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
        Item_ID: requestData?.item?.Item_ID,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/farm-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to decline farm request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to decline farm request";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("Farm request is declined successfully");
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
        `/customer/customer-request?&Request_ID=${requestID}&Request_Type=farm`,
      );

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch request data");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch request data");
        return;
      }

      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      setRequestData(Array.isArray(newData) ? newData[0] : "");
      setFarmSize(Array.isArray(newData) ? newData[0]?.Quantity : 0.25);
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
              {requestData?.customer?.Customer_ID}
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

      {/* Farm Information */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <GiFarmTractor className="mr-2 text-blue-600" size={24} />
          Farm Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Farm Name</p>
            <p className="font-semibold text-gray-900">
              {requestData?.item?.Item_Name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Hectares</p>
            <p className="font-semibold text-gray-900 capitalize">
              {requestData?.item?.Farm_Size}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price Per 0.25 Hectare</p>
            <p className="font-semibold text-green-600 text-lg">
              {currencyFormatter.format(requestData?.item?.Item_Price)}
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
          <div>
            <p className="text-sm text-gray-600">
              Requested Farm Size (Hectares)
            </p>
            <p className="font-semibold text-gray-900">
              {requestData?.Quantity}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Allocated Farm Size (Hectares)
            </p>
            <p className="font-semibold text-gray-900 capitalize">
              {requestData?.Quantity}
            </p>
          </div>
          {requestData?.Received_Time && (
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
                  {requestData?.Received_By}
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
              Revoke Farm Allocation
            </button>
            <Dialog
              open={open}
              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                {"REVOKE FARM ALLOCATION"}
              </DialogTitle>

              <IconButton
                aria-label="close"
                color="primary"
                onClick={handleClose}
                sx={() => ({
                  position: "absolute",
                  right: 8,
                  top: 8,
                })}
              >
                <MdClose />
              </IconButton>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  Are you sure you want to revoke this farm request allocation?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={(e) => revokeAllocation(e)}
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
        Item_ID: requestData?.item?.Item_ID,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/estate/farm-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to revoke farm allocation");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to revoke farm allocation";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("Farm allocation is revoked successfully");
      loadData();
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const showTabs =
    requestData?.Customer_Status === "served" ||
    requestData?.Customer_Status === "requested" ||
    requestData?.Customer_Status === "rejected";

  const increment = () => {
    if (farmSize < 2) {
      setFarmSize((prev) => parseFloat((prev + 0.25).toFixed(2)));
    }
  };

  const decrement = () => {
    if (farmSize > 0.25) {
      setFarmSize((prev) => parseFloat((prev - 0.25).toFixed(2)));
    }
  };

  const calculateCost = (size) => {
    // Calculate number of 0.25 hectare units
    const quarterHectareUnits = size / 0.25;
    return quarterHectareUnits * requestData?.Price;
  };

  // Helper function to format plot size display
  const formatPlotSize = (size) => {
    return size % 1 === 0 ? size.toString() : size.toFixed(2);
  };

  // Calculate how many 0.25 hectare units
  const getQuarterHectareUnits = (size) => {
    return size / 0.25;
  };

  // Helper function to format cost display
  const formatCost = (size) => {
    const cost = calculateCost(size);
    return currencyFormatter.format(cost);
  };

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Farm Request Details
                  </h1>
                  <p className="text-green-100">
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
                          ? "bg-blue-100 text-green-800"
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
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "details"
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Request Details
                  </button>
                  {["requested", "served", "assign"].includes(
                    requestData?.Customer_Status,
                  ) && (
                    <button
                      onClick={() => setActiveTab("payment")}
                      className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "payment"
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reject Request
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this request:
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-32 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter reason for rejecting..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason("");
                  }}
                  className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={declineFarmRequest}
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
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <p className="text-center text-balck mb-4">
                Kindly confirm the size of the farm plot to be allocated to the
                user:
              </p>

              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold mb-2">
                  Actual user requested plot size is{" "}
                  {requestData?.Quantity || 0} hectare(s)
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Adjust plot size by (0.25 (¼) hectare)
                </div>
                <div className="flex items-center space-x-6 mb-4 mt-2">
                  <button
                    onClick={decrement}
                    disabled={farmSize <= 0.25}
                    className={`p-3 rounded-full shadow-md transition-all duration-200 ${
                      farmSize <= 0.25
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-emerald-100 hover:bg-emerald-200 active:scale-95"
                    }`}
                  >
                    <LuMinus className="w-6 h-6 text-emerald-800" />
                  </button>

                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-900">
                      {formatPlotSize(farmSize)}
                    </div>
                  </div>

                  <button
                    onClick={increment}
                    disabled={farmSize >= 2}
                    className={`p-3 rounded-full shadow-md transition-all duration-200 ${
                      farmSize >= 2
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-emerald-100 hover:bg-emerald-200 active:scale-95"
                    }`}
                  >
                    <LuPlus className="w-6 h-6 text-emerald-800" />
                  </button>
                </div>

                {/* Price Display */}
                <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">
                      {formatCost(farmSize)}
                    </div>
                    <div className="text-gray-600">
                      Total price for {formatPlotSize(farmSize)}{" "}
                      {farmSize > 1 ? "hectares" : "hectare"} plot
                    </div>
                    <div className="text-sm text-emerald-700 mt-2">
                      {getQuarterHectareUnits(farmSize)} units ×{" "}
                      {currencyFormatter.format(requestData?.Price)} per 0.25
                      (¼) hectare = {formatCost(farmSize)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setPaymentMethod("");
                    setFarmSize(1);
                  }}
                  className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={acceptFarmRequest}
                  //   disabled={!paymentMethod}
                  className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
