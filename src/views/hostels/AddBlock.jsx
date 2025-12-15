import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdAdd } from "react-icons/md";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { useParams } from "react-router-dom";

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

const AddBlock = ({loadData}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
  };

  const {hostelID} = useParams();

  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [hostel, setHostel] = useState("");
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHostels = async () => {
    try {
      const response = await apiClient.get("/settings/hostel");

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      // Adjust based on your API response structure
      const hostelData = response?.data?.data;

      setHostels(Array.isArray(hostelData) ? hostelData : []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
    }
  };

  const sortedHostels = hostels?.map((hostel) => ({
    id: hostel?.Hostel_ID,
    label: hostel?.Hostel_Name,
  }));

  const hostelOnChange = (e, value) => {
    setHostel(value);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter block name");
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
        Block_Name: name.trim(),
        Hostel_ID: hostelID,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/settings/block", data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error(response.data?.error || "Failed to create block");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to create block";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("Block created successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Create block error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  useEffect(() => {
    loadHostels();
  }, []);

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <MdAdd className="my-3" /> <p className="py-2">Create New Block</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Block</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Block Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {/* <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedHostels}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={hostel}
                  onChange={hostelOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Hostel" />
                  )}
                />
              </div> */}
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Save Block"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddBlock;
