import React, { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdAdd } from "react-icons/md";
import apiClient from "../../api/Client";
import { Autocomplete } from "@mui/material";

const style = {
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddItem = ({ Item_Type, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setPrice(0);
  };

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [itemType, setItemType] = useState("");

  const sortedItemType = [
    {
      id: "oxygen",
      label: "Oxygen Plant",
    },
    {
      id: "student_accomodation",
      label: "Student Accomodation",
    },
    {
      id: "rent",
      label: "Rent",
    },
  ];

  const itemOnChange = (e, value) => {
    setItemType(value);
  };

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter item name");
      return;
    }
    if (Item_Type === "oxygen" && !price) {
      toast.error("Please enter item price");
      return;
    }

    if (!Item_Type && !itemType) {
      toast.error("Please select item type");
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
      // Prepare the data to send (match your API field names)
      const data = {
        Item_Name: name.trim(),
        Employee_ID: employeeId,
        Item_Type: Item_Type ? Item_Type : itemType,
        Item_Price: Item_Type === "oxygen" ? price : null,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/settings/item", data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error(response.data?.error || "Failed to create item");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);

        // Handle validation errors (nested error object)
        if (response.data?.error && typeof response.data.error === "object") {
          toast.error("Failed to create item");
        } else {
          // Handle simple error string
          const errorMessage = response.data.error || "Failed to create item";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Item created successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Create item error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <MdAdd className="my-3" /> <p className="py-2">Create New Item</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Item</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Item Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {!Item_Type && (
                <div className="w-full py-2 flex justify-center">
                  <Autocomplete
                    id="combo-box-demo"
                    options={sortedItemType}
                    size="small"
                    freeSolo
                    className="w-[92%]"
                    value={itemType}
                    onChange={itemOnChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Item Type" />
                    )}
                  />
                </div>
              )}
              {Item_Type === "oxygen" && (
                <div className="w-full py-2 flex justify-center">
                  <TextField
                    type="number"
                    label="Price (TZS)"
                    value={price}
                    onChange={(event) => {
                      const parsed = parseFloat(event.target.value, 10);
                      setPrice(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
                    }}
                    variant="outlined"
                    size="small"
                    className="w-[92%]"
                    disabled={loading}
                  />
                </div>
              )}
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Save Item"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddItem;
