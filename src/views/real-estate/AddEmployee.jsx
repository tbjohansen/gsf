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
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddEmployee = ({ loadData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setGender("");
    setNationality("");
    setDob("");
    setEmployeeNumber("");
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const sortedGender = [
    { id: "male", label: "Male" },
    { id: "femal", label: "Female" },
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
        Customer_Name: name.trim(),
        Gender: gender?.id,
        Nationality: nationality?.id,
        Phone_Number: phone,
        Email: email,
        Student_ID: employeeNumber,
        Program_Study: "",
        Year_Study: "",
        Customer_Status: "active",
        Customer_Nature: "house_rent",
        Customer_Type: "",
        Admission_ID: "",
        Semester: "",
        Date_Birth: null,
        customer_origin: "inside",
        Employee_ID: employeeId,
      };

      // console.log("Submitting user data:", data);

      // Make API request - Bearer token is automatically included by apiClient
      const response = await apiClient.post("/customer/customer", data);

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
          toast.error("Failed to create employee");
        }
        return;
      }

      // Check if response contains an error (your API pattern)
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);

        // Handle validation errors (nested error object)
        if (response.data?.error && typeof response.data.error === "object") {
          // Extract first validation error message
          const firstErrorKey = Object.keys(response.data.error)[0];
          const firstErrorMessage = response.data.error[firstErrorKey][0];
          toast.error("Failed to create employee");
        } else {
          // Handle simple error string
          const errorMessage = "Failed to create employee";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Employee created successfully");

      // Close modal and reset form
      handleClose();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }

      // TODO: Dispatch action to update Redux store if needed
      // dispatch(addHostelToStore(response.data.data));
    } catch (error) {
      console.error("User item error:", error);
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
        <MdAdd className="my-3" /> <p className="py-2">New Employee</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Employee</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Employee Name"
                  variant="outlined"
                  className="w-[45%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Employee Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
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
                  value={sortedGender.find(
                    (option) => option.id === gender?.id
                  )}
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
                  value={sortedNationalities.find(
                    (option) => option.id === nationality?.id
                  )}
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
                  autoFocus
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
                    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                    if (value.length <= 10) {
                      setPhone(value);
                    }
                  }}
                  disabled={loading}
                  autoFocus
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

              <div className="w-full py-2 mt-5 flex justify-center">
                <button
                  onClick={(e) => submit(e)}
                  disabled={loading}
                  className="flex w-[92%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Save Employee"}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddEmployee;
