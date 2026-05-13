import React, { useState, useEffect, useCallback } from "react";
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
  const { hostelID, blockID, floorID } = useParams();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [beds, setBeds] = useState("");
  const [roomType, setRoomType] = useState("");
  const [floor, setFloor] = useState("");
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to reset form to original room data
  const resetFormToRoomData = useCallback(() => {
    if (room) {
      setFloor(room?.Flow_ID);
      setRoomType({
        id: room?.Room_Type,
        label: capitalize(room?.Room_Type),
      });
      setStatus({
        id: room?.Room_Status,
        label: capitalize(room?.Room_Status),
      });
      setBeds(room?.No_Bed);
      setName(room?.Room_Name);
    }
  }, [room]);

  // Function to clear form (set to empty/default values)
  const clearForm = () => {
    setName("");
    setStatus("");
    setBeds("");
    setRoomType("");
    setFloor("");
  };

  const handleOpen = () => {
    // Reset form to original room data when opening
    resetFormToRoomData();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Optional: Clear form after closing to free up memory
    // clearForm();
  };

  const loadFloors = async () => {
    try {
      const response = await apiClient.get(`/settings/flow`, {
        Block_ID: blockID,
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const floorsData = response?.data?.data;
      const newData = floorsData?.map((floor, index) => ({
        ...floor,
        key: index + 1,
      }));
      setFloors(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch floors error:", error);
    }
  };

  useEffect(() => {
    loadFloors();
  }, [blockID]);


  useEffect(() => {
    resetFormToRoomData();
  }, [room, resetFormToRoomData]);

  const sortedFloors = floors?.map((floor) => ({
    id: floor?.Flow_ID,
    label: `${floor?.Flow_Name} - ${floor?.wing?.Wing_Name} - ${floor?.wing?.Wing_Gender}`,
  }));

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

  const floorOnChange = (e, value) => {
    setFloor(value?.id);
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

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        Room_Name: name.trim(),
        Room_ID: room?.Room_ID,
        Room_Status: status?.id,
        Room_Type: roomType?.id,
        No_Bed: beds,
        Flow_ID: floor,
        Block_ID: blockID,
        Hostel_ID: hostelID,
        Employee_ID: employeeId,
      };

      console.log("Submitting block floor room data:", data);

      const response = await apiClient.put(`/settings/room`, data);

      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage = response?.data?.error || response?.data?.message;
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to update room",
          );
        }
        return;
      }

      setLoading(false);
      toast.success("Room updated successfully");

      handleClose();

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
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedFloors}
                  size="small"
                  freeSolo
                  disableClearable
                  className="w-[92%]"
                  value={sortedFloors?.find((option) => option.id === floor)}
                  onChange={floorOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Floor" />
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