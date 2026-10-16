import React, { useEffect, useState, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
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

const sortedStatus = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

const EditFlow = ({ floor, loadData }) => {
  const [open, setOpen] = useState(false);

  // ── Separate loading flags: wings dropdown fetch vs submit PUT ──
  const [wingsLoading, setWingsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { hostelID, blockID } = useParams();

  // Synchronous double-click guard
  const submitLockRef = useRef(false);

  // ─────────────────────────────────────────────────────────────
  // Form state
  // ─────────────────────────────────────────────────────────────
  const [name, setName] = useState(floor?.Flow_Name ?? "");
  const [status, setStatus] = useState(
    floor?.Flow_Status
      ? { id: floor.Flow_Status, label: capitalize(floor.Flow_Status) }
      : null,
  );
  const [wing, setWing] = useState(floor?.Wing_ID ?? null);
  const [wings, setWings] = useState([]);

  // Sync form state from `floor` whenever the modal opens.
  // Fixes the "stale form" bug when the parent refreshes the row data.
  useEffect(() => {
    if (open && floor) {
      setName(floor.Flow_Name ?? "");
      setStatus(
        floor.Flow_Status
          ? { id: floor.Flow_Status, label: capitalize(floor.Flow_Status) }
          : null,
      );
      setWing(floor.Wing_ID ?? null);
    }
  }, [open, floor]);

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
        const newData = blockData?.map((b, index) => ({
          ...b,
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

  // ─────────────────────────────────────────────────────────────
  // Fetch wings ONLY when the modal is open.
  //
  // This component is mounted once per table row (via the `columns`
  // array in Floors.jsx). Without the `if (!open) return;` guard,
  // every mounted row fires its own GET /settings/wing on page load,
  // producing N duplicate requests for a table with N rows — a
  // classic 429 trigger.
  //
  // With the guard, only the row whose Edit button was clicked
  // fetches wings.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    loadWings(controller.signal);
    return () => controller.abort();
  }, [open, loadWings]);

  const sortedWings = wings?.map((w) => ({
    id: w?.Wing_ID,
    label: `${w?.Wing_Name} - ${w?.Wing_Gender}`,
  }));

  const wingOnChange = (e, value) => {
    setWing(value?.id ?? null);
  };

  const statusOnChange = (e, value) => {
    setStatus(value);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (submitLoading) return; // don't close mid-request
    setOpen(false);
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

    if (!status?.id) {
      toast.error("Please select status");
      return;
    }

    if (!wing) {
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
        Flow_ID: floor?.Flow_ID,
        Flow_Status: status.id,
        Wing_ID: wing,
        Block_ID: blockID,
        Hostel_ID: hostelID,
        Employee_ID: employeeId,
      };

      const response = await apiClient.put(`/settings/flow`, data);

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
              : "Failed to update floor",
          );
        }
        return;
      }

      toast.success("Block floor updated successfully");

      setOpen(false);

      // Refresh parent
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Update floor error:", error);

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
      <button
        onClick={handleOpen}
        className="w-10 h-10 bg-white cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group"
      >
        <MdEdit className="w-6 h-6 text-gray-800 group-hover:text-blue-600 transition-colors" />
      </button>

      <Modal
        open={open}
        onClose={submitLoading ? undefined : handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Block Floor</h3>

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
                  value={
                    sortedWings?.find((option) => option.id === wing) ?? null
                  }
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
                          : !wingsLoading &&
                              wings.length === 0 &&
                              open
                            ? "No wings available for this block"
                            : ""
                      }
                    />
                  )}
                  disabled={submitLoading || wingsLoading}
                  loading={wingsLoading}
                />
              </div>

              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="status-autocomplete"
                  options={sortedStatus}
                  size="small"
                  className="w-[92%]"
                  value={status}
                  onChange={statusOnChange}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Status" />
                  )}
                  disabled={submitLoading}
                />
              </div>

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  type="submit"
                  disabled={submitLoading || wingsLoading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? "Updating..." : "Edit Floor"}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditFlow;