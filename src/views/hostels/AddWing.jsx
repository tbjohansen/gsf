import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
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

const sortedGenders = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "both", label: "Both" },
];

const AddWing = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const { blockID } = useParams();

  // Synchronous double-click guard
  const submitLockRef = useRef(false);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (loading) return; // don't close mid-request
    setOpen(false);
    setName("");
    setGender(null);
  };

  const genderOnChange = (e, value) => {
    setGender(value);
  };

  const submit = async (e) => {
    e.preventDefault();

    // Synchronous double-click guard
    if (submitLockRef.current) return;

    // Validation
    if (!name || name.trim() === "") {
      toast.error("Please enter wing name");
      return;
    }

    if (!gender?.id) {
      toast.error("Please select gender");
      return;
    }

    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    submitLockRef.current = true;
    setLoading(true);

    try {
      const data = {
        Wing_Name: name.trim(),
        Wing_Gender: gender.id,
        Block_ID: blockID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.post("/settings/wing", data);

      if (!response.ok) {
        // 429 after global retries exhausted
        if (response.status === 429) {
          toast.error(
            "Too many requests. Please wait a moment and try again.",
          );
          return;
        }

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
              : "Failed to create wing",
          );
        }
        return;
      }

      toast.success("Wing created successfully");

      // Reset form and close modal
      setOpen(false);
      setName("");
      setGender(null);

      // Refresh parent
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Create wing error:", error);

      if (error.is429) {
        toast.error(
          error.userMessage || "Too many requests. Please try again.",
        );
        return;
      }

      toast.error("An unexpected error occurred. Please try again");
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <MdAdd className="my-3" /> <p className="py-2">Create New Wing</p>
      </div>

      <Modal
        open={open}
        onClose={loading ? undefined : handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Wing</h3>

            <form onSubmit={submit}>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  label="Wing Name"
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
                  id="gender-autocomplete"
                  options={sortedGenders}
                  size="small"
                  className="w-[92%]"
                  value={gender}
                  onChange={genderOnChange}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Gender" />
                  )}
                  disabled={loading}
                />
              </div>

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Save Wing"}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddWing;