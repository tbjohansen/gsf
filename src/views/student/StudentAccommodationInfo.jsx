import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import apiClient from "../../api/Client";
import {
  LuUser,
  LuHouse,
  LuBuilding,
  LuLayers,
  LuDoorOpen,
  LuCircleCheck,
} from "react-icons/lu";
import {
  capitalize,
  formatDateForDb,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";

const StudentAccommodationInfo = ({
  studentId,
  studentData,
  requestedInfo,
}) => {
  const [loading, setLoading] = useState(true);
  const [accommodationData, setAccommodationData] = useState(null);

  useEffect(() => {
    if (studentId && requestedInfo) {
      loadAccommodationInfo();
    }
  }, [studentId, requestedInfo]);

  const loadAccommodationInfo = async () => {
    setLoading(true);
    try {
      // Adjust the endpoint based on your API structure
      const response = await apiClient.get(
        `/student-accommodation-info?Student_ID=${studentId}`
      );

      if (!response.ok) {
        setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch accommodation information"
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch accommodation information"
        );
        return;
      }

      const data = response.data?.data;
      setAccommodationData(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch accommodation info error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LinearProgress />
        <p className="text-center text-gray-600">
          Loading accommodation information...
        </p>
      </div>
    );
  }

  // Use accommodationData if available, otherwise use requestedInfo
  const accommodation = accommodationData || requestedInfo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <LuCircleCheck className="w-8 h-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-800">
            Accommodation Request Status
          </h3>
        </div>
        <p className="text-gray-600">
          Your accommodation request has been submitted. Below are the details.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Student Information */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-oceanic flex items-center justify-center">
              <LuUser className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Student Information
            </h3>
          </div>

          <div className="space-y-5">
            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Student Number
              </p>
              <p className="text-lg font-bold text-gray-900">
                {studentData?.Student_ID || studentId || "N/A"}
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Full Name
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {studentData?.Customer_Name || "N/A"}
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Email Address
              </p>
              <p className="text-base font-medium text-gray-800 break-words">
                {studentData?.Email || "N/A"}
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Program of Study
              </p>
              <p className="text-base font-semibold text-gray-900">
                {studentData?.Program_Study || "N/A"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Year of Study
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {studentData?.Year_Study || "N/A"}
                </p>
              </div>

              <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Nationality
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {studentData?.Nationality || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Accommodation Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <LuHouse className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Accommodation Details
            </h3>
          </div>

          <div className="space-y-5">
            {/* Request Status */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Request Status
              </p>
              <p className="text-lg font-bold text-green-700">
                {capitalize(accommodation?.Sangira_Status || "Pending")}
              </p>
            </div>

            {/* Hostel */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LuHouse className="w-5 h-5 text-oceanic" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Hostel
                </p>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {accommodation?.room?.hostel?.Hostel_Name || "N/A"}
              </p>
            </div>

            {/* Block */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LuBuilding className="w-5 h-5 text-oceanic" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Block
                </p>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {accommodation?.room?.block?.Block_Name || "N/A"}
              </p>
            </div>

            {/* Floor */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LuLayers className="w-5 h-5 text-oceanic" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Floor
                </p>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {accommodation?.room?.flow?.Flow_Name || "N/A"}
              </p>
            </div>

            {/* Room */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LuDoorOpen className="w-5 h-5 text-oceanic" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Room
                </p>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {accommodation?.room?.Room_Name || "N/A"}
              </p>
            </div>

            {/* Room Type */}
            {accommodation?.Room_Type && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Room Type
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {accommodation?.Room_Type}
                </p>
              </div>
            )}

            {/* Request Date */}
            {accommodation?.created_at && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Request Date
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {formatDateForDb(accommodation.created_at)}
                </p>
              </div>
            )}

            {/* Price (if available) */}
            {accommodation?.Price && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Room Price
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {formatter?.format(accommodation?.Price)} {accommodation.Currency || "TZS"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAccommodationInfo;
