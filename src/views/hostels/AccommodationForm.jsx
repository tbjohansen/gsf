import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Grid,
  Divider,
  Box,
  Alert,
  Autocomplete,
} from "@mui/material";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Breadcrumb from "../../components/Breadcrumb";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../api/Client";
import { capitalize, formatter } from "../../../helpers";

const AccommodationForm = () => {
  const { studentID, requestID } = useParams();

  const [formData, setFormData] = useState({
    // Section A: Applicant Information
    fullName: "",
    gender: "",
    dateOfBirth: null,
    nationality: "",
    studentId: "",
    program: "",
    yearOfStudy: "",
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",

    // Section B: Accommodation Details
    applicantType: "",
    otherApplicantType: "",
    selectedHostel: "",
    roomType: "",
    checkInDate: null,
    duration: "",
    shortTermDuration: "",
    specialNeeds: false,
    specialNeedsDetails: "",

    // Section C: Payment Information
    paymentBank: "",
    paymentAccountName: "",
    paymentAccountNumber: "",
    paymentReference: "",
    paymentAmount: "",
    paymentDate: null,

    // Section D: Inventory (simplified for form)
    inventory: {
      mattress: { quantity: "", condition: "", handedOver: false, remarks: "" },
      bedFrame: { quantity: "", condition: "", handedOver: false, remarks: "" },
      chair: { quantity: "", condition: "", handedOver: false, remarks: "" },
      studyTable: {
        quantity: "",
        condition: "",
        handedOver: false,
        remarks: "",
      },
      wardrobe: { quantity: "", condition: "", handedOver: false, remarks: "" },
      roomKey: { quantity: "", condition: "", handedOver: false, remarks: "" },
      lightFixtures: {
        quantity: "",
        condition: "",
        handedOver: false,
        remarks: "",
      },
    },

    // Declaration
    agreed: false,
  });

  const [condition, setCondition] = useState("");
  const [studentData, setStudentData] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInventoryChange = (item, field, value) => {
    setFormData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [item]: {
          ...prev.inventory[item],
          [field]: value,
        },
      },
    }));
  };

  const sortedConditions = [
    {
      id: "new",
      label: "New",
    },
    {
      id: "used",
      label: "Used",
    },
  ];

  const sortedConditionsOne = [
    {
      id: "good",
      label: "Good",
    },
    {
      id: "fair",
      label: "Fair",
    },
  ];

  const sortedConditionsTwo = [
    {
      id: "functional",
      label: "Functional",
    },
  ];

  const conditionOnChange = (e, value) => {
    setCondition(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend

    try {
      let url = `/customer/admit-student-to-room?&Customer_Status=paid&Room_Status=paid&Request_Type=hostel&Request_ID=${requestID}`;

      const response = await apiClient.post(url);

      if (!response.ok) {
        // setLoading(false);
        toast.error(response.data?.error || "Failed to assign hostel room");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        // setLoading(false);
        toast.error(response.data.error || "Failed to assign hostel room");
        return;
      }

      toast.success("Room is assgned successfully");
      // setLoading(false);
    } catch (error) {
      console.error("Assign room error:", error);
      // setLoading(false);
      toast.error("Failed to assign hostel room");
    }
  };

  useEffect(() => {}, []);

  React.useEffect(() => {
    loadData();
  }, [studentID, requestID]);

  const loadData = async () => {
    // setLoading(true);
    try {
      let url = `/customer/customer-request?&Customer_Status=paid&Room_Status=paid&Request_Type=hostel&Request_ID=${requestID}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        // setLoading(false);
        toast.error(response.data?.error || "Failed to fetch students");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        // setLoading(false);
        toast.error(response.data.error || "Failed to fetch students");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data[0];

      // console.log(userData);
      setStudentData(userData);
      // setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      // setLoading(false);
      toast.error("Failed to fetch students");
    }
  };

  console.log(studentData);

  return (
    <>
      <Breadcrumb />
      <Container maxWidth="lg" className="py-8">
        <Paper elevation={3} className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography
              variant="h4"
              component="h2"
              className="font-bold text-gray-800 mb-2"
            >
              THE GOOD SAMARITAN FOUNDATION
            </Typography>
            <Typography variant="h5" component="h3" className="text-gray-600">
              ACCOMMODATION FORM
            </Typography>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Section A: Applicant Information */}

            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-xl font-semibold text-gray-800">
                  SECTION A: APPLICANT INFORMATION
                </p>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Student's Full Name
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Customer_Name}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Gender
                    </span>
                    <span className="text-gray-900">
                      {capitalize(studentData?.customer?.Gender)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Date of Birth
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Date_Birth}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Nationality
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Nationality}
                    </span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Student/Staff ID
                    </span>
                    <span className="text-gray-900 text-sm">
                      {studentData?.customer?.Student_ID ||
                        studentData?.customer?.Admission_ID}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Program of Study
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Program_Study}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Year of Study
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Year_Study}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Semester
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Semester}
                    </span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Phone_Number}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Email}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Emergency Contact Name & Relation
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Emergency_Contact_Name}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Emergency Contact Phone Number
                    </span>
                    <span className="text-gray-900">
                      {studentData?.customer?.Emergency_Contact_Phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: Accommodation Details */}
            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-xl font-semibold text-gray-800">
                  SECTION B: ACCOMMODATION DETAILS
                </p>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Applicant Type
                    </span>
                    <span className="text-gray-900">Undergraduate</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Selected Hostel Name
                    </span>
                    <span className="text-gray-900">
                      {studentData?.room?.hostel?.Hostel_Name}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Selected Block
                    </span>
                    <span className="text-gray-900">
                      {studentData?.room?.block?.Block_Name}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Selected Floor
                    </span>
                    <span className="text-gray-900">
                      {studentData?.room?.flow?.Flow_Name}
                    </span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Selected Room
                    </span>
                    <span className="text-gray-900 text-sm">
                      {studentData?.room?.Room_Name}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Room Type
                    </span>
                    <span className="text-gray-900">
                      {capitalize(studentData?.room?.Room_Type)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Check-in Date
                    </span>
                    <span className="text-gray-900">28-11-2025</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Duration of Stay
                    </span>
                    <span className="text-gray-900">{}</span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <FormControlLabel
                    componentsProps={{
                      typography: {
                        fontSize: "0.875rem",
                      },
                    }}
                    control={
                      <Checkbox
                        checked={formData.specialNeeds}
                        onChange={(e) =>
                          handleInputChange("specialNeeds", e.target.checked)
                        }
                      />
                    }
                    label="Do you have any special needs or health conditions related to accommodation?"
                  />
                  {formData.specialNeeds && (
                    <TextField
                      fullWidth
                      label="Please specify special needs or health conditions"
                      InputLabelProps={{
                        sx: { fontSize: "0.875rem" }, // text-sm
                      }}
                      value={formData.specialNeedsDetails}
                      onChange={(e) =>
                        handleInputChange("specialNeedsDetails", e.target.value)
                      }
                      className="mt-3"
                      multiline
                      rows={3}
                      required
                      size="small"
                      variant="outlined"
                      helperText="This information will help us provide appropriate accommodations"
                      FormHelperTextProps={{
                        sx: { fontSize: "0.75rem" },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section C: Payment Information */}
            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-xl font-semibold text-gray-800">
                  SECTION C: PAYMENT INFORMATION
                </p>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Bank Name
                    </span>
                    <span className="text-gray-900">
                      {studentData?.Sangira?.Payment_Direction}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Sangira Number
                    </span>
                    <span className="text-gray-900">
                      {studentData?.Sangira?.Sangira_Number}
                    </span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Amount Paid (TZS)
                    </span>
                    <span className="text-gray-900">
                      {formatter.format(
                        studentData?.Sangira?.Grand_Total_Price || 0
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Receipt Number
                    </span>
                    <span className="text-gray-900">
                      {studentData?.Sangira?.Receipt_Number}
                    </span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Payment Date
                    </span>
                    <span className="text-gray-900 text-sm">
                      {studentData?.Sangira?.Completed_Date}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      Requested Date
                    </span>
                    <span className="text-gray-900 text-sm">
                      {studentData?.Sangira?.Requested_Date}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D: Inventory Handover Record */}
            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-xl font-semibold text-gray-800">
                  SECTION D: INVENTORY HANDOVER RECORD
                </p>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Item Description
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Condition
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Handed Over
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(formData.inventory).map(([key, item]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TextField
                              size="small"
                              id="outlined-basic"
                              // label="Quantity"
                              variant="outlined"
                              className="w-24 px-3 py-2 text-sm"
                              // value={name}
                              // onChange={(e) => setName(e.target.value)}
                              // disabled={loading}
                              autoFocus
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Autocomplete
                              id="combo-box-demo"
                              options={
                                key === "mattress"
                                  ? sortedConditions
                                  : key === "bedFrame" ||
                                    key === "chair" ||
                                    key === "studyTable" ||
                                    key === "wardrobe"
                                  ? sortedConditionsOne
                                  : sortedConditionsTwo
                              }
                              size="small"
                              freeSolo
                              className="w-44 px-3 py-2 text-sm"
                              value={condition}
                              onChange={conditionOnChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  InputLabelProps={{
                                    sx: { fontSize: "0.80rem" }, // text-xs equivalent
                                  }}
                                  label="Select Condition"
                                />
                              )}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Checkbox />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TextField
                              size="small"
                              id="outlined-multiline-static"
                              label="Remarks"
                              multiline
                              rows={2}
                              InputLabelProps={{
                                sx: { fontSize: "0.80rem" }, // text-xs equivalent
                              }}
                              className="w-48 px-3 py-2 text-sm"
                              // value={name}
                              // onChange={(e) => setName(e.target.value)}
                              // disabled={loading}
                              autoFocus
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section E: Declaration */}
            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-xl font-semibold text-gray-800">
                  SECTION E: DECLARATION BY APPLICANT
                </p>
              </div>
              <FormControlLabel
                className="px-3"
                control={
                  <Checkbox
                    checked={formData.agreed}
                    onChange={(e) =>
                      handleInputChange("agreed", e.target.checked)
                    }
                    required
                  />
                }
                label="I undersigned declare that the information provided above is true and complete to the best of my knowledge. I accept to receive the listed items in the condition described and agree to take full responsibility for them during my stay. I understand that I will be required to return them in good condition upon vacating the accommodation."
              />
            </div>

            {/* Submit Button */}
            <Box className="text-center mt-8">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!formData.agreed}
                onChange={() => submitData()}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
              >
                Submit Applicant Accommodation Form
              </Button>
            </Box>

            {/* Important Notes */}
            <Alert severity="warning" className="mt-6">
              <Typography variant="body2" className="font-semibold">
                Important Notes:
              </Typography>
              <Typography variant="body2">
                • Check-in services available Monday to Friday, 08:00 AM – 04:00
                PM
                <br />
                • No services on Saturdays and Sundays
                <br />• Caution Money (Non Refundable): 30,000 TZS
              </Typography>
            </Alert>
          </form>
        </Paper>
      </Container>
    </>
  );
};

// Reusable Section Component
const Section = ({ title, children }) => (
  <div className="mb-8">
    <Typography
      variant="h6"
      component="h3"
      className="font-bold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500"
    >
      {title}
    </Typography>
    {children}
    <Divider className="my-6" />
  </div>
);

export default AccommodationForm;
