import React, { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { capitalize } from "../../../helpers";

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

const EditFarm = ({ farm, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const [name, setName] = useState(farm?.Item_Name);
  const [status, setStatus] = useState({
    id: farm?.Item_Status,
    label: capitalize(farm?.Item_Status),
  });
  const [size, setSize] = useState(farm?.Farm_Size);
  const [price, setPrice] = useState(farm?.Item_Price);

  const [loading, setLoading] = useState(false);

  const sortedStatus = [
    {
      id: "active",
      label: "Active",
    },
    {
      id: "inactive",
      label: "Inactive",
    },
  ];

  const statusOnChange = (e, value) => {
    setStatus(value);
  };

  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter farm name");
      return;
    }

    if (!size) {
      toast.error("Please enter total hectares");
      return;
    }

    if (!price || price < 0) {
      toast.error("Please enter valid price per 0.25 hectare");
      return;
    }

    if (!status) {
      toast.error("Please select status");
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
        Item_Name: name.trim(),
        Item_Type: "farm",
        Item_ID: farm?.Item_ID,
        Item_Price: price,
        Farm_Size: size,
        Item_Status: status?.id,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(`/settings/item`, data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to update farm details");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to update farm details";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("Farm details are updated successfully");
      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Update farm details error:", error);
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
            <h3 className="text-center text-xl py-4">Edit Farm Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Farm Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedStatus}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={status}
                  onChange={statusOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Status" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Hectares"
                  variant="outlined"
                  className="w-[92%]"
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Price Per 0.25 Hectare"
                  variant="outlined"
                  className="w-[92%]"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                  {loading ? "Updating..." : "Edit Farm"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditFarm;
