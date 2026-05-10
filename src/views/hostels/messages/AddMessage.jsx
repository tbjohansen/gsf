import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdAdd } from "react-icons/md";
import apiClient from "../../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { useParams } from "react-router-dom";
import { formatDateForDb, formatDateTimeForDb } from "../../../../helpers";
import DatePick from "../../../components/DatePicker";
import moment from "moment";
import TextareaWithLimit from "../../../components/TextAreaWithLimit";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 720,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddMessage = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setMessage("");
    setHostel("");
    setBlock("");
    setGender("");
  };

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [Hostel_ID, setHostel] = useState("");
  const [Block_ID, setBlock] = useState("");
  const [Gender, setGender] = useState("");

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(false);
  const hasFetchedData = useRef(false);

  const sortedHostels = hostels?.map((hostel) => ({
    id: hostel?.Hostel_ID,
    label: hostel?.Hostel_Name,
  }));

  const sortedGender = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
  ];

  const sortedBlocks = blocks?.map((block) => ({
    id: block?.Block_ID,
    label: block?.Block_Name,
  }));

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadHostels();
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [Hostel_ID]);

  const loadHostels = async () => {
    try {
      const response = await apiClient.get("/settings/hostel");

      // Check if request was successful
      if (!response.ok) {
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
              : "Failed to fetch hostel",
          );
        }
        return;
      }

      // Adjust based on your API response structure
      const hostelData = response?.data?.data;
      const newData = hostelData?.map((hostel, index) => ({
        ...hostel,
        key: index + 1,
      }));
      // console.log(newData);
      setHostels(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      toast.error("Failed to load hostels");
    }
  };

  const loadBlocks = async () => {
    if (!Hostel_ID) return;

    try {
      const response = await apiClient.get("/settings/block", {
        Hostel_ID: Hostel_ID,
      });

      // Check if request was successful
      if (!response.ok) {
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
              : "Failed to fetch hostel block",
          );
        }
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

  const hostelOnChange = (e, value) => {
    setHostel(value?.id);
  };

  const blockOnChange = (e, value) => {
    setBlock(value?.id);
  };

  const genderOnChange = (e, value) => {
    setGender(value?.id);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!message) {
      toast.error("Please enter the announcement");
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
        Request_Type: "hostel",
        message: message,
        Hostel_ID: Hostel_ID,
        Block_ID: Block_ID,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post(
        "/settings/send-announcement",
        data,
      );

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

          console.log(response);
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to send announcement";
          }

          toast.error(errorText);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Announcement is sent successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Send announcement error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-9 w-56 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white mr-2"
      >
        <MdAdd className="my-2.5" />{" "}
        <p className="py-1.5">Create Announcement</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-2">Add New Announcement</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedHostels}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={sortedHostels.find(
                    (option) => option.id === Hostel_ID,
                  )}
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
                  value={sortedBlocks.find((option) => option.id === Block_ID)}
                  onChange={blockOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Block" />
                  )}
                />
              </div>

              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedGender}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={sortedGender.find((option) => option.id === Gender)}
                  onChange={genderOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Gender" />
                  )}
                />
              </div>

              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <div className="w-[92%]">
                  <TextareaWithLimit
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your announcement"
                    limit={1000}
                  />
                </div>
              </div>
              <div className="w-full py-2 mt-2 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "SEND ANNOUNCEMENT"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddMessage;
