import { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import apiClient from "../../../api/Client";

export default function Configurations() {
  const [bookingMode, setBookingMode] = useState();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare the data to send (match your API field names)
      const data = {
        bookingMode: bookingMode,
        Employee_ID: employeeId,
      };

      console.log("Submitting hostel data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/config", data);

      if (!response.ok) {
        setSubmitting(false);

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
              : "Failed to save configurations",
          );
        }
        return;
      }

      // Success
      setSubmitting(false);
      toast.success("Configuration saved successfully");

      // Trigger parent component refresh
      // if (loadData && typeof loadData === "function") {
      //   loadData();
      // }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Create configurations error:", error);
      setSubmitting(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <form>
        <div className="py-4 flex justify-center">
          <div className="w-[80%] flex flex-row gap-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={bookingMode}
                  onChange={(e) => setBookingMode(e.target.checked)}
                  name="bookingMode"
                  color="primary"
                />
              }
              label="Booking mode"
            />
          </div>
        </div>

        <div className="flex justify-center py-4">
          <button
            onClick={(e) => submit(e)}
            disabled={submitting}
            className="flex w-[80%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </Paper>
  );
}
