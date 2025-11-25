import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { toast } from "react-hot-toast";
import apiClient from "../../api/Client";
import { MdAdd } from "react-icons/md";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { capitalize } from "lodash";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddCustomer = ({ loadData, status }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      Customer_Name: "",
      Gender: "",
      Nationality: "",
      Phone_Number: "",
      Email: "",
      Student_ID: "",
      Program_Study: "",
      Year_Study: "",
      Customer_Status: "active",
      Customer_Nature: status || "student",
      Admission_ID: "",
    });
  };
  const [formData, setFormData] = useState({
    Customer_Name: "",
    Gender: "",
    Nationality: "",
    Phone_Number: "",
    Email: "",
    Student_ID: "",
    Program_Study: "",
    Year_Study: "",
    Customer_Status: "active",
    Customer_Nature: status || "student",
    Admission_ID: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!formData.Customer_Name || formData.Customer_Name.trim() === "") {
      toast.error("Please enter customer name");
      return;
    }

    if (!formData.Phone_Number || formData.Phone_Number.trim() === "") {
      toast.error("Please enter phone number");
      return;
    }

    if (!formData.Email || formData.Email.trim() === "") {
      toast.error("Please enter email");
      return;
    }

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send
      const data = {
        ...formData,
        Customer_Name: formData.Customer_Name.trim(),
        Phone_Number: formData.Phone_Number.startsWith("0")
          ? formData.Phone_Number
          : `0${formData.Phone_Number}`,
        Employee_ID: employeeId,
      };

      console.log("Submitting customer data:", data);

      // Make API request
      const response = await apiClient.post("/customer/customer", data);

      console.log("Response:", response);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to create customer");
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        if (response.data?.error && typeof response.data.error === "object") {
          toast.error("Failed to create customer");
        } else {
          const errorMessage = "Failed to create customer";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Customer created successfully");

      // Reset form
      setFormData({
        Customer_Name: "",
        Gender: "",
        Nationality: "",
        Phone_Number: "",
        Email: "",
        Student_ID: "",
        Program_Study: "",
        Year_Study: "",
        Customer_Status: "active",
        Customer_Nature: status || "student",
      });

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Create customer error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-60 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white">
        <MdAdd className="my-3" /> <p className="py-2">Create New {status === "student" ? status : "Customer"}</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Add {status === "student" ? status : "Customer"}
            </h3>
            <form onSubmit={submit} className="space-y-4">
              <TextField
                size="small"
                label={`${
                  status === "student" ? "Student Name" : "Customer Name"
                }`}
                variant="outlined"
                fullWidth
                required
                className="w-full"
                sx={{
                  mb: 2,
                }}
                value={formData.Customer_Name}
                onChange={handleChange("Customer_Name")}
                disabled={loading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  size="small"
                  label="Phone Number"
                  required
                  variant="outlined"
                  fullWidth
                  value={formData.Phone_Number}
                  onChange={handleChange("Phone_Number")}
                  disabled={loading}
                />
                <TextField
                  size="small"
                  label="Email"
                  variant="outlined"
                  type="email"
                  required
                  fullWidth
                  value={formData.Email}
                  onChange={handleChange("Email")}
                  disabled={loading}
                />

                {status !== "oxygen" && (
                  <>
                    <TextField
                      size="small"
                      select
                      label="Gender"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.Gender}
                      onChange={handleChange("Gender")}
                      disabled={loading}>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </TextField>
                    <TextField
                      size="small"
                      label={`${
                        status === "student" ? "Student ID" : "Customer ID"
                      }`}
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.Student_ID}
                      onChange={handleChange("Student_ID")}
                      disabled={loading}
                    />
                  </>
                )}

                {status === "student" && (
                  <>
                    <TextField
                      size="small"
                      label="Nationality"
                      variant="outlined"
                      fullWidth
                      value={formData.Nationality}
                      onChange={handleChange("Nationality")}
                      disabled={loading}
                    />

                    <TextField
                      size="small"
                      label="Program of Study"
                      variant="outlined"
                      fullWidth
                      value={formData.Program_Study}
                      onChange={handleChange("Program_Study")}
                      disabled={loading}
                    />
                    <TextField
                      size="small"
                      label="Year of Study"
                      variant="outlined"
                      fullWidth
                      value={formData.Year_Study}
                      onChange={handleChange("Year_Study")}
                      disabled={loading}
                    />
                  </>
                )}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Creating..." : `Create ${status === "student" ? capitalize(status) : "Customer"}`}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddCustomer;
