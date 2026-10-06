import { useEffect, useState } from "react";
import { Checkbox, FormControlLabel, Paper } from "@mui/material";
import toast from "react-hot-toast";
import apiClient from "../../../api/Client";

export default function Configurations() {
  const [bookingMode, setBookingMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/config");

      if (!response.ok || response.data?.error || response.data?.code >= 400) {
        return;
      }

      const configs = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];

      const bookingConfig = configs.find((c) => c.key === "bookingMode");
      if (bookingConfig) {
        setBookingMode(
          bookingConfig.value === "yes" ||
            bookingConfig.value === "true" ||
            bookingConfig.value === true
        );
      }
    } catch (error) {
      console.error("Fetch config error:", error);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        bookingMode: bookingMode,
        Employee_ID: employeeId,
      };

      const response = await apiClient.post("/config", data);

      if (!response.ok) {
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage =
            response?.data?.error || response?.data?.message;
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to save configurations"
          );
        }
        return;
      }

      toast.success("Configuration saved successfully");
      loadData();
    } catch (error) {
      console.error("Create configurations error:", error);
      toast.error("An unexpected error occurred. Please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <form onSubmit={submit}>
        <div className="py-4 flex justify-center">
          <div className="w-[80%] flex flex-row gap-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={bookingMode}
                  onChange={(e) => setBookingMode(e.target.checked)}
                  name="bookingMode"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Booking mode"
            />
          </div>
        </div>

        <div className="flex justify-center py-4">
          <button
            type="submit"
            disabled={submitting || loading}
            className="flex w-[80%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </Paper>
  );
}