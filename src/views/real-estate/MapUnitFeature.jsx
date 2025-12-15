import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
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
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const MapUnitFeature = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setQuantity("");
    setFeature("");
  };

  const dispatch = useDispatch();
  const { unitID } = useParams();

  const [quantity, setQuantity] = useState("");
  const [feature, setFeature] = useState("");

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  const sortedFeatures = features?.map((feature) => ({
    id: feature?.id,
    label: feature?.description,
    data: feature,
  }));

  const featureOnChange = (e, value) => {
    setFeature(value);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!feature) {
      toast.error("Please select feature");
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
        quantity,
        real_estate_id: unitID,
        real_estate_feature_id: feature?.id,
        Employee_ID: employeeId,
      };

      // Make API request
      const response = await apiClient.post(
        "/settings/real-estate-assigned-feature",
        data
      );

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to assign unit feature");
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to assign unit feature";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("Unit feature assigned successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("assign unit feature error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const loadFeatures = async () => {
    try {
      const response = await apiClient.get("/settings/real-estate-feature");

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const featuresData = response?.data?.data;
      const newData = featuresData?.map((feature, index) => ({
        ...feature,
        key: index + 1,
      }));
      setFeatures(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch features error:", error);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-60 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <TbSitemap className="my-3" />{" "}
        <p className="py-2">Assign Unit Feature</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Assign Unit Feature</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedFeatures}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={feature}
                  onChange={featureOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Unit Feature" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Quantity"
                  variant="outlined"
                  className="w-[92%]"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Assigning..." : "Assign Unit Feature"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default MapUnitFeature;
