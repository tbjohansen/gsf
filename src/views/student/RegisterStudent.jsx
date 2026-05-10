import React, { useState } from "react";
import { toast } from "react-hot-toast";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import { LuUser, LuArrowLeft, LuUsers } from "react-icons/lu";
import apiClient from "../../api/Client";
import { Autocomplete } from "@mui/material";
import DatePick from "../../components/DatePicker";
import moment from "moment";
import { formatDateForDb } from "../../../helpers";

const RegisterStudent = ({ onBack }) => {
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
    Customer_Nature: "student",
    customer_origin: "",
    Customer_Type: "",
    Admission_ID: "",
    Semester: "",
    Date_Birth: null,
    Emergency_Contact_Name: "",
    Next_Kin_Relationship: "",
    Emergency_Contact_Phone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    {
      id: "Others",
      label: "Others",
    },
  ];

  const sortedYear = [
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "3", label: "3" },
    { id: "4", label: "4" },
    { id: "5", label: "5" },
  ];

  const sortedGender = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
  ];

  const sortedRelationships = [
    { id: "Father", label: "Father" },
    { id: "Mother", label: "Mother" },
    { id: "Brother", label: "Brother" },
    { id: "Sister", label: "Sister" },
    { id: "Guardian", label: "Guardian" },
    { id: "Spouse", label: "Spouse" },
    { id: "Uncle", label: "Uncle" },
    { id: "Aunt", label: "Aunt" },
    { id: "Grandparent", label: "Grandparent" },
    { id: "Other", label: "Other" },
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.Student_ID?.trim()) {
      newErrors.Student_ID = "Student / Admission ID is required";
    }
    if (!formData.Customer_Name?.trim()) {
      newErrors.Customer_Name = "Full name is required";
    }
    if (!formData.Email?.trim()) {
      newErrors.Email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Email is invalid";
    }
    if (!formData.Phone_Number?.trim()) {
      newErrors.Phone_Number = "Phone number is required";
    }
    if (!formData.Program_Study?.trim()) {
      newErrors.Program_Study = "Program of study is required";
    }
    if (!formData.Year_Study?.trim()) {
      newErrors.Year_Study = "Year of study is required";
    }
    if (!formData.Nationality?.trim()) {
      newErrors.Nationality = "Nationality is required";
    }

    console.log(formData?.Nationality);
    if (!formData.Date_Birth) {
      newErrors.Date_Birth = "Date of birth is required";
    }

    // Next of kin validation
    if (!formData.Emergency_Contact_Name?.trim()) {
      newErrors.Emergency_Contact_Name = "Next of kin name is required";
    }
    if (!formData.Next_Kin_Relationship?.trim()) {
      newErrors.Next_Kin_Relationship = "Relationship is required";
    }
    if (!formData.Emergency_Contact_Phone?.trim()) {
      newErrors.Emergency_Contact_Phone =
        "Next of kin phone number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.Emergency_Contact_Phone)) {
      newErrors.Emergency_Contact_Phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // ← no 'e' parameter
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    console.log("Validation passed, submitting...");
    setSubmitting(true);

    try {
      // Prepare the data to send
      const data = {
        ...formData,
        Customer_Name: formData?.Customer_Name.trim(),
        Customer_Type:
          formData?.Nationality === "Tanzanian" ? "local" : "foreigner",
        customer_origin: formData?.customer_origin
          ? formData?.customer_origin
          : "inside",
        Phone_Number: formData?.Phone_Number?.startsWith("0")
          ? formData.Phone_Number
          : `0${formData.Phone_Number}`,
        Emergency_Contact_Phone: formData?.Emergency_Contact_Phone?.startsWith(
          "0",
        )
          ? formData.Emergency_Contact_Phone
          : `0${formData.Emergency_Contact_Phone}`,
        Date_Birth: formatDateForDb(formData?.Date_Birth),
        Employee_ID: "1",
      };

      console.log("Sending data to API:", data);

      // Make API request
      const response = await apiClient.post("/register-customer", data);

      console.log("API Response:", response);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          // ✅ Use the server's error message if available
          const serverMessage = response.data?.error || response.data?.message;
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to register student",
          );
        }
        return;
      }

      // Success
      console.log("Success! Response data:", response.data);
      setSubmitting(false);
      toast.success("Student is registered successfully");

      // Reset form
      setFormData({
        Customer_Name: "",
        Gender: null,
        Nationality: null,
        Phone_Number: "",
        Email: "",
        Student_ID: "",
        Program_Study: null,
        Year_Study: null,
        Customer_Status: "active",
        Customer_Nature: "student",
        Customer_Type: "",
        customer_origin: "",
        Admission_ID: "",
        Semester: "",
        Date_Birth: null,
        Emergency_Contact_Name: "",
        Next_Kin_Relationship: "",
        Emergency_Contact_Phone: "",
      });

      console.log("Form reset complete");
    } catch (error) {
      console.error("Register student error:", error);
      setSubmitting(false);
      toast.error("An unexpected error occurred. Please try again");
      return;
    }

    console.log("Form submission completed");
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-oceanic transition-colors"
          >
            <LuArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Register Student For Accommodation
          </h2>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <LuUser className="w-6 h-6 text-oceanic" />
            <h3 className="text-xl font-semibold text-gray-800">
              Student Registration Form
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Please fill in the student's details below. All fields marked with{" "}
            <span className="text-red-500">*</span> are required.
          </p>

          <div className="space-y-6">
            {/* Two column layout for form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student / Admission ID <span className="text-red-500">*</span>
                </label>
                <TextField
                  fullWidth
                  name="Student_ID"
                  value={formData.Student_ID}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="Enter ID number"
                  error={!!errors.Student_ID}
                  helperText={errors.Student_ID}
                  disabled={submitting}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-3">
                  Newly admitted students who haven't completed full
                  registration can use their Admission ID from the admission
                  form to access the accommodation system
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <TextField
                  fullWidth
                  name="Customer_Name"
                  value={formData.Customer_Name}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="Enter full name"
                  error={!!errors.Customer_Name}
                  helperText={errors.Customer_Name}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DatePick
                  label="Select date"
                  name="Date_Birth"
                  value={formData?.Date_Birth}
                  maxDate={moment()}
                  onChange={(date) =>
                    handleChange({
                      target: {
                        name: "Date_Birth",
                        value: date,
                      },
                    })
                  }
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  fullWidth
                  name="Gender"
                  options={sortedGender}
                  size="small"
                  value={
                    sortedGender.find(
                      (option) => option?.id === formData?.Gender,
                    ) ?? null
                  }
                  onChange={(event, newValue) => {
                    handleChange({
                      target: {
                        name: "Gender",
                        value: newValue ? newValue.id : "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select gender" />
                  )}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <TextField
                  fullWidth
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="student@example.com"
                  error={!!errors.Email}
                  helperText={errors.Email}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <TextField
                  fullWidth
                  name="Phone_Number"
                  value={formData.Phone_Number}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 07XX XXX XXX"
                  error={!!errors.Phone_Number}
                  helperText={errors.Phone_Number}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* Program of Study */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program of Study <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  fullWidth
                  name="Program_Study"
                  options={sortedPrograms}
                  size="small"
                  value={
                    sortedPrograms?.find(
                      (option) => option?.id === formData?.Program_Study,
                    ) ?? null
                  }
                  onChange={(event, newValue) => {
                    handleChange({
                      target: {
                        name: "Program_Study",
                        value: newValue ? newValue.id : "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select program" />
                  )}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* Year of Study */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedYear}
                  size="small"
                  name="Year_Study"
                  fullWidth
                  value={
                    sortedYear?.find(
                      (option) => option?.id === formData?.Year_Study,
                    ) ?? null
                  }
                  onChange={(event, newValue) => {
                    handleChange({
                      target: {
                        name: "Year_Study",
                        value: newValue ? newValue.id : "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select year of study" />
                  )}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedNationalities}
                  size="small"
                  fullWidth
                  name="Nationality"
                  value={
                    sortedNationalities?.find(
                      (option) => option?.id === formData?.Nationality,
                    ) ?? null
                  }
                  onChange={(event, newValue) => {
                    handleChange({
                      target: {
                        name: "Nationality",
                        value: newValue ? newValue.id : "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select nationality" />
                  )}
                  disabled={submitting}
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Next of Kin Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <LuUsers className="w-6 h-6 text-oceanic" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Next of Kin Details
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Please provide emergency contact information. This information
                will be used for emergency purposes only.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Next of Kin Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Next of Kin Full Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    fullWidth
                    name="Emergency_Contact_Name"
                    value={formData.Emergency_Contact_Name}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                    placeholder="Enter full name"
                    error={!!errors.Emergency_Contact_Name}
                    helperText={errors.Emergency_Contact_Name}
                    disabled={submitting}
                    className="bg-gray-50"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <Autocomplete
                    fullWidth
                    name="Next_Kin_Relationship"
                    options={sortedRelationships}
                    size="small"
                    value={
                      sortedRelationships.find(
                        (option) =>
                          option?.id === formData?.Next_Kin_Relationship,
                      ) ?? null
                    }
                    onChange={(event, newValue) => {
                      handleChange({
                        target: {
                          name: "Next_Kin_Relationship",
                          value: newValue ? newValue.id : "",
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select relationship" />
                    )}
                    disabled={submitting}
                    className="bg-gray-50"
                  />
                </div>

                {/* Next of Kin Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Next of Kin Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    fullWidth
                    name="Emergency_Contact_Phone"
                    value={formData.Emergency_Contact_Phone}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 07XX XXX XXX"
                    error={!!errors.Emergency_Contact_Phone}
                    helperText={errors.Emergency_Contact_Phone}
                    disabled={submitting}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full cursor-pointer h-12 bg-oceanic text-white rounded-lg font-semibold hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <LinearProgress className="w-20" />
                    <span>Registering Student...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>

            {/* Form Notes */}
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">📝 Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  All fields marked with <span className="text-red-500">*</span>{" "}
                  are required
                </li>
                <li>Students are advised to provide correct details</li>
                <li>
                  Next of kin information is for emergency contact purposes only
                </li>
                <li>
                  Newly admitted students who haven't completed full
                  registration can use their Admission ID from the admission
                  form to access the accommodation system
                </li>
                <li>
                  After registration, the student can proceed with accommodation
                  booking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
