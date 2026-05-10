import React, { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import apiClient from "../../api/Client";
import Autocomplete from "@mui/material/Autocomplete";
import { capitalize } from "../../../helpers";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AssignPermission = ({ employee, loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  console.log(employee);

  const [Can_Access_Hostel, setHostelPermission] = useState(
    employee?.Can_Access_Hostel || "no",
  );
  const [Can_Access_Real_Estate, setRealEstatePermission] = useState(
    employee?.Can_Access_Real_Estate || "no",
  );
  const [Can_Access_Oxygen, setOxygenPermission] = useState(
    employee?.Can_Access_Oxygen || "no",
  );
  const [Can_Access_Farm, setFarmPermission] = useState(
    employee?.Can_Access_Farm || "no",
  );
  const [Can_Access_Production, setOxygenProductionPermission] = useState(
    employee?.Can_Access_Production || "no",
  );
  const [Can_Access_Sales, setOxygenSalesPermission] = useState(
    employee?.Can_Access_Sales || "no",
  );

  const [Contact_Person_Hostel, setHostelContactPerson] = useState(
    employee?.Contact_Person_Hostel || "no",
  );

  const [Contact_Person_Farm, setFarmContactPerson] = useState(
    employee?.Contact_Person_Farm || "no",
  );

  const [Contact_Person_Oxygen, setOxygenContactPerson] = useState(
    employee?.Contact_Person_Oxygen || "no",
  );

  const [Contact_Person_Real_Estate, setRealEstateContactPerson] = useState(
    employee?.Contact_Person_Real_Estate || "no",
  );

  const [loading, setLoading] = useState(false);

  // Handler for hostel permission checkbox
  const handleHostelChange = (event) => {
    setHostelPermission(event.target.checked ? "yes" : "no");
  };

  // Handler for real estate permission checkbox
  const handleRealEstateChange = (event) => {
    setRealEstatePermission(event.target.checked ? "yes" : "no");
  };

  // Handler for oxygen permission checkbox
  const handleOxygenChange = (event) => {
    setOxygenPermission(event.target.checked ? "yes" : "no");
  };

  // Handler for oxygen production permission checkbox
  const handleOxygenProductionChange = (event) => {
    setOxygenProductionPermission(event.target.checked ? "yes" : "no");
  };

  // Handler for oxygen sales permission checkbox
  const handleOxygenSalesChange = (event) => {
    setOxygenSalesPermission(event.target.checked ? "yes" : "no");
  };

  // Handler for farm permission checkbox
  const handleFarmChange = (event) => {
    setFarmPermission(event.target.checked ? "yes" : "no");
  };

  // Handler for hostel contact person permission checkbox
  const handleHostelContactChange = (event) => {
    setHostelContactPerson(event.target.checked ? "yes" : "no");
  };

  // Handler for oxygen contact person permission checkbox
  const handleOxygenContactChange = (event) => {
    setOxygenContactPerson(event.target.checked ? "yes" : "no");
  };

  // Handler for farm contact person permission checkbox
  const handleFarmContactChange = (event) => {
    setFarmContactPerson(event.target.checked ? "yes" : "no");
  };

  // Handler for real estate contact person permission checkbox
  const handleRealEstateContactChange = (event) => {
    setRealEstateContactPerson(event.target.checked ? "yes" : "no");
  };

  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send - include all permission fields
      const data = {
        Employee_ID: employee?.Employee_ID,
        Edited_By: employeeId,
        Can_Access_Hostel: Can_Access_Hostel,
        Can_Access_Real_Estate: Can_Access_Real_Estate,
        Can_Access_Oxygen: Can_Access_Oxygen,
        Can_Access_Farm: Can_Access_Farm,
        Can_Access_Sales: Can_Access_Sales,
        Can_Access_Production: Can_Access_Production,
        Contact_Person_Hostel: Contact_Person_Hostel,
        Contact_Person_Oxygen: Contact_Person_Oxygen,
        Contact_Person_Farm: Contact_Person_Farm,
        Contact_Person_Real_Estate: Contact_Person_Real_Estate,
      };

      // console.log("Submitting user data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post(`/permission`, data);

      // console.log("Response:", response);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to update user permission");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        const errorMessage = "Failed to update user permission";
        toast.error(errorMessage);
        return;
      }

      // Success
      setLoading(false);
      toast.success("User permission is assigned successfully");
      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("Update user error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="cursor-pointer text-blue-800 hover:underline hover:text-blue-600"
      >
        Permissions
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4 mb-2">
              Assign User Access Permission
            </h3>
            <div>
              <div>
                <div className="flex justify-center">
                  <div>
                    <div className="flex flex-row gap-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Can_Access_Hostel === "yes"}
                            onChange={handleHostelChange}
                          />
                        }
                        label="Hostels"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Can_Access_Farm === "yes"}
                            onChange={handleFarmChange}
                          />
                        }
                        label="Farms"
                      />
                    </div>

                    <div className="flex flex-row gap-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Can_Access_Real_Estate === "yes"}
                            onChange={handleRealEstateChange}
                          />
                        }
                        label="Real Estates"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Can_Access_Oxygen === "yes"}
                            onChange={handleOxygenChange}
                          />
                        }
                        label="Oxygen Plant"
                      />
                    </div>

                    <div className="flex flex-row gap-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Can_Access_Production === "yes"}
                            onChange={handleOxygenProductionChange}
                          />
                        }
                        label="Oxygen Production"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Can_Access_Sales === "yes"}
                            onChange={handleOxygenSalesChange}
                          />
                        }
                        label="Oxygen Sales"
                      />
                    </div>

                    <div className="flex flex-row gap-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Contact_Person_Hostel === "yes"}
                            onChange={handleHostelContactChange}
                          />
                        }
                        label="Hostel Contact Person"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Contact_Person_Real_Estate === "yes"}
                            onChange={handleRealEstateContactChange}
                          />
                        }
                        label="Real Estate Contact Person"
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Contact_Person_Oxygen === "yes"}
                            onChange={handleOxygenContactChange}
                          />
                        }
                        label="Oxygen Contact Person"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Contact_Person_Farm === "yes"}
                            onChange={handleFarmContactChange}
                          />
                        }
                        label="Farms Contact Person"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Assign Permission"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AssignPermission;
