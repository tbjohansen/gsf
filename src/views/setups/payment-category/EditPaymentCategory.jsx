import React, { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import apiClient from "../../../api/Client";

const style = {
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const EditPaymentCategory = ({ category, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const [name, setName] = useState(category?.Category_Name);
  const [quantity, setQuantity] = useState(category?.Category_Quantity);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter category name");
      return;
    }

    if (!quantity || quantity < 1) {
      toast.error("Please enter valid category quantity");
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
        Category_Name: name.trim(),
        Category_Quantity: quantity,
        Category_ID: category?.Category_ID,
        Employee_ID: employeeId,
      };

      console.log("Submitting payment category data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(`/settings/payment-category`, data);

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
          toast.error(
            response.data?.error || "Failed to update payment category"
          );
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to update payment category";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("Payment category updated successfully");
      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Update payment category error:", error);
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
        <MdEdit className="w-6 h-6 text-gray-800 group-hover:text-blue-600 transition-colors" />
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Payment Category</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Category Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Category Quantity"
                  variant="outlined"
                  type="number"
                  className="w-[92%]"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Edit Payment category"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditPaymentCategory;
