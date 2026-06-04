import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import apiClient from "../../api/Client";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const EditEmployee = ({ status, loadData, employee }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Don't reset form data here as it will reset from employee prop on next open
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [Customer_Nature, setCustomerNature] = useState("");
  const [dob, setDob] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // Populate form when employee data changes or modal opens
  useEffect(() => {
    if (employee && open) {
      setName(employee?.Customer_Name || "");
      setEmail(employee?.Email || "");
      setPhone(employee?.Phone_Number || "");
      setGender(employee?.Gender || "");
      setNationality(employee?.Nationality || "");
      setCustomerNature(employee?.Customer_Nature || "");
      setDob(employee?.Date_Birth || "");
      setEmployeeNumber(employee?.Student_ID || "");
    }
  }, [employee, open]);

  const sortedGender = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
  ];

  const sortedNatures = [
    { id: "farm", label: "Farm" },
    { id: "house_rent", label: "Real Estate" },
  ];

  const sortedNationalities = [
    { id: "Tanzanian", label: "Tanzanian" },
    { id: "Afghan", label: "Afghan" },
    { id: "Albanian", label: "Albanian" },
    { id: "Algerian", label: "Algerian" },
    { id: "American", label: "American" },
    { id: "Andorran", label: "Andorran" },
    { id: "Angolan", label: "Angolan" },
    { id: "Argentine", label: "Argentine" },
    { id: "Armenian", label: "Armenian" },
    { id: "Australian", label: "Australian" },
    { id: "Austrian", label: "Austrian" },
    { id: "Azerbaijani", label: "Azerbaijani" },
    { id: "Bahamian", label: "Bahamian" },
    { id: "Bahraini", label: "Bahraini" },
    { id: "Bangladeshi", label: "Bangladeshi" },
    { id: "Barbadian", label: "Barbadian" },
    { id: "Belarusian", label: "Belarusian" },
    { id: "Belgian", label: "Belgian" },
    { id: "Belizean", label: "Belizean" },
    { id: "Beninese", label: "Beninese" },
    { id: "Bhutanese", label: "Bhutanese" },
    { id: "Bolivian", label: "Bolivian" },
    { id: "Bosnian", label: "Bosnian" },
    { id: "Botswanan", label: "Botswanan" },
    { id: "Brazilian", label: "Brazilian" },
    { id: "British", label: "British" },
    { id: "Bruneian", label: "Bruneian" },
    { id: "Bulgarian", label: "Bulgarian" },
    { id: "Burkinabe", label: "Burkinabe" },
    { id: "Burundian", label: "Burundian" },
    { id: "Cambodian", label: "Cambodian" },
    { id: "Cameroonian", label: "Cameroonian" },
    { id: "Canadian", label: "Canadian" },
    { id: "Cape Verdean", label: "Cape Verdean" },
    { id: "Chadian", label: "Chadian" },
    { id: "Chilean", label: "Chilean" },
    { id: "Chinese", label: "Chinese" },
    { id: "Colombian", label: "Colombian" },
    { id: "Comorian", label: "Comorian" },
    { id: "Congolese", label: "Congolese" },
    { id: "Costa Rican", label: "Costa Rican" },
    { id: "Croatian", label: "Croatian" },
    { id: "Cuban", label: "Cuban" },
    { id: "Cypriot", label: "Cypriot" },
    { id: "Czech", label: "Czech" },
    { id: "Danish", label: "Danish" },
    { id: "Djiboutian", label: "Djiboutian" },
    { id: "Dominican", label: "Dominican" },
    { id: "Ecuadorian", label: "Ecuadorian" },
    { id: "Egyptian", label: "Egyptian" },
    { id: "Emirati", label: "Emirati" },
    { id: "English", label: "English" },
    { id: "Equatorial Guinean", label: "Equatorial Guinean" },
    { id: "Eritrean", label: "Eritrean" },
    { id: "Estonian", label: "Estonian" },
    { id: "Eswatini", label: "Eswatini" },
    { id: "Ethiopian", label: "Ethiopian" },
    { id: "Fijian", label: "Fijian" },
    { id: "Finnish", label: "Finnish" },
    { id: "French", label: "French" },
    { id: "Gabonese", label: "Gabonese" },
    { id: "Gambian", label: "Gambian" },
    { id: "Georgian", label: "Georgian" },
    { id: "German", label: "German" },
    { id: "Ghanaian", label: "Ghanaian" },
    { id: "Greek", label: "Greek" },
    { id: "Grenadian", label: "Grenadian" },
    { id: "Guatemalan", label: "Guatemalan" },
    { id: "Guinean", label: "Guinean" },
    { id: "Guyanese", label: "Guyanese" },
    { id: "Haitian", label: "Haitian" },
    { id: "Honduran", label: "Honduran" },
    { id: "Hungarian", label: "Hungarian" },
    { id: "Icelandic", label: "Icelandic" },
    { id: "Indian", label: "Indian" },
    { id: "Indonesian", label: "Indonesian" },
    { id: "Iranian", label: "Iranian" },
    { id: "Iraqi", label: "Iraqi" },
    { id: "Irish", label: "Irish" },
    { id: "Israeli", label: "Israeli" },
    { id: "Italian", label: "Italian" },
    { id: "Jamaican", label: "Jamaican" },
    { id: "Japanese", label: "Japanese" },
    { id: "Jordanian", label: "Jordanian" },
    { id: "Kazakh", label: "Kazakh" },
    { id: "Kenyan", label: "Kenyan" },
    { id: "Kuwaiti", label: "Kuwaiti" },
    { id: "Kyrgyz", label: "Kyrgyz" },
    { id: "Lao", label: "Lao" },
    { id: "Latvian", label: "Latvian" },
    { id: "Lebanese", label: "Lebanese" },
    { id: "Liberian", label: "Liberian" },
    { id: "Libyan", label: "Libyan" },
    { id: "Lithuanian", label: "Lithuanian" },
    { id: "Luxembourgish", label: "Luxembourgish" },
    { id: "Malagasy", label: "Malagasy" },
    { id: "Malawian", label: "Malawian" },
    { id: "Malaysian", label: "Malaysian" },
    { id: "Maldivian", label: "Maldivian" },
    { id: "Malian", label: "Malian" },
    { id: "Maltese", label: "Maltese" },
    { id: "Mauritanian", label: "Mauritanian" },
    { id: "Mauritian", label: "Mauritian" },
    { id: "Mexican", label: "Mexican" },
    { id: "Moldovan", label: "Moldovan" },
    { id: "Mongolian", label: "Mongolian" },
    { id: "Moroccan", label: "Moroccan" },
    { id: "Mozambican", label: "Mozambican" },
    { id: "Myanmar", label: "Myanmar" },
    { id: "Namibian", label: "Namibian" },
    { id: "Nepalese", label: "Nepalese" },
    { id: "Dutch", label: "Dutch" },
    { id: "New Zealander", label: "New Zealander" },
    { id: "Nicaraguan", label: "Nicaraguan" },
    { id: "Nigerien", label: "Nigerien" },
    { id: "Nigerian", label: "Nigerian" },
    { id: "Norwegian", label: "Norwegian" },
    { id: "Omani", label: "Omani" },
    { id: "Pakistani", label: "Pakistani" },
    { id: "Palestinian", label: "Palestinian" },
    { id: "Panamanian", label: "Panamanian" },
    { id: "Papua New Guinean", label: "Papua New Guinean" },
    { id: "Paraguayan", label: "Paraguayan" },
    { id: "Peruvian", label: "Peruvian" },
    { id: "Philippine", label: "Philippine" },
    { id: "Polish", label: "Polish" },
    { id: "Portuguese", label: "Portuguese" },
    { id: "Qatari", label: "Qatari" },
    { id: "Romanian", label: "Romanian" },
    { id: "Russian", label: "Russian" },
    { id: "Rwandan", label: "Rwandan" },
    { id: "Saudi", label: "Saudi" },
    { id: "Scottish", label: "Scottish" },
    { id: "Senegalese", label: "Senegalese" },
    { id: "Serbian", label: "Serbian" },
    { id: "Seychellois", label: "Seychellois" },
    { id: "Sierra Leonean", label: "Sierra Leonean" },
    { id: "Singaporean", label: "Singaporean" },
    { id: "Slovak", label: "Slovak" },
    { id: "Slovenian", label: "Slovenian" },
    { id: "Somali", label: "Somali" },
    { id: "South African", label: "South African" },
    { id: "South Korean", label: "South Korean" },
    { id: "Spanish", label: "Spanish" },
    { id: "Sri Lankan", label: "Sri Lankan" },
    { id: "Sudanese", label: "Sudanese" },
    { id: "Swedish", label: "Swedish" },
    { id: "Swiss", label: "Swiss" },
    { id: "Syrian", label: "Syrian" },
    { id: "Taiwanese", label: "Taiwanese" },
    { id: "Tajik", label: "Tajik" },
    { id: "Thai", label: "Thai" },
    { id: "Togolese", label: "Togolese" },
    { id: "Tongan", label: "Tongan" },
    { id: "Trinidadian", label: "Trinidadian" },
    { id: "Tunisian", label: "Tunisian" },
    { id: "Turkish", label: "Turkish" },
    { id: "Turkmen", label: "Turkmen" },
    { id: "Ugandan", label: "Ugandan" },
    { id: "Ukrainian", label: "Ukrainian" },
    { id: "Uruguayan", label: "Uruguayan" },
    { id: "Uzbek", label: "Uzbek" },
    { id: "Venezuelan", label: "Venezuelan" },
    { id: "Vietnamese", label: "Vietnamese" },
    { id: "Welsh", label: "Welsh" },
    { id: "Yemeni", label: "Yemeni" },
    { id: "Zambian", label: "Zambian" },
    { id: "Zimbabwean", label: "Zimbabwean" },
  ];

  const handleNationChange = (e, newValue) => {
    setNationality(newValue);
  };

  const handleNatureChange = (e, newValue) => {
    setCustomerNature(newValue);
  };

  const handleGenderChange = (e, newValue) => {
    setGender(newValue);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === "") {
      toast.error("Please enter employee name");
      return;
    }

    if (!email || email.trim() === "") {
      toast.error("Please enter employee email");
      return;
    }

    if (!phone || phone.trim() === "") {
      toast.error("Please enter phone number");
      return;
    }

    if (status == "farm" && !Customer_Nature) {
      toast.error("Please select employee nature");
      return;
    }

    // Validate phone number format
    if (
      phone.length !== 10 ||
      !["05", "06", "07"].includes(phone.slice(0, 2))
    ) {
      toast.error(
        "Please enter a valid phone number (10 digits starting with 05, 06, or 07)",
      );
      return;
    }

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!employee?.Customer_ID) {
      toast.error("Employee record not found. Please refresh and try again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data to send (match your API field names)
      const data = {
        Customer_Name: name.trim(),
        Gender: gender?.id,
        Nationality: nationality?.id,
        Phone_Number: phone,
        Email: email,
        Student_ID: employeeNumber,
        Program_Study: "",
        Year_Study: "",
        Customer_Status: "active",
        Customer_Nature: status ? Customer_Nature?.id : "house_rent",
        Customer_Type: nationality?.id === "Tanzanian" ? "local" : "foreigner",
        Admission_ID: "",
        Semester: "",
        Date_Birth: null,
        customer_origin: "inside",
        Employee_ID: employeeId,
        Customer_ID: employee.Customer_ID, // Include the ID for update
      };

      // Make API request - using PUT for update
      const response = await apiClient.put("/customer/customer", data);

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
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to update employee";
          }

          toast.error(errorText);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Employee updated successfully");

      // Close modal
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Update employee error:", error);
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
        <MdEdit className="w-6 h-6 text-gray-800 group-hover:text-oceanic transition-colors" />
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Employee</h3>
            <div>
              <div className="w-full py-2 flex flex-row justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Employee Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedGender}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={
                    sortedGender.find((option) => option.id === gender) || null
                  }
                  onChange={handleGenderChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Gender" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedNationalities}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={
                    sortedNationalities.find(
                      (option) => option.id === nationality,
                    ) || null
                  }
                  onChange={handleNationChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Nationality" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Email"
                  variant="outlined"
                  type="email"
                  className="w-[45%]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Phone Number"
                  variant="outlined"
                  type="tel"
                  className="w-[45%]"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setPhone(value);
                    }
                  }}
                  disabled={loading}
                  error={
                    phone.length > 0 &&
                    (phone.length !== 10 ||
                      !["05", "06", "07"].includes(phone.slice(0, 2)))
                  }
                  helperText={
                    phone.length > 0 && phone.length !== 10
                      ? "Phone number must be 10 digits"
                      : phone.length === 10 &&
                          !["05", "06", "07"].includes(phone.slice(0, 2))
                        ? "Phone number must start with 06, or 07"
                        : ""
                  }
                  inputProps={{
                    maxLength: 10,
                    pattern: "0[567][0-9]{8}",
                  }}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Employee ID Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  disabled={loading}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedNatures}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={
                    sortedNatures.find(
                      (option) => option.id === Customer_Nature,
                    ) || null
                  }
                  onChange={handleNatureChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Employee Nature" />
                  )}
                />
              </div>

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Employee"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditEmployee;
