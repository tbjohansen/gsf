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
import { capitalize, currencyFormatter, removeUnderscore } from "../../../helpers";
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
          toast.error("Failed to receive rental space request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to receive rental space request";
        toast.error(errorMessage);
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
      } else {
        data.months = numberOfMonths;
      }
      data.Grand_Total_Price = calculateGrandTotal();

      const response = await apiClient.put(`/estate/real-estate-request`, data);

      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to accept rental space request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to accept rental space request";
        toast.error(errorMessage);
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
          toast.error("Failed to decline rental space request");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to decline rental space request";
        toast.error(errorMessage);
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
          //   <div className="text-center py-4">
          //     <LuCircleCheckBig
          //       className="mx-auto text-green-600 mb-2"
          //       size={48}
          //     />
          //     <p className="text-xl font-semibold text-green-600">
          //       Request Accepted
          //     </p>
          //   </div>

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
              // slots={{
              //   transition: Transition,
              // }}
              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                {"REVOKE HOUSE ALLOCATION"}
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
                  Are you sure you want to revoke this space rental request
                  allocation ?
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left section */}
            <div className="flex items-start sm:items-center">
              <LuCircleCheckBig
                className="text-green-600 mr-3 mt-1 sm:mt-0"
                size={32}
              />
              <div>
                <p className="font-semibold text-gray-900">Contract Uploaded</p>
                <p className="text-sm text-gray-600 break-all">
                  Uploaded on: {requestData?.Contract_Attached_Time}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadContract}
                className="flex items-center justify-center w-full sm:w-auto cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                <LuDownload className="mr-2" size={18} />
                Download Contract
              </button>

              <button
                onClick={handleUpdateContract}
                className="flex items-center justify-center w-full sm:w-auto cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
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
                Sangila Number
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
          toast.error("Failed to revoke rental space allocation");
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to revoke rental space allocation";
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("Rental space allocation is revoked successfully");
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
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
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Request Details
                  </button>
                  {["requested", "served", "assign"].includes(
                    requestData?.Customer_Status,
                  ) && (
                    <button
                      onClick={() => setActiveTab("contract")}
                      className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "contract"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Contract Management
                    </button>
                  )}
                  {["requested", "served", "assign"].includes(
                    requestData?.Customer_Status,
                  ) && (
                    <button
                      onClick={() => setActiveTab("payment")}
                      className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "payment"
                          ? "border-blue-600 text-blue-600"
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
                          ? "border-blue-600 text-blue-600"
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Accept Request
              </h3>
              <p className="text-gray-600 mb-4">
                Please select a payment duration:
              </p>
              <div className="space-y-2 mb-4">
                <label className="block p-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center mb-3">
                    <input
                      type="radio"
                      name="payment"
                      value="monthly"
                      checked={paymentMethod === "monthly"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4 text-green-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Monthly</p>
                      <p className="text-sm text-gray-600">
                        Pay in cash using month(s) structure
                      </p>
                    </div>
                  </div>

                  {paymentMethod === "monthly" && (
                    <div className="ml-7 space-y-2 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Months
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={numberOfMonths}
                          onChange={(e) =>
                            setNumberOfMonths(parseInt(e.target.value) || 1)
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter number of months"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grand Total Amount
                        </label>
                        <input
                          type="text"
                          value={currencyFormatter.format(
                            calculateGrandTotal(),
                          )}
                          disabled
                          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                </label>

                <label className="block p-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center mb-3">
                    <input
                      type="radio"
                      name="payment"
                      value="yearly"
                      checked={paymentMethod === "yearly"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4 text-green-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Yearly</p>
                      <p className="text-sm text-gray-600">
                        Pay in cash using year(s) structure
                      </p>
                    </div>
                  </div>

                  {paymentMethod === "yearly" && (
                    <div className="ml-7 space-y-2 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Years
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={numberOfYears}
                          onChange={(e) =>
                            setNumberOfYears(parseInt(e.target.value) || 1)
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter number of years"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grand Total Amount
                        </label>
                        <input
                          type="text"
                          value={currencyFormatter.format(
                            calculateGrandTotal(),
                          )}
                          disabled
                          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700 font-semibold cursor-not-allowed"
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
                  className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={acceptHouseRequest}
                  disabled={!paymentMethod}
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
