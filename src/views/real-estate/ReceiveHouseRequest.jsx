import React, { useState, useRef, useEffect } from "react";
import { BsHouse } from "react-icons/bs";
import {
  LuCircleCheckBig,
  LuCircleUserRound,
  LuCircleX,
  LuClock,
  LuFileText,
} from "react-icons/lu";
import { currencyFormatter } from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../api/Client";

export default function ReceiveHouseRequest() {
  const { requestID } = useParams();

  const [request, setRequest] = useState({
    Request_ID: 47,
    Customer_ID: 26,
    Employee_ID: null,
    real_estate_id: 1,
    Room_ID: null,
    Request_Type: "real_estate",
    Item_ID: 3,
    Price: 200000,
    Quantity: 1,
    Customer_Status: "active",
    Request_Date: "2026-01-05 15:14:50",
    Room_Expire_Date: null,
    Payment_Date: null,
    created_at: "2026-01-05T15:14:50.000000Z",
    updated_at: "2026-01-05T15:14:50.000000Z",
    Sangira_ID: null,
    Room_Status: "not_paid",
    Remarks: null,
    Admitted_Date: null,
    Request_Batch_ID: 14,
    Attachment: null,
    Description:
      "Dear Sir/Madam,\n\nI am writing with an urgent appeal for the allocation of housing due to a significant change in my personal circumstances.\n\nI am currently recovering from a medical condition that makes my current walk-up apartment inaccessible. This situation has caused considerable distress and instability for my family.\n\nThank you for your understanding and compassion.\n\nRespectfully,\nJames Doe.",
    Received_Time: null,
    Received_By: null,
    Sangira: null,
    customer: {
      Customer_ID: 26,
      Customer_Name: "James Doe",
      Phone_Number: "0683855590",
      Gender: "male",
      Customer_Type: null,
      Customer_Status: "active",
      Date_Birth: null,
      Nationality: "Tanzanian",
      Student_ID: "K/2024/39/0003",
      Program_Study: null,
      Year_Study: null,
      Email: "jamesdoe@mail.com",
      Emergency_Contact_Name: null,
      Emergency_Contact_Phone: null,
      created_at: "2025-12-15T16:58:01.000000Z",
      updated_at: "2025-12-15T16:58:01.000000Z",
      Employee_ID: 1,
      Customer_Nature: "house_rent",
      staff_id: null,
      department: null,
      customer_origin: "inside",
      Admission_ID: null,
      Semester: null,
    },
    room: null,
    estate: {
      id: 1,
      name: "A21",
      description: "Located at Doctor's Compound",
      real_estate_type: "house",
      price: 200000,
      Employee_ID: 1,
      created_at: "2025-11-20T14:45:17.000000Z",
      updated_at: "2025-12-13T06:58:17.000000Z",
      status: "active",
      Unit_Location_ID: null,
    },
    sangira: null,
  });

  const [status, setStatus] = useState("pending");
  const [requestData, setRequestData] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReceive = () => {
    setStatus("received");
    setRequest({
      ...request,
      Received_Time: new Date().toISOString(),
      Received_By: "Current User",
    });
  };

  const receiveRequest = async (e) => {
    e.preventDefault();

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!requestData) {
      toast.error(
        "Request information not found. Please refresh and try again."
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send
      const data = {
        Customer_Status: "received",
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(`/estate/real-estate-request`, data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error(
            response.data?.error || "Failed to receive house request"
          );
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage =
          response.data.error || "Failed to receive house request";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("House request is received successfully");

      // Trigger parent component refresh
      loadData();

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const handleDecline = () => {
    if (declineReason.trim()) {
      setStatus("declined");
      setRequest({
        ...request,
        Room_Status: "declined",
        Remarks: declineReason,
      });
      setShowDeclineModal(false);
      setDeclineReason("");
    }
  };

  const handleAccept = () => {
    if (paymentMethod) {
      setStatus("accepted");
      setRequest({
        ...request,
        Room_Status: "accepted",
        Remarks: `Payment Method: ${paymentMethod}`,
      });
      setShowAcceptModal(false);
      setPaymentMethod("");
    }
  };

  const acceptHouseRequest = async (e) => {
    e.preventDefault();

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    if (!requestData) {
      toast.error(
        "Request information not found. Please refresh and try again."
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send
      const data = {
        Customer_Status: paymentMethod === "cash" ? "assign" : "served",
        Payment_Mode: paymentMethod,
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(`/estate/real-estate-request`, data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error(response.data?.error || "Failed to accept house request");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage =
          response.data.error || "Failed to accept house request";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("House request is accepted successfully");

      // Trigger parent component refresh
      loadData();

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Update unit error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const declineHouseRequest = async (e) => {
    e.preventDefault();

    // Get employee info from localStorage
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
        "Request information not found. Please refresh and try again."
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send
      const data = {
        Customer_Status: "rejected",
        Rejection_Reason: declineReason,
        real_estate_id: requestData?.real_estate_id,
        Request_Batch_ID: requestData?.Request_Batch_ID,
        Customer_ID: requestData?.Customer_ID,
        Request_ID: requestID,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(`/estate/real-estate-request`, data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error(
            response.data?.error || "Failed to decline house request"
          );
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage =
          response.data.error || "Failed to decline house request";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("House request is declined successfully");

      // Trigger parent component refresh
      loadData();

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
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
        `/customer/customer-request?&&Request_ID=${requestID}Request_Type=real_estate`
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

      // Adjust based on your API response structure
      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      console.log(newData);
      setRequestData(Array.isArray(newData) ? newData[0] : "");
      setLoading(false);
    } catch (error) {
      console.error("Fetch requests error:", error);
      setLoading(false);
      toast.error("Failed to load request data");
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
                    House Request Details
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
                      : requestData?.Customer_Status === "received"
                      ? "bg-blue-100 text-blue-800"
                      : requestData?.Customer_Status === "assign"
                      ? "bg-blue-100 text-purple-800"
                      : requestData?.Customer_Status === "served" ||
                        requestData?.Customer_Status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {requestData?.Customer_Status?.toUpperCase()}
                </div>
              </div>
            </div>

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
                    {requestData?.estate?.description}
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
              {requestData?.Customer_Status === "pending" ||
                (requestData?.Customer_Status === "active" && (
                  <button
                    onClick={receiveRequest}
                    className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <LuClock className="mr-2" size={20} />
                    Receive Request
                  </button>
                ))}

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

              {requestData?.Customer_Status === "served" ||
                (requestData?.Customer_Status === "assign" && (
                  <div className="text-center py-4">
                    <LuCircleCheckBig
                      className="mx-auto text-green-600 mb-2"
                      size={48}
                    />
                    <p className="text-xl font-semibold text-green-600">
                      Request Accepted
                    </p>
                  </div>
                ))}

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
                Please select a payment method:
              </p>
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="free"
                    checked={paymentMethod === "free"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Free</p>
                    <p className="text-sm text-gray-600">No payment required</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="salary_deduction"
                    checked={paymentMethod === "salary_deduction"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Salary Deduction
                    </p>
                    <p className="text-sm text-gray-600">
                      Deduct from monthly salary
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Cash Payment</p>
                    <p className="text-sm text-gray-600">Pay in cash</p>
                  </div>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setPaymentMethod("");
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
