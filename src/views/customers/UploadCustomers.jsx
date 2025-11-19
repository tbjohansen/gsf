import React, { useState } from "react";
import { HiUpload } from "react-icons/hi";
import { FaFileExcel, FaTrash, FaUpload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { LuLoader } from "react-icons/lu";
import apiClient from "../../api/Client";

export default function UploadCustomers() {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
          // Process the data to add "0" to the start of every available PHONE
          const processedData = jsonData.map((row) => {
            // Check if PHONE exists and is not null, undefined, or empty
            if (row.PHONE != null && row.PHONE !== "") {
              // Convert to string and add "0" at the start
              return {
                ...row,
                PHONE: "0" + String(row.PHONE),
              };
            }
            // Return the row unchanged if PHONE is null, undefined, or empty
            return row;
          });

          console.log(processedData);
          setExcelData(processedData);
          setHeaders(Object.keys(processedData[0]));
          setFileName(file.name);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error reading Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const clearData = () => {
    setExcelData([]);
    setFileName("");
    setHeaders([]);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!excelData) {
      toast.error("Please upload students excel");
      return;
    }

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");
    const userName = localStorage.getItem("userName");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    const data = {
      customer: excelData,
      Employee_ID: employeeId,
    };

    try {
      console.log("Submitting students data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/customer/import-customer", data);

      console.log("Response:", response);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to upload students");
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
          toast.error("Failed to upload students");
        } else {
          // Handle simple error string
          const errorMessage = "Failed to upload students";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Students uploded successfully");

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("upload students error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <div className="w-[100%]">
      <div className="w-full mx-auto">
        <div
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 shadow-lg shadow-black-100 mb-8 ${
            isDragging ? "bg-white scale-105" : "bg-white backdrop-blur-sm"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-50"></div>
          <div className="relative p-5">
            <div className="flex flex-col items-center justify-center">
              <div
                className={`p-6 rounded-full mb-3 transition-all duration-300 ${
                  isDragging
                    ? "bg-gradient-to-r from-blue-500 to-sky-500 scale-110"
                    : "bg-gray-500/50"
                }`}
              >
                <HiUpload
                  className={`w-10 h-10 ${
                    isDragging ? "text-white" : "text-black-200"
                  }`}
                />
              </div>

              <h3 className="text-lg font-bold text-black mb-2">
                {isDragging
                  ? "Drop it here!"
                  : "Upload Students Excel File Here"}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Drag and drop or click to browse
              </p>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="group px-8 py-3 bg-gradient-to-r from-blue-900 to-sky-600 text-white font-semibold rounded-xl cursor-pointer hover:from-blue-500 hover:to-sky-500 transition-all duration-300 shadow-lg hover:shadow-sky-500/50 hover:scale-105"
              >
                <span className="flex items-center text-white gap-2">
                  <FaFileExcel className="w-4 h-4" />
                  Browse Files
                </span>
              </label>
              <p className="text-xs text-gray mt-4">
                Supports .xlsx and .xls formats
              </p>
            </div>
          </div>
        </div>

        {/* File Info Card */}
        {fileName && (
          <div className="bg-slate-700/70 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <FaFileExcel className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{fileName}</p>
                  <p className="text-purple-400 text-sm font-medium">
                    {excelData.length} rows • {headers.length} columns
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => submit(e)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 flex items-center gap-2 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" /> Uploading
                      ...
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-4 h-4" />
                      Upload Students
                    </>
                  )}
                </button>
                <button
                  onClick={clearData}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-red-500/50 flex items-center gap-2 hover:scale-105"
                >
                  <FaTrash className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
