import React, { useState } from "react";
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

const style = {
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 720,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddSemester = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setStartDateOne("");
    setEndDateOne("");
    setStartDateTwo("");
    setEndDateTwo("");
    setOpeningDate("");
    setAcademicYear("");
  };

  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [startDateOne, setStartDateOne] = useState("");
  const [endDateOne, setEndDateOne] = useState("");
  const [startDateTwo, setStartDateTwo] = useState("");
  const [endDateTwo, setEndDateTwo] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [loading, setLoading] = useState(false);

  const currentYear = moment().year();
  const lastYear = currentYear - 1;
  const nextYear = currentYear + 1;

  const sortedYear = [
    {
      id: `${lastYear}_${currentYear}`,
      label: `${lastYear}/${currentYear}`,
      startYear: `${lastYear}`,
      endYear: `${currentYear}`,
    },
    {
      id: `${currentYear}_${nextYear}`,
      label: `${currentYear}/${nextYear}`,
      startYear: `${currentYear}`,
      endYear: `${nextYear}`,
    },
  ];

  const sortedSemester = [
    {
      id: "1",
      label: "1",
    },
    {
      id: "2",
      label: "2",
    },
  ];

  const yearOnChange = (e, value) => {
    setAcademicYear(value?.id);
  };

  const semesterOnChange = (e, value) => {
    setName(value?.id);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!startDateOne) {
      toast.error("Please select semester one start date");
      return;
    }

    if (!endDateOne) {
      toast.error("Please select semester one end date");
      return;
    }

    if (!startDateTwo) {
      toast.error("Please select semester two start date");
      return;
    }

    if (!endDateTwo) {
      toast.error("Please select semester two end date");
      return;
    }

    if (!openingDate) {
      toast.error("Please select opening date");
      return;
    }

    if (!academicYear) {
      toast.error("Please select academic year");
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
        Semester_One_Start_Date: formatDateForDb(startDateOne),
        Semester_One_End_Date: formatDateForDb(endDateOne),
        Semester_Two_Start_Date: formatDateForDb(startDateTwo),
        Semester_Two_End_Date: formatDateForDb(endDateTwo),
        Semester_Opening_Date: formatDateTimeForDb(openingDate),
        Semester_Closing_Date: formatDateTimeForDb(endDateTwo),
        Academic_Year: academicYear,
        Employee_ID: employeeId,
      };

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/settings/semester-control", data);

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
            errorText = "Failed to add semester";
          }

          toast.error(errorText);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Semester is created successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Create semester error:", error);
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
        <p className="py-1.5">Create Academic Year</p>
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
              Add New Academic Year Setup
            </h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedYear}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={sortedYear.find(
                    (option) => option.id === academicYear,
                  )}
                  onChange={yearOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Academic Year" />
                  )}
                />
                <DatePick
                  label="Application Opening Window"
                  className="w-[45%]"
                  minDate={moment().subtract(1, "year").startOf("year")}
                  value={openingDate ? moment(openingDate) : null}
                  onChange={(newDate) => {
                    setOpeningDate(newDate);
                  }}
                />
              </div>

              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <DatePick
                  label="Semester One Start Date"
                  minDate={moment().subtract(1, "year").startOf("year")}
                  className="w-[45%]"
                  value={startDateOne ? moment(startDateOne) : null}
                  onChange={(newDate) => {
                    setStartDateOne(newDate);
                  }}
                />
                <DatePick
                  label="Semester One End Date"
                  className="w-[45%]"
                  minDate={moment().subtract(1, "year").startOf("year")}
                  value={endDateOne ? moment(endDateOne) : null}
                  onChange={(newDate) => {
                    setEndDateOne(newDate);
                  }}
                />
              </div>

              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <DatePick
                  label="Semester Two Start Date"
                  minDate={moment().subtract(1, "year").startOf("year")}
                  className="w-[45%]"
                  value={startDateTwo ? moment(startDateTwo) : null}
                  onChange={(newDate) => {
                    setStartDateTwo(newDate);
                  }}
                />
                <DatePick
                  label="Semester Two End Date"
                  className="w-[45%]"
                  minDate={moment().subtract(1, "year").startOf("year")}
                  value={endDateTwo ? moment(endDateTwo) : null}
                  onChange={(newDate) => {
                    setEndDateTwo(newDate);
                  }}
                />
              </div>
              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "SAVE ACADEMIC YEAR"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddSemester;
