import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { capitalize, formatter } from "../../../helpers";

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

const EditUnit = ({ unit, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    // Reset form with current unit data when opening
    resetForm();
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Form state
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null);
  const [unitType, setUnitType] = useState(null);
  const [price, setPrice] = useState("");
  const [usdPrice, setUsdPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const hasFetchedData = useRef(false);

  // Reset form function
  const resetForm = () => {
    setName(unit?.name || "");
    setStatus({
      id: unit?.status,
      label: capitalize(unit?.status || ""),
    });
    setUnitType({
      id: unit?.real_estate_type,
      label: capitalize(unit?.real_estate_type || ""),
    });
    setPrice(unit?.price?.toString() || "");
    setUsdPrice(unit?.usd_price?.toString() || "");
    setDescription(unit?.description || "");
    setLocation({
      id: unit?.Unit_Location_ID,
      label: capitalize(unit?.location?.Unit_Location || ""),
    });
  };

  useEffect(() => {
    if (open) {
      loadLocations();
    }
  }, [open]);

  // Reset USD price when unit type changes from house
  useEffect(() => {
    if (unitType?.id !== "house") {
      setUsdPrice("");
    }
  }, [unitType]);

  const loadLocations = async () => {
    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");
    const data = {
      Employee_ID: employeeId,
    };

    try {
      const response = await apiClient.get("/settings/unit-location", data);

      // Adjust based on your API response structure
      const featuresData = response?.data?.data;
      const newData = featuresData?.map((feature, index) => ({
        ...feature,
        key: index + 1,
      }));
      // console.log(newData);
      setLocations(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch locations error:", error);
    }
  };

  const sortedTypes = [
    {
      id: "house",
      label: "House",
    },
    {
      id: "business land",
      label: "Business ",
    },
  ];

  const typesOnChange = (e, value) => {
    setUnitType(value);
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

  const sortedLocations = locations?.map((location) => ({
    id: location?.Unit_Location_ID,
    label: location?.Unit_Location,
  }));

  const locationOnChange = (e, value) => {
    setLocation(value);
  };

  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter unit name");
      return;
    }

    if (!price || price < 0) {
      toast.error("Please enter valid price");
      return;
    }

    if (!unitType) {
      toast.error("Please select unit type");
      return;
    }

    if (!status) {
      toast.error("Please select status");
      return;
    }

    if (!location) {
      toast.error("Please select unit location");
      return;
    }

    if (unitType?.id === "house" && !usdPrice) {
      toast.error("Please enter usd price");
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
        name: name.trim(),
        real_estate_type: unitType?.id,
        status: status?.id,
        price,
        description,
        Unit_Location_ID: location?.id,
        Employee_ID: employeeId,
        ...(unitType?.id === "house" && { usd_price: usdPrice }),
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.put(
        `/settings/real-estate/${unit?.id}`,
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
            errorText = "Failed to edit unit";
          }

          toast.error(errorText);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Unit updated successfully");
      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Update unit error:", error);
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
            <h3 className="text-center text-xl py-4">Edit Unit Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedTypes}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={unitType}
                  onChange={typesOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Unit Type" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Unit Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div
                className={
                  unitType?.id === "house"
                    ? "w-full py-2 flex justify-center flex-row gap-2"
                    : "w-full py-2 flex justify-center"
                }
              >
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Unit Price (TZS)"
                  variant="outlined"
                  className={unitType?.id === "house" ? "w-[45%]" : "w-[92%]"}
                  value={price ? formatter.format(Number(price)) : ""}
                  onChange={(e) => {
                    // Remove any non-digit characters except decimal point
                    const rawValue = e.target.value.replace(/[^\d.]/g, "");
                    setPrice(rawValue);
                  }}
                  disabled={loading}
                  autoFocus
                />
                {unitType?.id === "house" && (
                  <TextField
                    size="small"
                    id="outlined-basic"
                    label="Unit Price (USD)"
                    variant="outlined"
                    className={"w-[45%]"}
                    value={usdPrice ? formatter.format(Number(usdPrice)) : ""}
                    onChange={(e) => {
                      // Remove any non-digit characters except decimal point
                      const rawValue = e.target.value.replace(/[^\d.]/g, "");
                      setUsdPrice(rawValue);
                    }}
                    disabled={loading}
                    autoFocus
                  />
                )}
              </div>

              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedLocations}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={location}
                  onChange={locationOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Unit Location" />
                  )}
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
                <TextField
                  size="small"
                  id="outlined-multiline-static"
                  multiline
                  rows={2}
                  variant="outlined"
                  label="Description"
                  className="w-[92%]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Edit Unit"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditUnit;
