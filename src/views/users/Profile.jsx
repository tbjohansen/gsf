import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  LuUser,
  LuMail,
  LuPhone,
  LuBuilding,
  LuCalendar,
  LuKey,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";
import apiClient from "../../api/Client";
import { capitalize, formatDateTimeForDb } from "../../../helpers";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Get employee info from localStorage
  const employeeId = localStorage.getItem("employeeId");
  const userEmail = localStorage.getItem("userEmail");
  const userDetails = localStorage.getItem("userInfo");
  const userInfo = JSON.parse(userDetails);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send (match your API field names)
      const data = {
        current_password: currentPassword,
        password: newPassword,
        email: userEmail,
        Employee_ID: employeeId,
      };

      console.log("Submitting employee password data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/change-password", data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to change employee password");
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
          toast.error("Failed to change employee password");
        } else {
          // Handle simple error string
          const errorMessage =
            response.data.error || "Failed to change employee password";
          toast.error(errorMessage);
        }
        return;
      }

      // Simulate API call
      setTimeout(() => {
        toast.error("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setLoading(false);

        handleLogout();
      }, 1500);

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Update employee password error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

    const handleLogout = async () => {

    try {
      // Optional: Call logout API endpoint if your backend has one
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await apiClient.post("/logout");
        if (!response.ok) {
          // Ignore logout API errors, still clear local data
          console.log("Logout API call failed, but clearing local data");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all stored authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("expiresIn");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      // Remove authorization header from API client using apisauce method
      apiClient.deleteHeader("Authorization");

      // Show success message and redirect
      toast.success("Logged out successfully");

      // Redirect to login page
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and security
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "password"
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Change Password
              </button>
            </div>
          </div>

          {activeTab === "profile" && (
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {capitalize(
                    userInfo?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {capitalize(userInfo?.name)}
                  </h2>
                  <p className="text-gray-600">
                    {capitalize(userInfo?.position) || "Employee"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <LuUser className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {capitalize(userInfo?.name)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <LuMail className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{userInfo?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <LuPhone className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{userInfo?.phone}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created Date
                  </label>
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <LuCalendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDateTimeForDb(userInfo?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  To update your profile information, please contact the system
                  administrator.
                </p>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="p-6">
              <div className="w-full flex justify-center">
                <div>
                  <p className="text-sm text-gray-600 mb-6">
                    Ensure your account is using a long, random password to stay
                    secure.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <LuEyeOff className="w-5 h-5" />
                          ) : (
                            <LuEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <LuEyeOff className="w-5 h-5" />
                          ) : (
                            <LuEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <LuEyeOff className="w-5 h-5" />
                          ) : (
                            <LuEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-medium rounded-md shadow-lg hover:shadow-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Updating Password..." : "Update Password"}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Minimum 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
