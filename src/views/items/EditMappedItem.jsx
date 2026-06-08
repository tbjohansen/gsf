import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { useParams } from "react-router-dom";
import { formatter } from "../../../helpers";

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

const EditMappedItem = ({ mappedItem, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    // Set initial values that don't depend on API calls
    initializeBasicFields();
  };
  const handleClose = () => {
    setOpen(false);
    // Reset all state on close
    setNationality(null);
    setPrice("");
    setHostel(null);
    setRoomType(null);
    setBlock(null);
    setFloor(null);
    setSelectedRooms([]);
    setRooms([]);
    setInitialized(false);
    setRoomsLoaded(false);
  };

  const dispatch = useDispatch();
  const { itemID } = useParams();

  const [nationality, setNationality] = useState(null);
  const [price, setPrice] = useState("");
  const [hostel, setHostel] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [block, setBlock] = useState(null);
  const [floor, setFloor] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [roomsLoaded, setRoomsLoaded] = useState(false);

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
    setSelectedRooms([]);
    setRooms([]);
    setRoomsLoaded(false);
  };

  const sortedHostels = hostels?.map((hostel) => ({
    id: hostel?.Hostel_ID,
    label: hostel?.Hostel_Name,
    data: hostel,
  }));

  const hostelOnChange = (e, value) => {
    setHostel(value);
    setBlock(null);
    setFloor(null);
    setSelectedRooms([]);
    setRooms([]);
    setRoomsLoaded(false);
  };

  const sortedBlocks = blocks?.map((block) => ({
    id: block?.Block_ID,
    label: block?.Block_Name,
    data: block,
  }));

  const blockOnChange = (e, value) => {
    setBlock(value);
    setFloor(null);
    setSelectedRooms([]);
    setRooms([]);
    setRoomsLoaded(false);
  };

  const sortedFloors = floors?.map((floor) => ({
    id: floor?.Flow_ID,
    label: `${floor?.Flow_Name} - ${floor?.wing?.Wing_Name} - ${floor?.wing?.Wing_Gender}`,
    data: floor,
  }));

  const floorOnChange = (e, value) => {
    setFloor(value);
    setSelectedRooms([]);
    setRooms([]);
    setRoomsLoaded(false);
  };

  const sortedRooms = rooms?.map((room) => ({
    id: room?.Room_ID,
    label: room?.Room_Name,
    data: room,
  }));

  const handleChange = (event, newValue) => {
    const selectAllOption = newValue.find(
      (option) => option.id === "SELECT_ALL",
    );

    if (selectAllOption) {
      if (selectedRooms.length < sortedRooms.length) {
        setSelectedRooms(sortedRooms);
      } else {
        setSelectedRooms([]);
      }
    } else {
      setSelectedRooms(newValue);
    }
  };

  const allSelected =
    selectedRooms.length === sortedRooms.length && sortedRooms.length > 0;
  const selectAllOption = { id: "SELECT_ALL", label: "Select All" };

  // Set basic fields that don't depend on API data
  const initializeBasicFields = () => {
    if (mappedItem) {
      console.log("Setting basic fields from:", mappedItem);

      // Set price
      setPrice(mappedItem?.Price || "");

      // Set nationality
      const mappedNationality = sortedNationality.find(
        (n) => n.id === mappedItem?.Natinality,
      );
      setNationality(mappedNationality || null);

      // Set room type
      const mappedType = sortedRoomTypes.find(
        (option) => option.id === mappedItem?.Room_Type,
      );
      setRoomType(mappedType || null);

      // Set flag to trigger auto-fill for dependent fields after data loads
      setInitialized(true);
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

      // Auto-select hostel from mapped item's room data
      if (mappedItem?.room?.hostel && initialized) {
        const mappedHostel = newData?.find(
          (h) => h.Hostel_ID === mappedItem.room.hostel.Hostel_ID,
        );
        if (mappedHostel) {
          console.log("Auto-selecting hostel:", mappedHostel.Hostel_Name);
          setHostel({
            id: mappedHostel.Hostel_ID,
            label: mappedHostel.Hostel_Name,
            data: mappedHostel,
          });
        }
      }
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

      // Auto-select block from mapped item's room data
      if (mappedItem?.room?.block && initialized) {
        const mappedBlock = newData?.find(
          (b) => b.Block_ID === mappedItem.room.block.Block_ID,
        );
        if (mappedBlock) {
          console.log("Auto-selecting block:", mappedBlock.Block_Name);
          setBlock({
            id: mappedBlock.Block_ID,
            label: mappedBlock.Block_Name,
            data: mappedBlock,
          });
        }
      }
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

      // Auto-select floor from mapped item's room data
      if (mappedItem?.room?.flow && initialized) {
        const mappedFloor = newData?.find(
          (f) => f.Flow_ID === mappedItem.room.flow.Flow_ID,
        );
        if (mappedFloor) {
          console.log("Auto-selecting floor:", mappedFloor.Flow_Name);
          setFloor({
            id: mappedFloor.Flow_ID,
            label: `${mappedFloor.Flow_Name} - ${mappedFloor.wing?.Wing_Name} - ${mappedFloor.wing?.Wing_Gender}`,
            data: mappedFloor,
          });
        }
      }
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
        mapped_Room_Only: "1",
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
      setRoomsLoaded(true);

      // Auto-select room from mapped item
      if (mappedItem?.room && initialized && !selectedRooms.length) {
        const mappedRoom = newData?.find(
          (r) => r.Room_ID === mappedItem.room.Room_ID,
        );
        if (mappedRoom) {
          console.log("Auto-selecting room:", mappedRoom.Room_Name);
          setSelectedRooms([
            {
              id: mappedRoom.Room_ID,
              label: mappedRoom.Room_Name,
              data: mappedRoom,
            },
          ]);
        }
        setInitialized(false); // Reset flag after auto-fill is complete
      }
    } catch (error) {
      console.error("Fetch rooms error:", error);
    }
  };

  // Initial load when modal opens
  useEffect(() => {
    if (open && mappedItem) {
      loadHostels();
    }
  }, [open, mappedItem]);

  // Load blocks when hostel changes
  useEffect(() => {
    if (hostel && open) {
      loadBlocks();
    }
  }, [hostel, open]);

  // Load floors when block changes
  useEffect(() => {
    if (block && open) {
      loadFloors();
    }
  }, [block, open]);

  // Load rooms when floor and room type are both selected
  useEffect(() => {
    if (floor && roomType && open) {
      loadRooms();
    }
  }, [floor, roomType, open]);

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

    // if (!selectedRooms?.length > 0) {
    //   toast.error("Please select room(s)");
    //   return;
    // }

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
        // Room_ID: roomIds,
        Item_ID: mappedItem?.Item_ID || itemID,
        Room_Type: roomType?.id || mappedItem?.Room_Type,
        Employee_ID: employeeId,
        id: mappedItem?.id,
      };

      console.log("Updating item mapping data:", data);

      // Make API request
      const response = await apiClient.put("/settings/map-hostel-price", data);

      console.log("Response:", response);

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
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to update mapped room",
          );
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Room price mapping updated successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Update mapped room error:", error);
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
            <h3 className="text-center text-xl py-4">Edit Mapped Room Price</h3>
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
                  value={price ? formatter.format(Number(price)) : ""}
                  //   onChange={(e) => {
                  //     const rawValue = e.target.value.replace(/[^\d.]/g, "");
                  //     setPrice(rawValue);
                  //   }}
                  disabled={true}
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
                  //   onChange={hostelOnChange}
                  disabled={true}
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
                  //   onChange={blockOnChange}
                  disabled={true}
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
                  //   onChange={floorOnChange}
                  disabled={true}
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
                  //   onChange={handleChange}
                  disabled={true}
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
                  {loading ? "Updating..." : "Update Room Price"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditMappedItem;
