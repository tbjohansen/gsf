import React, { useState, useRef, useEffect } from "react";
import {
  LuCircleCheckBig,
  LuCircleUserRound,
  LuCircleX,
  LuFileText,
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
import { MdOutlinePendingActions } from "react-icons/md";
import { FcMoneyTransfer } from "react-icons/fc";
import { GiFarmTractor } from "react-icons/gi";
import { CiInboxIn } from "react-icons/ci";

export default function CustomerRequestDetails() {
  const { requestID } = useParams();

  const [requestData, setRequestData] = useState("");
  const [farmSize, setFarmSize] = useState(0.25);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

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
          {requestData?.Customer_Status === "served" ||
            (requestData?.Customer_Status === "requested" && (
              <div>
                <p className="text-sm text-gray-600">
                  Allocated Farm Size (Hectares)
                </p>
                <p className="font-semibold text-gray-900 capitalize">
                  {requestData?.Quantity}
                </p>
              </div>
            ))}

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
        {/* <div>
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 whitespace-pre-line">
              {requestData?.Description}
            </p>
          </div>
        </div> */}
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-6 bg-gray-50">
        {(requestData?.Customer_Status === "pending" ||
          requestData?.Customer_Status === "active") && (
          <div className="text-center py-4">
            <MdOutlinePendingActions
              className="mx-auto text-yellow-600 mb-2"
              size={48}
            />
            <p className="text-xl font-semibold text-yellow-600">
              Pending Request
            </p>
          </div>
        )}

        {requestData?.Customer_Status === "received" && (
          <div className="text-center py-4">
            <CiInboxIn className="mx-auto text-blue-600 mb-2" size={48} />
            <p className="text-xl font-semibold text-blue-600">
              Request Received
            </p>
          </div>
        )}

        {(requestData?.Customer_Status === "served" ||
          requestData?.Customer_Status === "requested") && (
          <div className="text-center py-4">
            <LuCircleCheckBig
              className="mx-auto text-green-600 mb-2"
              size={48}
            />
            <p className="text-xl font-semibold text-green-600">
              Farm Allocated
            </p>
          </div>
        )}

        {requestData?.Customer_Status === "expired" && (
          <div className="text-center py-4">
            <LuCircleX className="mx-auto text-red-600 mb-2" size={48} />
            <p className="text-xl font-semibold text-red-600">
              Allocation Revoked
            </p>
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

  const showTabs =
    requestData?.Customer_Status === "served" ||
    requestData?.Customer_Status === "requested" ||
    requestData?.Customer_Status === "rejected";

  const calculateCost = (size) => {
    // Calculate number of 0.25 hectare units
    const quarterHectareUnits = size / 0.25;
    return quarterHectareUnits * requestData?.Price;
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
      </div>
    </>
  );
}
