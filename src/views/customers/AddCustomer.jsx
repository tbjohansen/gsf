import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { toast } from "react-hot-toast";
import apiClient from "../../api/Client";
import { MdAdd } from "react-icons/md";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { capitalize } from "lodash";
import { Autocomplete } from "@mui/material";
import { validPhoneNumber } from "../../../helpers";

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

const AddCustomer = ({ loadData, status }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      Customer_Name: "",
      Gender: "",
      Nationality: "",
      Phone_Number: "",
      Email: "",
      Student_ID: "",
      Program_Study: "",
      Year_Study: "",
      Customer_Status: "active",
      Customer_Nature: status || "student",
      customer_origin: "",
      Customer_Type: "",
      Admission_ID: "",
      Semester: "",
      Date_Birth: null,
    });
  };
  const [formData, setFormData] = useState({
    Customer_Name: "",
    Gender: "",
    Nationality: "",
    Phone_Number: "",
    Email: "",
    Student_ID: "",
    Program_Study: "",
    Year_Study: "",
    Customer_Status: "active",
    Customer_Nature: status || "student",
    customer_origin: "",
    Customer_Type: "",
    Admission_ID: "",
    Semester: "",
    Date_Birth: null,
  });

  const sortedPrograms = [
    {
      id: "Diploma in Medical Laboratory Sciences",
      label: "Diploma in Medical Laboratory Sciences",
    },
    {
      id: "BSc in Prosthetics and Orthotics",
      label: "BSc in Prosthetics and Orthotics",
    },
    { id: "BSc in Physiotherapy", label: "BSc in Physiotherapy" },
    { id: "BSc in Occupational Therapy", label: "BSc in Occupational Therapy" },
    { id: "BSc in Nursing", label: "BSc in Nursing" },
    {
      id: "BSc in Health Laboratory Sciences",
      label: "BSc in Health Laboratory Sciences",
    },
    { id: "Doctor of Medicine", label: "Doctor of Medicine" },
    {
      id: "Master of Public Health (MPH)",
      label: "Master of Public Health (MPH)",
    },
    {
      id: "MSc in Monitoring and Evaluation",
      label: "MSc in Monitoring and Evaluation",
    },
    { id: "MSc in Clinical Research", label: "MSc in Clinical Research" },
    {
      id: "MSc in Medical Microbiology, Immunology with Molecular Biology",
      label: "MSc in Medical Microbiology, Immunology with Molecular Biology",
    },
    {
      id: "MSc in Epidemiology & Applied Biostatistics",
      label: "MSc in Epidemiology & Applied Biostatistics",
    },
    { id: "MMed in Anaesthesia", label: "MMed in Anaesthesia" },
    { id: "MMed in Emergency Medicine", label: "MMed in Emergency Medicine" },
    { id: "MMed in Anatomic Pathology", label: "MMed in Anatomic Pathology" },
    { id: "MMed in Urology", label: "MMed in Urology" },
    {
      id: "MMed in Obstetrics and Gynaecology",
      label: "MMed in Obstetrics and Gynaecology",
    },
    { id: "MMed in Ophthalmology", label: "MMed in Ophthalmology" },
    {
      id: "MMed in Radiology & Medical Imaging",
      label: "MMed in Radiology & Medical Imaging",
    },
    { id: "MMed in Dermatology", label: "MMed in Dermatology" },
    { id: "MMed in Internal Medicine", label: "MMed in Internal Medicine" },
    {
      id: "MMed in Otorynolaryngology (ENT)",
      label: "MMed in Otorynolaryngology (ENT)",
    },
    { id: "MMed General Surgery", label: "MMed General Surgery" },
    { id: "PhD in Bio-medical Sciences", label: "PhD in Bio-medical Sciences" },
    { id: "PhD in Clinical Medicine", label: "PhD in Clinical Medicine" },
    {
      id: "PhD in Public Health and Health Systems",
      label: "PhD in Public Health and Health Systems",
    },
  ];

  const sortedYear = [
    { id: 1, label: 1 },
    { id: 2, label: 2 },
    { id: 3, label: 3 },
    { id: 4, label: 4 },
    { id: 5, label: 5 },
  ];

  const sortedGender = [
    { id: "male", label: "Male" },
    { id: "femal", label: "Female" },
  ];

  const sortedOrigin = [
    { id: "inside", label: "Inside" },
    { id: "outside", label: "Outside" },
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

  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e, newValue) => {
    // For Autocomplete components

    if (newValue !== undefined) {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue?.id,
      }));
      return;
    }

    // For regular TextField components
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    console.log("yess");

    if (!formData.Customer_Name || formData.Customer_Name.trim() === "") {
      toast.error("Please enter customer name");
      return;
    }

    if (!formData.Phone_Number || formData.Phone_Number.trim() === "") {
      toast.error("Please enter phone number");
      return;
    }

    if (!formData.Email || formData.Email.trim() === "") {
      toast.error("Please enter email");
      return;
    }

    if (
      (status === "student" && !formData.Student_ID) ||
      formData.Admission_ID
    ) {
      toast.error("Please enter student ID or Admission ID");
      return;
    }

    if (!validPhoneNumber(formData?.Phone_Number)) {
      toast.error("Please enter a valid phone number");
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
        ...formData,
        Customer_Name: formData.Customer_Name.trim(),
        Customer_Type:
          status === "student"
            ? formData?.Nationality === "Tanzanian"
              ? "local"
              : "foreigner"
            : "",
        Phone_Number: formData.Phone_Number.startsWith("0")
          ? formData.Phone_Number
          : `0${formData.Phone_Number}`,
        Employee_ID: employeeId,
      };

      // Make API request
      const response = await apiClient.post("/customer/customer", data);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          toast.error("Failed to create customer");
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        if (response.data?.error && typeof response.data.error === "object") {
          toast.error("Failed to create customer");
        } else {
          const errorMessage = "Failed to create customer";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Customer created successfully");

      // Reset form
      setFormData({
        Customer_Name: "",
        Gender: "",
        Nationality: "",
        Phone_Number: "",
        Email: "",
        Student_ID: "",
        Program_Study: "",
        Year_Study: "",
        Customer_Status: "active",
        Customer_Nature: status || "student",
        Customer_Type: "",
        customer_origin: "",
        Admission_ID: "",
        Semester: "",
        Date_Birth: null,
      });

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Create customer error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        Phone_Number: value,
      }));
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-60 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <MdAdd className="my-3" />{" "}
        <p className="py-2">
          Create New {status === "student" ? status : "Customer"}
        </p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Add {status === "student" ? status : "Customer"}
            </h3>
            <form onSubmit={submit} className="space-y-4">
              <TextField
                size="small"
                label={`${
                  status === "student" ? "Student Name" : "Customer Name"
                }`}
                variant="outlined"
                fullWidth
                className="w-full"
                sx={{
                  mb: 2,
                }}
                value={formData.Customer_Name}
                onChange={handleChange("Customer_Name")}
                disabled={loading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  size="small"
                  label="Phone Number"
                  variant="outlined"
                  type="tel"
                  fullWidth
                  value={formData?.Phone_Number}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  error={
                    formData?.Phone_Number?.length > 0 &&
                    !validPhoneNumber(formData?.Phone_Number)
                  }
                  helperText={
                    formData?.Phone_Number?.length > 0 &&
                    !validPhoneNumber(formData?.Phone_Number)
                      ? formData?.Phone_Number?.length !== 10
                        ? "Phone number must be 10 digits"
                        : "Phone number must start with 06, or 07"
                      : ""
                  }
                  inputProps={{
                    maxLength: 10,
                    pattern: "0[567][0-9]{8}",
                  }}
                />
                <TextField
                  size="small"
                  label="Email"
                  variant="outlined"
                  type="email"
                  fullWidth
                  value={formData.Email}
                  onChange={handleChange("Email")}
                  disabled={loading}
                />

                {status !== "oxygen" && (
                  <>
                    <Autocomplete
                      id="combo-box-demo"
                      options={sortedGender}
                      size="small"
                      freeSolo
                      fullWidth
                      value={sortedGender.find(
                        (option) => option.id === formData?.Gender
                      )}
                      onChange={handleChange("Gender")}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Gender" />
                      )}
                    />

                    <TextField
                      size="small"
                      label={`${
                        status === "student" ? "Student ID" : "Customer ID"
                      }`}
                      variant="outlined"
                      fullWidth
                      value={formData.Student_ID}
                      onChange={handleChange("Student_ID")}
                      disabled={loading}
                    />
                  </>
                )}

                {status === "oxygen" && (
                  <Autocomplete
                    id="combo-box-demo"
                    options={sortedOrigin}
                    size="small"
                    freeSolo
                    fullWidth
                    value={sortedOrigin.find(
                      (option) => option.id === formData?.customer_origin
                    )}
                    onChange={handleChange("customer_origin")}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Customer Origin" />
                    )}
                  />
                )}

                {status === "student" && (
                  <>
                    <Autocomplete
                      id="combo-box-demo"
                      options={sortedNationalities}
                      size="small"
                      freeSolo
                      fullWidth
                      value={sortedNationalities.find(
                        (option) => option.id === formData?.Nationality
                      )}
                      onChange={handleChange("Nationality")}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Nationality" />
                      )}
                    />

                    <Autocomplete
                      id="combo-box-demo"
                      options={sortedPrograms}
                      size="small"
                      freeSolo
                      fullWidth
                      value={sortedPrograms.find(
                        (option) => option.id === formData?.Program_Study
                      )}
                      onChange={handleChange("Program_Study")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Program of Study"
                        />
                      )}
                    />
                    <Autocomplete
                      id="combo-box-demo"
                      options={sortedYear}
                      size="small"
                      freeSolo
                      fullWidth
                      value={sortedYear.find(
                        (option) => option.id === formData?.Year_Study
                      )}
                      onChange={handleChange("Year_Study")}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Year of Study" />
                      )}
                    />

                    <TextField
                      size="small"
                      label="Admission ID"
                      variant="outlined"
                      fullWidth
                      value={formData?.Admission_ID}
                      onChange={handleChange("Admission_ID")}
                      disabled={loading}
                    />
                  </>
                )}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Creating..."
                    : `Create ${
                        status === "student" ? capitalize(status) : "Customer"
                      }`}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddCustomer;
