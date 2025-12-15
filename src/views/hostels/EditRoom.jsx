import React, { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdAdd, MdEdit } from "react-icons/md";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { capitalize } from "lodash";
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

const EditRoom = ({ room, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const { hostelID, blockID, floorID } = useParams();
  const dispatch = useDispatch();

  const [name, setName] = useState(room?.Room_Name);
  const [status, setStatus] = useState({
    id: room?.Room_Status,
    label: capitalize(room?.Room_Status),
  });
  const [beds, setBeds] = useState(room?.No_Bed);
  const [roomType, setRoomType] = useState({
    id: room?.Room_Type,
    label: capitalize(room?.Room_Type),
  });
  const [loading, setLoading] = useState(false);

  const sortedRoomTypes = [
    {
      id: "single",
      label: "Single",
    },
    {
      id: "shared",
      label: "Shared",
    },
  ];

  const roomTypeOnChange = (e, value) => {
    setRoomType(value);
  };

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

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter room name");
      return;
    }

    if (!status) {
      toast.error("Please select status");
      return;
    }

    if (!beds || beds < 1) {
      toast.error("Please enter valid number of beds");
      return;
    }

    if (!roomType) {
      toast.error("Please select room type");
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
        Room_Name: name.trim(),
        Room_ID: room?.Room_ID,
        Room_Status: status?.id,
        Room_Type: roomType?.id,
        No_Bed: beds,
        Flow_ID: floorID,
        Block_ID: blockID,
        Hostel_ID: hostelID,
        Employee_ID: employeeId,
      };

      console.log("Submitting block floor room data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(`/settings/room`, data);

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
          toast.error("Failed to update room");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to update room";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("Room updated successfully");

      // Close modal and reset form
      handleClose();

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Update room error:", error);
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
            <h3 className="text-center text-xl py-4">Edit Floor Room</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Room Name"
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
                  options={sortedRoomTypes}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={roomType}
                  onChange={roomTypeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Room Type" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Number Of Beds"
                  variant="outlined"
                  className="w-[92%]"
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
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
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Edit Room"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditRoom;
