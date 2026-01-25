import React, { useState, useEffect } from "react";
import {
  LuCircleAlert,
  LuCircleCheck,
  LuMinus,
  LuPlus,
  LuSend,
  LuTrees,
} from "react-icons/lu";
import { PiPlantLight } from "react-icons/pi";
import { currencyFormatter } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";

const CustomerFarms = () => {
  // const farms = [
  //   {
  //     Item_ID: 20,
  //     Item_Name: "GSF Farm",
  //     Item_Price: "150000",
  //     Farm_Size: 15,
  //     Available_Size: 15,
  //     description: "Premium farm with irrigation facilities",
  //   },
  //   {
  //     Item_ID: 21,
  //     Item_Name: "Shanty Farm",
  //     Item_Price: "100000",
  //     Farm_Size: 15,
  //     Available_Size: 10,
  //     description: "Economy farm with basic facilities",
  //   },
  // ];

  const [selectedFarm, setSelectedFarm] = useState("");
  const [plotSize, setPlotSize] = useState(0.25);
  const [requests, setRequests] = useState([]);
  const [farms, setFarms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate price per 0.25 hectare from farm's Item_Price
  const pricePerQuarterHectare = parseFloat(selectedFarm?.Item_Price || 0);
  const maxPlotSize = 2; // Maximum 2 hectares

  useEffect(() => {
    // Reset plot size to minimum when farm changes
    setPlotSize(0.25);
  }, [selectedFarm]);

  const increment = () => {
    if (plotSize < maxPlotSize) {
      setPlotSize((prev) => parseFloat((prev + 0.25).toFixed(2)));
    }
  };

  const decrement = () => {
    if (plotSize > 0.25) {
      setPlotSize((prev) => parseFloat((prev - 0.25).toFixed(2)));
    }
  };

  const handleFarmChange = (e) => {
    const farmId = parseInt(e.target.value);
    const farm = farms.find((f) => f.Item_ID === farmId);
    if (farm) {
      setSelectedFarm(farm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(selectedFarm);

    if (!plotSize) {
      toast.error("Please add plot size");
      return;
    }

    if (!selectedFarm) {
      toast.error("Please select farm to make a request");
      return;
    }

    // Get employee info from localStorage
    const customerData = localStorage.getItem("userInfo");
    const customer = JSON?.parse(customerData);
    console.log(customer);

    if (!customer) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        Item_ID: selectedFarm?.Item_ID,
        Requested_Farm_Size: plotSize,
        Price: selectedFarm?.Item_Price,
        Customer_ID: customer?.Customer_ID,
        Employee_ID: customer?.Employee_ID,
        Phone_Number: customer?.phone,
        Request_Type: "farm",
        Description: "I need a farm",
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/estate/farm-request", data);

      // Check if request was successful
      if (!response.ok) {
        setIsSubmitting(false);

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
        setIsSubmitting(false);

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
      setIsSubmitting(false);
      toast.success("Request is sent successfully");

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("An unexpected error occurred. Please try again");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCost = (size) => {
    // Calculate number of 0.25 hectare units
    const quarterHectareUnits = size / 0.25;
    return quarterHectareUnits * pricePerQuarterHectare;
  };

  // Helper function to format plot size display
  const formatPlotSize = (size) => {
    return size % 1 === 0 ? size.toString() : size.toFixed(2);
  };

  // Helper function to format cost display
  const formatCost = (size) => {
    const cost = calculateCost(size);
    return currencyFormatter.format(cost);
  };

  // Calculate how many 0.25 hectare units
  const getQuarterHectareUnits = (size) => {
    return size / 0.25;
  };

  // Check if selected plot size exceeds available farm size
  const exceedsAvailableSize = plotSize > selectedFarm?.Available_Size || 15;

  const loadFarms = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/item", {
        Item_Type: "farm",
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data;
      const newData = userData?.map((farm, index) => ({
        ...farm,
        key: index + 1,
      }));

      setFarms(Array.isArray(newData) ? newData : []);
      setSelectedFarm(newData[0]);

      setLoading(false);
    } catch (error) {
      console.error("Fetch farms error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Disclaimer Banner */}
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <LuCircleAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Disclaimer: Plot size is subject to change based on management
                approval, user needs, and availability.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-4">
            Farm Plot Rental
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Select a farm and choose your desired plot size in 0.25 (¼) hectare
            increments
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700">
            <PiPlantLight className="w-6 h-6" />
            <span className="text-sm font-medium">
              Sustainable Farming • Flexible Terms • Full Support
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Farm Selection and Plot Size Selector */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-emerald-100">
              {/* Farm Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-emerald-900 mb-4">
                  Select Farm
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farms.map((farm) => (
                    <div
                      key={farm.Item_ID}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedFarm.Item_ID === farm.Item_ID
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                      onClick={() => setSelectedFarm(farm)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-emerald-900">
                            {farm.Item_Name}
                          </h3>
                          {/* <p className="text-sm text-gray-600 mt-1">
                            {farm.description}
                          </p> */}
                          {/* <div className="mt-2 text-sm">
                            <span className="text-gray-700">Available: </span>
                            <span className="font-semibold text-emerald-700">
                              {farm.Available_Size} hectares
                            </span>
                          </div> */}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-800">
                            {currencyFormatter.format(
                              parseFloat(farm.Item_Price),
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            per 0.25 hectare
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Farm Info */}
              <div className="mb-8 p-4 bg-emerald-50 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-emerald-900">
                      Selected: {selectedFarm.Item_Name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Price: {currencyFormatter.format(pricePerQuarterHectare)}{" "}
                      per 0.25 hectare
                    </p>
                  </div>
                  {/* <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Farm Size</div>
                      <div className="font-bold text-emerald-800">{selectedFarm.Farm_Size} hectares</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Available</div>
                      <div className="font-bold text-emerald-800">{selectedFarm.Available_Size} hectares</div>
                    </div>
                  </div> */}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-emerald-900">
                  Select Plot Size
                </h2>
                <div className="px-4 py-2 bg-emerald-100 rounded-full">
                  <span className="text-emerald-800 font-semibold">
                    0.25 (¼) hectare = 2,500 m²
                  </span>
                </div>
              </div>

              {/* Plot Size Controls */}
              <div className="mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Counter Controls */}
                  <div className="flex flex-col items-center">
                    <div className="text-sm text-gray-500 mb-2">
                      Adjust Plot Size (0.25 (¼) hectare increments)
                    </div>
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={decrement}
                        disabled={plotSize <= 0.25}
                        className={`p-3 rounded-full shadow-md transition-all duration-200 ${
                          plotSize <= 0.25
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-emerald-100 hover:bg-emerald-200 active:scale-95"
                        }`}
                      >
                        <LuMinus className="w-6 h-6 text-emerald-800" />
                      </button>

                      <div className="text-center">
                        <div className="text-3xl md:text-5xl font-bold text-emerald-900 mb-2">
                          {formatPlotSize(plotSize)}
                        </div>
                        <div className="text-gray-600">hectares</div>
                        <div className="text-sm text-emerald-700 mt-1">
                          ({getQuarterHectareUnits(plotSize)} × 0.25 (¼) hectare
                          units)
                        </div>
                      </div>

                      <button
                        onClick={increment}
                        disabled={plotSize >= maxPlotSize}
                        className={`p-3 rounded-full shadow-md transition-all duration-200 ${
                          plotSize >= maxPlotSize
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-emerald-100 hover:bg-emerald-200 active:scale-95"
                        }`}
                      >
                        <LuPlus className="w-6 h-6 text-emerald-800" />
                      </button>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      {[0.25, 0.5, 1, 1.5, 2].map((size) => (
                        <button
                          key={size}
                          onClick={() => setPlotSize(size)}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            plotSize === size
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {size} hectares
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visualization */}
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl border-4 border-emerald-200 shadow-lg overflow-hidden">
                      {/* Plot grid visualization - Each square = 0.25 hectare */}
                      <div className="absolute inset-2 grid grid-cols-4 grid-rows-4 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => {
                          // Show 8 squares max (for 2 hectares = 8 × 0.25)
                          const filled =
                            i < Math.min(8, Math.floor(plotSize / 0.25));
                          return (
                            <div
                              key={i}
                              className={`transition-all duration-300 rounded ${
                                filled
                                  ? "bg-emerald-500"
                                  : i < 8
                                    ? "bg-emerald-100/50"
                                    : "bg-gray-100/30"
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Plot size indicator */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow">
                        <div className="text-center text-sm">
                          <div className="font-bold text-emerald-800">
                            {formatPlotSize(plotSize)} hectares
                          </div>
                          <div className="text-xs text-gray-600">
                            {(plotSize * 10000).toLocaleString()} m²
                          </div>
                          <div className="text-xs text-emerald-700">
                            {getQuarterHectareUnits(plotSize)} × 0.25 (¼) hectare
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Size Slider */}
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">Minimum: 0.25 hectare</span>
                    <span className="text-gray-600">
                      Maximum: {maxPlotSize} hectares
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max={maxPlotSize}
                    step="0.25"
                    value={plotSize}
                    onChange={(e) => setPlotSize(parseFloat(e.target.value))}
                    className="w-full h-3 bg-emerald-100 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {[0.25, 0.5, 1, 1.5, 2].map((size) => (
                      <span key={size}>
                        {size % 1 === 0 ? size : size.toFixed(2)}{" "}
                        {size > 1 ? "hectares" : "hectare"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warning if exceeds available size */}
              {/* {exceedsAvailableSize && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3 text-red-700">
                    <LuCircleAlert className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        Plot size exceeds available farm space!
                      </p>
                      <p className="text-sm mt-1">
                        Selected: {plotSize} hectares | Available:{" "}
                        {selectedFarm.Available_Size} hectares
                      </p>
                      <p className="text-sm">
                        Your request will require management approval.
                      </p>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Price Display */}
              <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">
                    {formatCost(plotSize)}
                  </div>
                  <div className="text-gray-600">
                    Total price for {formatPlotSize(plotSize)}{" "}
                    {plotSize > 1 ? "hectares" : "hectare"} plot
                  </div>
                  <div className="text-sm text-emerald-700 mt-2">
                    {getQuarterHectareUnits(plotSize)} units ×{" "}
                    {currencyFormatter.format(pricePerQuarterHectare)} per 0.25 (¼)
                    hectare = {formatCost(plotSize)}
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="text-2xl font-bold text-emerald-900 mb-2">
                      One-time payment
                    </div>
                    <div className="text-gray-600">
                      Request {formatPlotSize(plotSize)}{" "}
                      {plotSize > 1 ? "hectares" : "hectare"} plot at{" "}
                      {selectedFarm.Item_Name}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="w-full md:w-auto">
                    <button
                      type="submit"
                      disabled={isSubmitting || plotSize > maxPlotSize}
                      className="w-full cursor-pointer md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <LuSend className="w-5 h-5" />
                          Send Rental Request
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-100 p-4 rounded-lg animate-fade-in">
                    <LuCircleCheck className="w-5 h-5" />
                    <span>
                      Request submitted successfully! Farm management will
                      contact you soon.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Requests - Full Width Below */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100 h-full">
              {/* <h3 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                <LuCircleAlert className="w-5 h-5" />
                Recent Requests
              </h3> */}

              {/* {requests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No requests yet</div>
                  <div className="text-gray-500 text-sm">
                    Your rental requests will appear here
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-emerald-900">
                            {formatPlotSize(request.size)} hectare plot
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.farm} • Requested on {request.date}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          {request?.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {currencyFormatter.format(request.totalCost)} •
                        Rate:{" "}
                        {currencyFormatter.format(
                          request.pricePerQuarterHectare,
                        )}{" "}
                        per 0.25 (¼) hectare
                      </div>
                    </div>
                  ))}
                </div>
              )} */}

              {/* Information Panel */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">How it works</h4>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Select a farm from available options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>
                      Choose plot size in 0.25 (¼) hectare increments (max{" "}
                      {maxPlotSize} hectares)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Submit rental request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Make payment through sangira number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span>Farm management contacts you within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">6.</span>
                    <span>Final plot size confirmed based on availability</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Note: Price is fixed per 0.25 (¼) hectare.
            Maximum plot size per request is {maxPlotSize} hectares.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerFarms;
