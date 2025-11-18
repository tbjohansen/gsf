import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { TbSitemap } from "react-icons/tb";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { useParams } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const MapItem = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNationality("");
    setPrice("");
    setHostel("");
    setRoomType("");
    setBlock("");
    setFloor("");
    setSelectedRooms([]);
    setRooms([]);
  };

  const dispatch = useDispatch();
  const { itemID } = useParams();

  const [nationality, setNationality] = useState("");
  const [price, setPrice] = useState("");
  const [hostel, setHostel] = useState("");
  const [roomType, setRoomType] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const sortedNationality = [
    {
      id: "local",
      label: "Local",
    },
    {
      id: "foreigner",
      label: "Foreigner",
    },
    {
      id: "both",
      label: "Both",
    },
  ];

  const nationalityOnChange = (e, value) => {
    setNationality(value);
  };

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

  const sortedHostels = hostels?.map((hostel) => ({
    id: hostel?.Hostel_ID,
    label: hostel?.Hostel_Name,
    data: hostel,
  }));

  const hostelOnChange = (e, value) => {
    setHostel(value);
    setBlock("");
    setFloor("");
    setRoomType("");
    setSelectedRooms([]);
    setRooms([]);
  };

  const sortedBlocks = blocks?.map((block) => ({
    id: block?.Block_ID,
    label: block?.Block_Name,
    data: block,
  }));

  const blockOnChange = (e, value) => {
    setBlock(value);
    setFloor("");
    setRoomType("");
    setSelectedRooms([]);
    setRooms([]);
  };

  const sortedFloors = floors?.map((floor) => ({
    id: floor?.Flow_ID,
    label: floor?.Flow_Name,
    data: floor,
  }));

  const floorOnChange = (e, value) => {
    setFloor(value);
    setRoomType("");
    setSelectedRooms([]);
    setRooms([]);
  };

  const sortedRooms = rooms?.map((room) => ({
    id: room?.Room_ID,
    label: room?.Room_Name,
    data: room,
  }));

  const handleChange = (event, newValue) => {
    console.log("New value from Autocomplete:", newValue);

    // Check if "Select All" was clicked
    const selectAllOption = newValue.find(
      (option) => option.id === "SELECT_ALL"
    );

    if (selectAllOption) {
      // If "Select All" is being selected and not all are currently selected
      if (selectedRooms.length < sortedRooms.length) {
        // Select all rooms
        setSelectedRooms(sortedRooms);
      } else {
        // Deselect all
        setSelectedRooms([]);
      }
    } else {
      // For individual selections, use the newValue directly
      // Autocomplete already handles the toggling logic
      setSelectedRooms(newValue);
    }
  };

  const allSelected =
    selectedRooms.length === sortedRooms.length && sortedRooms.length > 0;
  const selectAllOption = { id: "SELECT_ALL", label: "Select All" };

  const submit = async (e) => {
    e.preventDefault();

    if (!price || price < 0) {
      toast.error("Please enter valid room price");
      return;
    }

    if (!nationality) {
      toast.error("Please select nationality");
      return;
    }

    if (!selectedRooms?.length > 0) {
      toast.error("Please select room(s)");
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
      // Convert selectedRooms into array of IDs
      const roomIds = selectedRooms?.map((room) => room.id);

      // Prepare the data to send
      const data = {
        Natinality: nationality?.id,
        Price: price,
        Room_ID: roomIds,
        Item_ID: itemID,
        Room_Type: roomType?.id,
        Employee_ID: employeeId,
      };

      console.log("Submitting item mapping data:", data);

      // Make API request
      const response = await apiClient.post("/settings/map-hostel-price", data);

      console.log("Response:", response);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to map room price");
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to map room price";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("Room price mapped successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Map room error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const loadHostels = async () => {
    try {
      const response = await apiClient.get("/settings/hostel");

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const hostelData = response?.data?.data;
      const newData = hostelData?.map((hostel, index) => ({
        ...hostel,
        key: index + 1,
      }));
      setHostels(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
    }
  };

  const loadBlocks = async () => {
    if (!hostel?.id) return;

    try {
      const response = await apiClient.get("/settings/block", {
        Hostel_ID: hostel?.id,
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const blockData = response?.data?.data;
      const newData = blockData?.map((block, index) => ({
        ...block,
        key: index + 1,
      }));
      setBlocks(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch blocks error:", error);
    }
  };

  const loadFloors = async () => {
    if (!block?.id) return;

    try {
      const response = await apiClient.get("/settings/flow", {
        Block_ID: block?.id,
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const floorData = response?.data?.data;
      const newData = floorData?.map((floor, index) => ({
        ...floor,
        key: index + 1,
      }));
      setFloors(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch floors error:", error);
    }
  };

  const loadRooms = async () => {
    if (!floor?.id || !roomType?.id) return;

    try {
      const response = await apiClient.get("/settings/room", {
        Flow_ID: floor?.id,
        Room_Type: roomType?.id,
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const roomData = response?.data?.data;
      const newData = roomData?.map((room, index) => ({
        ...room,
        key: index + 1,
      }));
      setRooms(Array.isArray(newData) ? newData : []);
      setSelectedRooms([]); // Reset selections when rooms change
    } catch (error) {
      console.error("Fetch rooms error:", error);
    }
  };

  useEffect(() => {
    loadHostels();
  }, []);

  useEffect(() => {
    if (hostel) {
      loadBlocks();
    }
  }, [hostel]);

  useEffect(() => {
    if (block) {
      loadFloors();
    }
  }, [block]);

  useEffect(() => {
    if (floor && roomType) {
      loadRooms();
    }
  }, [floor, roomType]);

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <TbSitemap className="my-3" /> <p className="py-2">Map Room Price</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">
              Map Item With Room Price
            </h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedNationality}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={nationality}
                  onChange={nationalityOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Student Nationality" />
                  )}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Room Price"
                  variant="outlined"
                  className="w-[45%]"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedHostels}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={hostel}
                  onChange={hostelOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Hostel" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedBlocks}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={block}
                  onChange={blockOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Block" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedFloors}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={floor}
                  onChange={floorOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Floor" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedRoomTypes}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={roomType}
                  onChange={roomTypeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Room Type" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  multiple
                  id="rooms-autocomplete"
                  options={
                    sortedRooms.length > 0
                      ? [selectAllOption, ...sortedRooms]
                      : []
                  }
                  disableCloseOnSelect
                  size="small"
                  className="w-[92%]"
                  value={selectedRooms}
                  onChange={handleChange}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderOption={(props, option, { selected }) => {
                    const isSelectAll = option.id === "SELECT_ALL";
                    const isSelected = isSelectAll
                      ? allSelected
                      : selectedRooms.some((room) => room.id === option.id);

                    return (
                      <li
                        {...props}
                        key={isSelectAll ? "select-all" : option.id}
                      >
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={isSelected}
                        />
                        <span
                          className={
                            isSelectAll ? "font-semibold text-blue-600" : ""
                          }
                        >
                          {option.label}
                        </span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Room(s)"
                      placeholder={
                        selectedRooms.length === 0 ? "Choose rooms..." : ""
                      }
                    />
                  )}
                />
              </div>
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Mapping..." : "Map Room Price"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default MapItem;
