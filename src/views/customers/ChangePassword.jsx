import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { toast } from "react-hot-toast";
import apiClient from "../../api/Client";
import { MdLockOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { IconButton, InputAdornment } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ChangePassword = ({ customer }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      newPassword: "",
    });
    setShowPassword(false);
  };

  const [formData, setFormData] = useState({
    newPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    // if (!/[A-Z]/.test(password)) {
    //   return "Password must contain at least one uppercase letter";
    // }
    // if (!/[a-z]/.test(password)) {
    //   return "Password must contain at least one lowercase letter";
    // }
    // if (!/[0-9]/.test(password)) {
    //   return "Password must contain at least one number";
    // }
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //   return "Password must contain at least one special character";
    // }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.newPassword);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!customer) {
      toast.error("Please select user to update");
      return;
    }

    // Get employee info from localStorage
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (!storedEmployeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    console.log(customer);

    try {
      // Prepare the data to send
      const data = {
        Employee_ID: customer?.employee?.Employee_ID,
        password: formData.newPassword,
        email: customer?.Email,
        Modified_By: storedEmployeeId,
      };

      // Make API request
      const response = await apiClient.post("/change-password", data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage =
            response?.data?.error || response?.data?.message;

          let errorText;
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to change password";
          }

          toast.error(errorText);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Password changed successfully");

      // Close modal and reset form
      handleClose();
    } catch (error) {
      console.error("Change password error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="w-10 h-10 bg-white cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group"
      >
        <MdLockOutline className="w-6 h-6 text-gray-800 group-hover:text-blue-600 transition-colors" />
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Change Password
            </h3>
            <form onSubmit={submit} className="space-y-4">
              <TextField
                size="small"
                label="New Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={formData.newPassword}
                onChange={handleChange("newPassword")}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <MdVisibilityOff fontSize="small" />
                        ) : (
                          <MdVisibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  formData.newPassword.length > 0 &&
                  validatePassword(formData.newPassword)
                }
                error={
                  formData.newPassword.length > 0 &&
                  validatePassword(formData.newPassword) !== null
                }
              />

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 h-10 justify-center cursor-pointer rounded-md bg-gray-200 px-3 py-2 text-gray-700 shadow-xs hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ChangePassword;
