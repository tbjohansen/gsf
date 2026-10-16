import React, { useEffect, useState, useRef, useCallback } from "react";
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

const AddFloor = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [wing, setWing] = useState(null);
  const [wings, setWings] = useState([]);

  // Separate loading flags — one for the wings dropdown fetch,
  // one for the submit POST. Mixing them causes bugs.
  const [wingsLoading, setWingsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { hostelID, blockID } = useParams();

  // Synchronous double-click guard
  const submitLockRef = useRef(false);

  // ─────────────────────────────────────────────────────────────
  // Load wings for the current block
  // ─────────────────────────────────────────────────────────────
  const loadWings = useCallback(
    async (signal) => {
      if (!blockID) return;

      setWingsLoading(true);
      try {
        const response = await apiClient.get(
          `/settings/wing`,
          { Block_ID: blockID },
          { signal },
        );

        if (response.problem === "CANCEL_ERROR") return;

        if (!response.ok) {
          setWingsLoading(false);
          const serverMessage =
            response?.data?.error || response?.data?.message;
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to fetch wings",
          );
          return;
        }

        if (response.data?.error || response.data?.code >= 400) {
          setWingsLoading(false);
          const serverMessage =
            typeof response.data?.error === "string"
              ? response.data.error
              : response.data?.message || "Failed to fetch wings";
          toast.error(serverMessage);
          return;
        }

        const blockData = response?.data?.data;
        const newData = blockData?.map((block, index) => ({
          ...block,
          key: index + 1,
        }));
        setWings(Array.isArray(newData) ? newData : []);
        setWingsLoading(false);
      } catch (error) {
        if (
          error.isAborted ||
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }
        if (error.is429) {
          setWingsLoading(false);
          toast.error(
            error.userMessage || "Too many requests. Please slow down.",
          );
          return;
        }
        console.error("Fetch wings error:", error);
        setWingsLoading(false);
        toast.error("Failed to load wings");
      }
    },
    [blockID],
  );

  // Fetch wings on mount and whenever blockID changes.
  // AbortController cancels the previous request cleanly.
  useEffect(() => {
    const controller = new AbortController();
    loadWings(controller.signal);
    return () => controller.abort();
  }, [loadWings]);

  // ─────────────────────────────────────────────────────────────
  // Options / change handlers
  // ─────────────────────────────────────────────────────────────
  const sortedWings = wings?.map((w) => ({
    id: w?.Wing_ID,
    label: `${w?.Wing_Name} - ${w?.Wing_Gender}`,
  }));

  const wingOnChange = (e, value) => {
    setWing(value);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (submitLoading) return; // don't close mid-request
    setOpen(false);
    setName("");
    setWing(null);
  };

  // ─────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();

    // Synchronous double-click guard
    if (submitLockRef.current) return;

    // Validation
    if (!name || name.trim() === "") {
      toast.error("Please enter floor name");
      return;
    }

    if (!wing?.id) {
      toast.error("Please select a wing");
      return;
    }

    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    submitLockRef.current = true;
    setSubmitLoading(true);

    try {
      const data = {
        Flow_Name: name.trim(),
        Hostel_ID: hostelID,
        Block_ID: blockID,
        Wing_ID: wing.id,
        Employee_ID: employeeId,
      };

      const response = await apiClient.post("/settings/flow", data);

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
              : "Failed to create floor",
          );
        }
        return;
      }

      toast.success("Floor created successfully");

      // Reset form and close modal
      setOpen(false);
      setName("");
      setWing(null);

      // Refresh parent
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Create floor error:", error);

      if (error.is429) {
        toast.error(
          error.userMessage || "Too many requests. Please try again.",
        );
        return;
      }

      toast.error("An unexpected error occurred. Please try again");
    } finally {
      submitLockRef.current = false;
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <MdAdd className="my-3" /> <p className="py-2">Create New Floor</p>
      </div>

      <Modal
        open={open}
        onClose={submitLoading ? undefined : handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Floor</h3>

            <form onSubmit={submit}>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  label="Floor Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitLoading}
                  autoFocus
                />
              </div>

              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="wing-autocomplete"
                  options={sortedWings}
                  size="small"
                  className="w-[92%]"
                  value={wing}
                  onChange={wingOnChange}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Wing"
                      helperText={
                        wingsLoading
                          ? "Loading wings..."
                          : wings.length === 0 && !wingsLoading
                            ? "No wings available for this block"
                            : ""
                      }
                    />
                  )}
                  disabled={submitLoading || wingsLoading}
                  loading={wingsLoading}
                />
              </div>

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  type="submit"
                  disabled={submitLoading || wingsLoading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? "Creating..." : "Save Floor"}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddFloor;