import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsHouseAdd } from "react-icons/bs";
import Breadcrumb from "../../components/Breadcrumb";
import apiClient from "../../api/Client";
import { useNavigate, useParams } from "react-router-dom";

const SpaceRequestLetter = () => {
  const [letterContent, setLetterContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [unit, setUnit] = useState("");

  const { unitID } = useParams();
  const navigate = useNavigate();

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
      const response = await apiClient.get("/settings/real-estate", {
        id: unitID,
      });

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch space unit");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch space unit");
        return;
      }

      const userData = response?.data?.data?.data;
      setUnit(userData[0]);
      setLoading(false);
    } catch (error) {
      console.error("Fetch space unit error:", error);
      setLoading(false);
      toast.error("Failed to load space unit");
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!letterContent.trim()) {
      toast.error("Please write your letter first");
      return;
    }

    if (!unit) {
      toast.error("Please select rental space to request");
      return;
    }

    // Get employee info from localStorage
    const customerData = localStorage.getItem("userInfo");
    const customer = JSON?.parse(customerData);

    if (!customer) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send (match your API field names)
      const data = {
        Customer_ID: customer?.Customer_ID,
        Description: letterContent.trim(),
        real_estate_id: unitID,
        Phone_Number: customer?.phone,
        Price: unit?.price,
        Request_Type: "business_land",
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post(
        "/estate/real-estate-request",
        data
      );

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to submit request");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);

        // Handle validation errors (nested error object)
        if (response.data?.error && typeof response.data.error === "object") {
          // Extract first validation error message
          const firstErrorKey = Object.keys(response.data.error)[0];
          const firstErrorMessage = response.data.error[firstErrorKey][0];
          toast.error("Failed to submit request");
        } else {
          // Handle simple error string
          const errorMessage = "Failed to submit request";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Request is sent successfully");
      setLetterContent("");

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Send request error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="inline-flex text-black items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full">
                  <BsHouseAdd className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-center mb-2">
                Rental Space Allocation Request Letter
              </h1>
              <p className="text-center text-blue-100">
                Write your formal request to the Managing Director
              </p>
            </div>

            {/* Writing Area */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <label className="block text-lg font-semibold text-gray-800">
                  Write Your Letter
                </label>
                <div className="text-sm text-gray-500">
                  {letterContent.length} characters
                </div>
              </div>

              <textarea
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                className="w-full h-[500px] p-6 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed resize-none"
                placeholder="Start writing your rental space allocation request letter here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="flex-1 cursor-pointer bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Request Letter"
                )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpaceRequestLetter;
