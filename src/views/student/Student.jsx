import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import apiClient from "../../api/Client";
import {
  LuUser,
  LuCircleCheck,
  LuCircleMinus,
  LuPrinter,
} from "react-icons/lu";
import { ROOM_TYPES, TIMEOUT } from "../../constants";
import { capitalize, formatDateTimeForDb, formatter } from "../../../helpers";
import StudentAccommodationInfo from "./StudentAccommodationInfo";
import moment from "moment";

// Tab Panel component for MUI Tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Student = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Tab management for step 3
  const [tabValue, setTabValue] = useState(0);

  // Step 1: Student ID validation
  const [studentId, setStudentId] = useState("");
  const [validatingStudent, setValidatingStudent] = useState(false);
  const [studentData, setStudentData] = useState(null);

  // Step 2: Hostel selection form
  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomPrices, setRoomPrices] = useState([]);
  const [paymentPeriodOptions, setPaymentPeriodOptions] = useState([]);

  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedRoomPrice, setSelectedRoomPrice] = useState(null);
  const [paymentPeriod, setPaymentPeriod] = useState();
  const [quantity, setQuantity] = useState(1);
  const [paymentReason, setPaymentReason] = useState(null);

  const [loadingHostels, setLoadingHostels] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingRoomPrices, setLoadingRoomPrices] = useState(false);

  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestedInfo, setRequestedInfo] = useState([]);

  // Step 3: Invoice data
  const [invoiceData, setInvoiceData] = useState(null);
  const [countdown, setCountdown] = useState(45 * 60); // 45 minutes in seconds

  const verifySangira = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/verify-sangira?Sangira_Number=${invoiceData?.Sangira_Number}`
      );

      if (!response.ok) {
        toast.error(response.data?.error || "Failed to verify sangira");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        toast.error(response.data?.error || "Failed to verify sangira");
        return;
      }

      const sangiraData = response.data?.data;
      console.log("VERIFY SANGIRA");
      console.log(sangiraData);
      setInvoiceData((prev) => ({ ...prev, ...sangiraData }));
      // setCurrentStep(3);
    } catch (error) {
      console.error("Verify sangira error:", error);
      toast.error("Failed to verify sangira");
    }
  }, [invoiceData?.Sangira_Number]);

  function secondsUntilExpiration(dateTimeString) {
    const target = moment(dateTimeString, "YYYY-MM-DD HH:mm:ss");
    const now = moment();

    // If target date is in the past
    if (target.isBefore(now)) {
      return false;
    }

    // Difference in seconds
    return target.diff(now, "seconds");
  }

  // Load hostels when step 2 is reached
  useEffect(() => {
    if (currentStep === 2 && selectedRoom) {
      loadRoomPrices(selectedRoom.id);
    }
  }, [currentStep, selectedRoom]);

  // Load hostels when step 2 is reached
  useEffect(() => {
    if (currentStep === 2) {
      loadHostels();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 2) {
      loadPaymentPeriod();
    }
  }, [currentStep]);

  // Load blocks when hostel is selected
  useEffect(() => {
    if (selectedHostel?.id) {
      loadBlocks(selectedHostel.id);
      // Reset dependent selections
      setSelectedBlock(null);
      setSelectedFloor(null);
      setSelectedRoom(null);
      setSelectedRoomPrice(null);
      setSelectedRoomType(null);
      setBlocks([]);
      setFloors([]);
      setRooms([]);
      setRoomPrices([]);
    }
  }, [selectedHostel]);

  // Load floors when block is selected
  useEffect(() => {
    if (selectedBlock?.id && selectedHostel?.id) {
      loadFloors(selectedBlock.id);
      // Reset dependent selections
      setSelectedFloor(null);
      setSelectedRoom(null);
      setSelectedRoomPrice(null);
      setSelectedRoomType(null);
      setFloors([]);
      setRooms([]);
      setRoomPrices([]);
    }
  }, [selectedBlock, selectedHostel]);

  // Load rooms when floor is selected
  useEffect(() => {
    if (selectedFloor?.id && selectedBlock?.id && selectedHostel?.id) {
      // loadRooms(selectedFloor.id);
      // Reset dependent selection
      setSelectedRoom(null);
      setSelectedRoomPrice(null);
      setSelectedRoomType(null);
      setRooms([]);
      setRoomPrices([]);
    }
  }, [selectedFloor, selectedBlock, selectedHostel]);

  // Load rooms when floor is selected
  useEffect(() => {
    if (
      selectedFloor?.id &&
      selectedBlock?.id &&
      selectedHostel?.id &&
      selectedRoomType?.id
    ) {
      loadRooms(selectedFloor.id);
      // Reset dependent selection
      setSelectedRoom(null);
      setSelectedRoomPrice(null);
      setRooms([]);
      setRoomPrices([]);
    }
  }, [selectedFloor, selectedBlock, selectedHostel, selectedRoomType]);

  const getDisplayData = (fieldName) => {
    switch (fieldName) {
      case "hostel":
        if (selectedHostel) {
          return selectedHostel?.label || "N/A";
        } else {
          return invoiceData?.room?.hostel?.Hostel_Name || "N/A";
        }
      case "block":
        if (selectedBlock) {
          return selectedBlock?.label || "N/A";
        } else return invoiceData?.room?.block?.Block_Name || "N/A";
      case "floor":
        if (selectedFloor) {
          return selectedFloor?.label || "N/A";
        } else return invoiceData?.room?.flow?.Flow_Name || "N/A";
      case "room":
        if (selectedRoom) {
          return selectedRoom?.label || "N/A";
        } else return invoiceData?.room?.Room_Name || "N/A";
      default:
        return "N/A";
    }
  };

  const fetchAccomodationDetails = async (studentInfo) => {
    const response = await apiClient.get(
      `paid-student-items?Student_ID=${studentInfo?.Student_ID}`
    );

    // Check if request was successful
    if (!response.ok) {
      setValidatingStudent(false);

      // Handle apisauce errors
      if (response.problem === "NETWORK_ERROR") {
        toast.error("Network error. Please check your connection");
      } else if (response.problem === "TIMEOUT_ERROR") {
        toast.error("Request timeout. Please try again");
      } else if (response.problem === "CONNECTION_ERROR") {
        toast.error("Connection error. Please check your internet");
      } else {
        toast.error(
          response.data?.error || "Failed to validate student Number"
        );
      }
      return [];
    }

    if (response.data?.error || response.data?.code >= 400) {
      setValidatingStudent(false);
      const errorMessage =
        response.data?.error || "Invalid student Number. Please try again";
      toast.error(errorMessage);
      return [];
    }

    let studentData = response.data?.data
      ?.filter(
        (e) =>
          e.sangira?.Sangira_Status === "completed" &&
          e.Request_Type === "hostel"
      )
      .sort((a, b) => b.Request_ID - a.Request_ID);

    return studentData.map((e) => ({
      ...e,
      ...e.sangira,
      room: e?.room,
    }));
  };

  // Step 1: Validate Student ID
  const validateStudentId = async () => {
    // Validation
    if (!studentId || studentId.trim() === "") {
      toast.error("Please enter a valid student Number");
      return;
    }

    setValidatingStudent(true);

    try {
      const response = await apiClient.get(
        `/validate-student?Student_ID=${studentId.trim()}&Phone_Number=0788326688`
      );

      // Check if request was successful
      if (!response.ok) {
        setValidatingStudent(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else if (response.problem === "CONNECTION_ERROR") {
          toast.error("Connection error. Please check your internet");
        } else {
          toast.error(
            response.data?.error || "Failed to validate student Number"
          );
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setValidatingStudent(false);
        const errorMessage =
          response.data?.error || "Invalid student Number. Please try again";
        toast.error(errorMessage);
        return;
      }

      // Success - store student data and move to next step
      const studentInfo = response.data?.data?.customer;
      let accomodationInfo = response.data?.data?.studentRequest;
      if (!accomodationInfo.length) {
        accomodationInfo = await fetchAccomodationDetails(studentInfo);
        if (accomodationInfo.length) {
          setInvoiceData(accomodationInfo[0]);
          setCurrentStep(3);
          return;
        }
      }
      setRequestedInfo(accomodationInfo);
      setStudentData(studentInfo);

      setValidatingStudent(false);
      toast.success("Student Number validated successfully");
      if (
        accomodationInfo.filter((e) => e.Request_Type === "hostel").length >
          0 &&
        secondsUntilExpiration(accomodationInfo[0]?.Expire_Date) > 0
      ) {
        setInvoiceData(accomodationInfo[0]);
        setCountdown(secondsUntilExpiration(accomodationInfo[0]?.Expire_Date));
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
      //   setCurrentStep(2);
    } catch (error) {
      console.error("Validate student Number error:", error);
      setValidatingStudent(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  // const sangiraTimer = useRef();

  useEffect(() => {
    let sangiraTimer = null;
    if (
      invoiceData?.Sangira_Number &&
      invoiceData?.Sangira_Status === "pending"
    ) {
      sangiraTimer = setInterval(() => {
        verifySangira();
      }, 5000);
    } else {
      clearInterval(sangiraTimer);
    }

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      if (sangiraTimer) {
        clearInterval(sangiraTimer);
      }
    };
  }, [invoiceData?.Sangira_Number, invoiceData?.Sangira_Status]);

  const getPriceUnit = (nationality) => {
    if (nationality === "local") {
      return "TZS";
    } else {
      return "USD";
    }
  };

  //Load Room Price
  const loadRoomPrices = async (roomId) => {
    setLoadingRoomPrices(true);
    try {
      const response = await apiClient.get(
        `/student-room-price?Room_ID=${roomId}&room_type=${selectedRoomType?.id}&nationality=${studentData?.Customer_Type}`
      );

      if (!response.ok) {
        setLoadingRoomPrices(false);
        toast.error(response.data?.error || "Failed to fetch Room Prices");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingRoomPrices(false);
        toast.error(response.data?.error || "Failed to fetch Room Prices");
        return;
      }

      const roomPricesData = response?.data?.data?.map((e) => ({
        ...e,
        label: `${capitalize(e.Room_Type)} (${getPriceUnit(
          e?.Natinality
        )} ${formatter.format(e?.Price || 0)})`,
      }));
      setRoomPrices(Array.isArray(roomPricesData) ? roomPricesData : []);
      setLoadingRoomPrices(false);

      if (roomPricesData?.length > 0) {
        setSelectedRoomPrice(roomPricesData[0]);
      }
    } catch (error) {
      console.error("Fetch Room Prices error:", error);
      setLoadingRoomPrices(false);
      toast.error("Failed to load Room Prices");
    }
  };

  // Load hostels
  const loadHostels = async (roomPrice) => {
    setLoadingHostels(true);
    try {
      const response = await apiClient.get(
        `/student-hostel?&nationality=${studentData?.Customer_Type}`
      );

      if (!response.ok) {
        setLoadingHostels(false);
        toast.error(response.data?.error || "Failed to fetch hostels");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingHostels(false);
        toast.error(response.data?.error || "Failed to fetch hostels");
        return;
      }

      const hostelData = response?.data?.data;
      setHostels(Array.isArray(hostelData) ? hostelData : []);
      setLoadingHostels(false);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      setLoadingHostels(false);
      toast.error("Failed to load hostels");
    }
  };

  // Load payment periods
  const loadPaymentPeriod = async () => {
    setLoadingCategory(true);
    try {
      const response = await apiClient.get(`/payment-category`);

      if (!response.ok) {
        setLoadingCategory(false);
        toast.error(response.data?.error || "Failed to fetch paymentPeriods");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingCategory(false);
        toast.error(response.data?.error || "Failed to fetch paymentPeriods");
        return;
      }

      const period = response?.data?.data;
      setPaymentPeriodOptions(
        Array.isArray(period)
          ? period.map((e) => ({
              id: e.Category_ID,
              label: e.Category_Name,
              quantity: e.Category_Quantity,
            }))
          : []
      );
      setLoadingCategory(false);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      setLoadingCategory(false);
      toast.error("Failed to load hostels");
    }
  };

  // Load blocks for selected hostel
  const loadBlocks = async (hostelId) => {
    setLoadingBlocks(true);
    try {
      const response = await apiClient.get(
        `/student-block?nationality=${studentData?.Customer_Type}&hostel_id=${hostelId}`
      );

      if (!response.ok) {
        setLoadingBlocks(false);
        toast.error(response.data?.error || "Failed to fetch blocks");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingBlocks(false);
        toast.error(response.data?.error || "Failed to fetch blocks");
        return;
      }

      const blockData = response?.data?.data;
      setBlocks(Array.isArray(blockData) ? blockData : []);
      setLoadingBlocks(false);
    } catch (error) {
      console.error("Fetch blocks error:", error);
      setLoadingBlocks(false);
      toast.error("Failed to load blocks");
    }
  };

  // Load floors for selected block
  const loadFloors = async (blockId) => {
    setLoadingFloors(true);
    try {
      const response = await apiClient.get(
        `/student-flow?nationality=${studentData?.Customer_Type}&block_id=${blockId}`
      );

      if (!response.ok) {
        setLoadingFloors(false);
        toast.error(response.data?.error || "Failed to fetch floors");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingFloors(false);
        toast.error(response.data?.error || "Failed to fetch floors");
        return;
      }

      const floorData = response?.data?.data;
      setFloors(Array.isArray(floorData) ? floorData : []);
      setLoadingFloors(false);
    } catch (error) {
      console.error("Fetch floors error:", error);
      setLoadingFloors(false);
      toast.error("Failed to load floors");
    }
  };

  // Load rooms for selected floor
  const loadRooms = async (floorId) => {
    console.log(studentData);
    setLoadingRooms(true);
    try {
      const response = await apiClient.get(
        `/student-room?Nationality=${studentData?.Customer_Type}&room_type=${selectedRoomType.id}&flow_id=${floorId}`
      );

      if (!response.ok) {
        setLoadingRooms(false);
        toast.error(response.data?.error || "Failed to fetch rooms");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingRooms(false);
        toast.error(response.data?.error || "Failed to fetch rooms");
        return;
      }

      const roomData = response?.data?.data;
      setRooms(Array.isArray(roomData) ? roomData : []);
      setLoadingRooms(false);
    } catch (error) {
      console.error("Fetch rooms error:", error);
      setLoadingRooms(false);
      toast.error("Failed to load rooms");
    }
  };

  // Submit final form
  const submitForm = async () => {
    // Validation
    if (!selectedHostel) {
      toast.error("Please select a hostel");
      return;
    }

    if (!selectedBlock) {
      toast.error("Please select a block");
      return;
    }

    if (!selectedFloor) {
      toast.error("Please select a floor");
      return;
    }

    if (!selectedRoom) {
      toast.error("Please select a room");
      return;
    }

    if (!selectedRoomPrice) {
      toast.error("Please select room price");
      return;
    }

    if (paymentPeriod?.label === "Month" && !paymentReason) {
      console.log(paymentReason);
      toast.error("Please enter reason for payment");
      return;
    }

    setSubmitting(true);

    console.log(studentData?.itemsData);

    try {
      const data = {
        Student_ID: studentData?.Student_ID || studentId,
        Room_ID: selectedRoom.id,
        Grand_Total_Price: selectedRoomPrice.Price * quantity,
        Price: selectedRoomPrice.Price,
        // Room_Expire_Date: formatDateTimeForDb(
        //   new Date(Date.now() + TIMEOUT * 1000)
        // ),
        Request_Type: "hostel",
        Phone_Number: studentData?.Phone_Number,
        Customer_ID: studentData?.Customer_ID,
        Customer_Name: studentData?.Customer_Name,
        Quantity: quantity,
        Item_ID: studentData?.itemsData?.Item_ID,
        Payment_Reason: paymentReason,
      };

      console.log("Submitting student accommodation data:", data);
      // return;
      const response = await apiClient.post("/sangira-number", data);

      // Check if request was successful
      if (!response.ok) {
        setSubmitting(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else if (response.problem === "CONNECTION_ERROR") {
          toast.error("Connection error. Please check your internet");
        } else {
          toast.error(response.data?.error || "Failed to submit accommodation");
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setSubmitting(false);

        // Handle validation errors
        if (response.data?.error && typeof response.data.error === "object") {
          const firstErrorKey = Object.keys(response.data.error)[0];
          const firstErrorMessage = response.data.error[firstErrorKey][0];
          toast.error(firstErrorMessage || "Failed to submit accommodation");
        } else {
          const errorMessage =
            response.data?.error || "Failed to submit accommodation";
          toast.error(errorMessage);
        }
        return;
      }

      // Success - store invoice data and move to step 3
      const invoiceInfo = response.data?.data;
      setInvoiceData({
        ...invoiceInfo?.sangiraData,
      });
      setSubmitting(false);
      toast.success("Invoice generated successfully!");

      // Reset countdown to 45 minutes
      setCountdown(
        secondsUntilExpiration(invoiceInfo?.sangiraData?.Expire_Date)
      );

      // Move to step 3
      setCurrentStep(3);
    } catch (error) {
      console.error("Submit accommodation error:", error);
      setSubmitting(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  // Prepare options for autocomplete components
  const hostelOptions = hostels.map((hostel) => ({
    id: hostel.Hostel_ID,
    label: hostel.Hostel_Name,
  }));

  const blockOptions = blocks.map((block) => ({
    id: block.Block_ID,
    label: block.Block_Name,
  }));

  const floorOptions = floors.map((floor) => ({
    id: floor.Flow_ID,
    label: floor.Flow_Name,
  }));

  const roomOptions = rooms.map((room) => ({
    id: room.Room_ID,
    label: room.Room_Name,
  }));

  // Countdown timer effect
  useEffect(() => {
    if (currentStep === 3 && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      if (
        invoiceData?.Sangira_Status &&
        invoiceData?.Sangira_Status !== "pending"
      ) {
        clearInterval(timer);
      }
      return () => clearInterval(timer);
    }
  }, [currentStep, countdown, invoiceData?.Sangira_Status]);

  // Handle countdown expiration
  useEffect(() => {
    if (
      currentStep === 3 &&
      countdown === 0 &&
      invoiceData?.Sangira_Status === "pending"
    ) {
      // Show expiration notification
      toast.error("Invoice has expired! Please start a new request.", {
        duration: 5000,
      });

      // Reset form and redirect to step 1 after a delay
      setTimeout(() => {
        setCurrentStep(1);
        setStudentId("");
        setStudentData(null);
        setSelectedHostel(null);
        setSelectedBlock(null);
        setSelectedFloor(null);
        setSelectedRoom(null);
        setSelectedRoomType(null);
        setSelectedRoomPrice(null);
        setInvoiceData(null);
        setHostels([]);
        setBlocks([]);
        setFloors([]);
        setRooms([]);
        setRoomPrices([]);
        setCountdown(0);
        setTabValue(0); // Reset tab to first tab
      }, 3000); // Wait 3 seconds before redirecting
    }
  }, [countdown, currentStep, invoiceData]);

  // Format countdown time
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step
                  ? "bg-oceanic text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > step ? (
                <LuCircleCheck className="w-6 h-6" />
              ) : (
                <span className="font-semibold">{step}</span>
              )}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                currentStep >= step ? "text-oceanic" : "text-gray-500"
              }`}
            >
              {step === 1
                ? "Student"
                : step === 2
                ? "Accommodation"
                : "Payment"}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-24 h-1 mx-4 transition-all duration-300 ${
                currentStep > step ? "bg-oceanic" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div
      className={`mx-auto py-8 ${
        currentStep === 2 || currentStep === 3 ? "max-w-7xl px-4" : "max-w-4xl"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Student Accommodation
          </h2>
          <p className="text-gray-600">
            Complete the steps below to register for accommodation
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Step 1: Student ID Validation */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <LuUser className="w-6 h-6 text-oceanic" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Enter Student No.
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Please enter your student number to manage your accomodations.
              </p>

              <div className="space-y-4">
                <TextField
                  fullWidth
                  label="Student ID"
                  variant="outlined"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !validatingStudent) {
                      validateStudentId();
                    }
                  }}
                  disabled={validatingStudent}
                  autoFocus
                  placeholder="Enter your student ID"
                />

                {validatingStudent && (
                  <div className="mt-4">
                    <LinearProgress />
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Validating student ID...
                    </p>
                  </div>
                )}

                <button
                  onClick={validateStudentId}
                  disabled={validatingStudent || !studentId.trim()}
                  className="w-full mt-4 h-12 bg-oceanic text-white rounded-lg font-semibold hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {validatingStudent ? "Validating..." : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Student Details & Accommodation Selection */}
        {currentStep === 2 && studentData && (
          <>
            {/* {requestedInfo && requestedInfo.length > 0 ? (
              <StudentAccommodationInfo
                studentId={studentId}
                studentData={studentData}
                requestedInfo={requestedInfo.find(
                  (e) => e.Request_Type === "hostel"
                )}
              />
            ) : ( */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side: Student Details Card */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-oceanic flex items-center justify-center">
                    <LuUser className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Student Information
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Student Number
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {studentData.Student_ID || studentId}
                    </p>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Full Name
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {studentData.Customer_Name || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-base font-medium text-gray-800 break-words">
                      {studentData.Email || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Program of Study
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {studentData.Program_Study || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Year of Study
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {studentData.Year_Study || "N/A"}
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nationality
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {studentData.Nationality || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Accommodation Selection Form */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm ">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Select Accommodation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose your preferred hostel, block, floor, and room
                  </p>
                </div>

                <div className="space-y-5 ">
                  {/* Form Fields Grid - 2 columns */}
                  <div className="grid grid-cols-2 gap-5">
                    {/* Hostel Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hostel <span className="text-red-500">*</span>
                      </label>
                      {loadingHostels ? (
                        <div>
                          <LinearProgress />
                          <p className="text-xs text-gray-500 mt-2">
                            Loading hostels...
                          </p>
                        </div>
                      ) : (
                        <Autocomplete
                          options={hostelOptions}
                          value={selectedHostel}
                          onChange={(e, value) => setSelectedHostel(value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select a hostel"
                              variant="outlined"
                              size="small"
                              className="bg-gray-50"
                            />
                          )}
                          disabled={loadingHostels || submitting}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        />
                      )}
                    </div>

                    {/* Block Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Block <span className="text-red-500">*</span>
                      </label>
                      {loadingBlocks ? (
                        <div>
                          <LinearProgress />
                          <p className="text-xs text-gray-500 mt-2">
                            Loading blocks...
                          </p>
                        </div>
                      ) : (
                        <Autocomplete
                          options={blockOptions}
                          value={selectedBlock}
                          onChange={(e, value) => setSelectedBlock(value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={
                                selectedHostel
                                  ? "Select a block"
                                  : "Please select a hostel first"
                              }
                              variant="outlined"
                              size="small"
                              className="bg-gray-50"
                            />
                          )}
                          disabled={
                            !selectedHostel || loadingBlocks || submitting
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        />
                      )}
                    </div>

                    {/* Floor Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Floor <span className="text-red-500">*</span>
                      </label>
                      {loadingFloors ? (
                        <div>
                          <LinearProgress />
                          <p className="text-xs text-gray-500 mt-2">
                            Loading floors...
                          </p>
                        </div>
                      ) : (
                        <Autocomplete
                          options={floorOptions}
                          value={selectedFloor}
                          onChange={(e, value) => setSelectedFloor(value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={
                                selectedBlock
                                  ? "Select a floor"
                                  : "Please select a block first"
                              }
                              variant="outlined"
                              size="small"
                              className="bg-gray-50"
                            />
                          )}
                          disabled={
                            !selectedBlock || loadingFloors || submitting
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        />
                      )}
                    </div>

                    {/* Room Type Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Type <span className="text-red-500">*</span>
                      </label>

                      <Autocomplete
                        options={ROOM_TYPES}
                        value={selectedRoomType}
                        onChange={(e, value) => setSelectedRoomType(value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select a room type"
                            variant="outlined"
                            size="small"
                            className="bg-gray-50"
                          />
                        )}
                        disabled={!selectedFloor || submitting}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f9fafb",
                          },
                        }}
                      />
                    </div>

                    {/* Room Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room <span className="text-red-500">*</span>
                      </label>
                      {loadingRooms ? (
                        <div>
                          <LinearProgress />
                          <p className="text-xs text-gray-500 mt-2">
                            Loading rooms...
                          </p>
                        </div>
                      ) : (
                        <Autocomplete
                          options={roomOptions}
                          value={selectedRoom}
                          onChange={(e, value) => setSelectedRoom(value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={
                                selectedRoomType
                                  ? "Select a room"
                                  : "Please select a floor first"
                              }
                              variant="outlined"
                              size="small"
                              className="bg-gray-50"
                            />
                          )}
                          disabled={
                            !selectedRoomType || loadingRooms || submitting
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        />
                      )}
                    </div>

                    {/* Room Prices Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Price <span className="text-red-500">*</span>
                      </label>
                      {loadingRoomPrices ? (
                        <div>
                          <LinearProgress />
                          <p className="text-xs text-gray-500 mt-2">
                            Loading room prices...
                          </p>
                        </div>
                      ) : (
                        <Autocomplete
                          options={roomPrices}
                          value={selectedRoomPrice}
                          disabled={true}
                          onChange={(e, value) => setSelectedRoomPrice(value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select a room price"
                              variant="outlined"
                              size="small"
                              className="bg-gray-50"
                            />
                          )}
                          // disabled={
                          //   !selectedRoom || loadingRoomPrices || submitting
                          // }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        />
                      )}
                    </div>

                    {/* Payment Period Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Period <span className="text-red-500">*</span>
                      </label>
                      {loadingCategory ? (
                        <div>
                          <LinearProgress />
                          <p className="text-xs text-gray-500 mt-2">
                            Loading categories...
                          </p>
                        </div>
                      ) : (
                        <>
                          <Autocomplete
                            options={paymentPeriodOptions}
                            value={paymentPeriod}
                            onChange={(e, value) => {
                              setPaymentPeriod(value);
                              setQuantity(1);
                              if (["Semister", "Year"].includes(value?.label)) {
                                setQuantity(Number(value?.quantity) || 1);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select a Payment Period"
                                variant="outlined"
                                size="small"
                                className="bg-gray-50"
                              />
                            )}
                            disabled={loadingCategory || submitting}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f9fafb",
                              },
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {paymentPeriod?.label === "Month" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="mt-4 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Months to pay for{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <TextField
                          type="number"
                          value={quantity}
                          onChange={(event) => {
                            const parsed = parseInt(event.target.value, 10);
                            setQuantity(
                              Number.isNaN(parsed) ? 1 : Math.max(1, parsed)
                            );
                          }}
                          inputProps={{ min: 1 }}
                          variant="outlined"
                          size="small"
                          className="bg-gray-50 w-[100%]"
                          disabled={submitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter how many months you want to pay for.
                        </p>
                      </div>

                      <div className="w-full mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason <span className="text-red-500">*</span>
                        </label>
                        <TextField
                          type="text"
                          value={paymentReason}
                          onChange={(e) => setPaymentReason(e.target.value)}
                          variant="outlined"
                          size="small"
                          className="bg-gray-50 w-[100%]"
                          disabled={submitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a reason why you want to pay for {quantity}{" "}
                          month(s).
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedRoom ? (
                    <div className="bg-white/70 rounded-lg p-4 border border-blue-100 align-center flex flex-col">
                      <div className="flex w-full  justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Room
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedHostel?.label} {">"} {selectedBlock?.label}{" "}
                          {" > "}
                          <span className="text-blue-500">
                            {selectedRoom?.label}
                          </span>
                        </p>
                      </div>
                      <hr class="my-4 border-t-0.5 opacity-25 stroke-grey-50 bg-neutral-100 dark:bg-white/10" />
                      <div className="flex w-full  justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Total Price
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {getPriceUnit(studentData?.Customer_Type)}{" "}
                          {selectedRoomPrice?.Price
                            ? formatter?.format(
                                selectedRoomPrice?.Price * quantity
                              )
                            : 0}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {/* Submit Button - Full Width */}
                  <div className="pt-2">
                    <button
                      onClick={submitForm}
                      disabled={
                        submitting ||
                        !selectedHostel ||
                        !selectedBlock ||
                        !selectedFloor ||
                        !selectedRoom
                      }
                      className="w-full cursor-pointer h-12 bg-lime-700 text-white rounded-lg font-semibold hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {submitting ? "Proccessing..." : "Pay Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* // )} */}
          </>
        )}

        {/* Step 3: Invoice Summary & Payment with Tabs */}
        {currentStep === 3 && invoiceData && (
          <div className="space-y-6">
            {/* Success Header */}
            <div
              className={`bg-gradient-to-r ${
                invoiceData?.Sangira_Status === "pending"
                  ? "from-yellow-50 to-amber-50"
                  : "from-green-50 to-emerald-50"
              } rounded-xl p-6 border border-green-200`}
            >
              <div className="flex items-center gap-3 mb-2">
                {invoiceData?.Sangira_Status === "pending" ? (
                  <>
                    <LuCircleMinus className="w-8 h-8 text-yellow-500" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      Sangira Number Pending Payment
                    </h3>
                  </>
                ) : (
                  <>
                    <LuCircleCheck className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      Accomodation Paid
                    </h3>
                  </>
                )}
              </div>
              {invoiceData?.Sangira_Status === "pending" ? (
                <p className="text-gray-600">
                  Please complete your payment using the details below. The
                  Sangira Number expires in 24 hours.
                </p>
              ) : (
                <p className="text-gray-600">
                  Your payment has been received. Please visit you wardens
                  office for further instructions.
                </p>
              )}
            </div>

            {/* Countdown Timer */}
            {invoiceData?.Sangira_Status === "pending" && (
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Sangira Number Expires In
                    </p>
                    <p className="text-xs text-gray-600">
                      Complete payment before the timer expires (minutes)
                    </p>
                  </div>
                  <div
                    className={`text-4xl font-bold font-mono ${
                      countdown < 300
                        ? "text-red-600 animate-pulse"
                        : countdown < 900
                        ? "text-orange-600"
                        : "text-gray-800"
                    }`}
                  >
                    {formatCountdown(countdown)}
                  </div>
                </div>
              </div>
            )}

            {/* MUI Tabs */}
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#1e3a8a", // oceanic color
                    },
                    "& .MuiTab-root": {
                      color: "#6b7280", // gray-500
                      "&.Mui-selected": {
                        color: "#1e3a8a", // oceanic color
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <Tab label="Payment Details" />
                  <Tab label="Payment Instructions" />
                  <Tab label="Accommodation Form" />
                </Tabs>
              </Box>
              {/* Tab 1: Payment Details */}
              <TabPanel value={tabValue} index={0}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side: Accommodation Summary */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-oceanic flex items-center justify-center">
                          <LuUser className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Accommodation Summary
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Student Number
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {studentData?.Student_ID || studentId || "N/A"}
                          </p>
                        </div>

                        <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Full Name
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {studentData?.Customer_Name || "N/A"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Hostel
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {getDisplayData("hostel")}
                            </p>
                          </div>

                          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Block
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {getDisplayData("block")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Floor
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {getDisplayData("floor")}
                            </p>
                          </div>

                          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Room
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {getDisplayData("room")}
                            </p>
                          </div>
                        </div>

                        {selectedRoomType && (
                          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Room Type
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {selectedRoomType.label || "N/A"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Invoice Details */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            invoiceData?.Sangira_Status === "pending"
                              ? "bg-yellow-400"
                              : "bg-green-600"
                          } flex items-center justify-center`}
                        >
                          {invoiceData?.Sangira_Status === "pending" ? (
                            <LuCircleMinus className="w-6 h-6 text-white" />
                          ) : (
                            <LuCircleCheck className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {invoiceData?.Sangira_Status === "pending"
                            ? "Payment Pending"
                            : "Payment Completed"}
                        </h3>
                      </div>

                      <div className="space-y-5">
                        {/* Payment Number */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Sangira Number
                          </p>
                          <p className="text-2xl font-bold text-green-700 font-mono break-all">
                            {invoiceData.Sangira_Number}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            Use this number to complete your payment
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Total Amount
                          </p>
                          <p className="text-3xl font-bold text-blue-700">
                            {formatter.format(
                              invoiceData.grand_total_price ||
                                invoiceData.Grand_Total_Price
                            )}{" "}
                            {invoiceData.currency ||
                              getPriceUnit(studentData?.Customer_Type)}
                          </p>
                        </div>

                        {invoiceData?.Sangira_Status === "completed" ? (
                          <>
                            {/* Print Receipt */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <p className="text-sm font-semibold text-gray-800 mb-3">
                                Payment Confirmed! 🎉
                              </p>
                              <p className="text-sm text-gray-600 mb-4">
                                Your payment has been successfully processed.
                                You can now print a receipt of your records.
                              </p>
                              <button
                                onClick={() => window.print()}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <LuPrinter className="w-5 h-5" />
                                Print Receipt
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Payment Instructions */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <p className="text-sm font-semibold text-gray-800 mb-2">
                                Payment Instructions:
                              </p>
                              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                <li>
                                  Use the payment number above to complete your
                                  transaction
                                </li>
                                <li>This invoice is valid for 24 hours only</li>
                                <li>
                                  After payment, your accommodation will be
                                  confirmed
                                </li>
                                <li>
                                  Keep this payment number for your records
                                </li>
                              </ul>
                            </div>
                          </>
                        )}

                        {/* Warning if time is running out */}
                        {countdown < 300 && (
                          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <p className="text-sm font-semibold text-red-700">
                              ⚠️ Time is running out! Please complete your
                              payment soon.
                            </p>
                          </div>
                        )}

                        {countdown === 0 && (
                          <div className="bg-red-100 rounded-lg p-4 border-2 border-red-300">
                            <p className="text-sm font-bold text-red-800 mb-2">
                              ⚠️ Invoice Expired!
                            </p>
                            <p className="text-xs text-red-700">
                              This invoice is no longer valid. You will be
                              redirected to start a new request in a few
                              seconds.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              {/* Tab 2: Payment Instructions */}
              <TabPanel value={tabValue} index={1}>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    How to Complete Your Payment via CRDB / NMB Banking
                  </h3>

                  <div className="space-y-6">
                    {/* Step 1: Sangira Number */}
                    <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold">1</span>
                        </div>
                        <h4 className="font-semibold text-lg text-gray-700">
                          Step 1: Your Sangira Number
                        </h4>
                      </div>
                      <div className="ml-11">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Sangira Number:
                          </p>
                          <p className="text-2xl font-bold text-green-700 font-mono break-all tracking-wider">
                            {invoiceData.Sangira_Number}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Keep this number ready for payment
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <h4 className="font-semibold text-lg text-gray-700">
                          Option A: CRDB / NMM Agent (Wakala)
                        </h4>
                      </div>
                      <div className="ml-11">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Payment to KCMC Hospital
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: CRDB USSD Method */}
                    <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold">3</span>
                        </div>
                        <h4 className="font-semibold text-lg text-gray-700">
                          Option A: CRDB USSD Payment
                        </h4>
                      </div>
                      <div className="ml-11">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                a
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Dial USSD Code:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <code className="text-lg font-mono font-bold text-blue-700">
                                  *150*03#
                                </code>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                b
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Select Simbanking:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Press <span className="font-bold">1</span> for
                                  Simbanking
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                c
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Enter PIN:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Enter your CRDB mobile banking PIN
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                d
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Select Pay Bill:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Press <span className="font-bold">4</span> for
                                  Pay Bill
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                e
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Select Taasisi:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Press <span className="font-bold">6</span> for
                                  Taasisi
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                f
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Select Hospital:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Press <span className="font-bold">4</span> for
                                  Hospital
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                g
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Select KCMC Hospital:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Press <span className="font-bold">3</span> for
                                  KCMC Hospital
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                h
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Choose Account:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Press <span className="font-bold">1</span> for
                                  Chagua Account
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                i
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Enter Sangira Number:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Enter your Sangira Number:{" "}
                                  <span className="font-bold text-green-700 font-mono">
                                    {invoiceData.Sangira_Number}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: CRDB Mobile App Method */}
                    <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold">4</span>
                        </div>
                        <h4 className="font-semibold text-lg text-gray-700">
                          Option B: CRDB Simbanking App
                        </h4>
                      </div>
                      <div className="ml-11">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                a
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Open Simbanking App:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Launch CRDB Simbanking app on your phone
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                b
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Select Hospital Service:
                              </p>
                              <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">
                                  Navigate to "Huduma ya Hospital" (Hospital
                                  Services)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-blue-600 font-bold text-sm">
                                c
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Enter Sangira Number:
                              </p>
                              <div className="mt-1 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-gray-700">
                                  Enter your Sangira Number:{" "}
                                  <span className="font-bold text-green-700 font-mono">
                                    {invoiceData.Sangira_Number}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  (Weha namba ya ankara)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-yellow-50 rounded-lg p-5 border-2 border-yellow-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-white font-bold">!</span>
                        </div>
                        <h4 className="font-semibold text-lg text-yellow-700">
                          Important Notes & Reminders
                        </h4>
                      </div>
                      <div className="ml-11">
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                              Keep your Sangira Number safe for future reference
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                              Payment must be completed within 24 hours
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                              You will receive an SMS confirmation after
                              successful payment
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>
                              Contact KCMC Finance Office at{" "}
                              <span className="font-bold">0788-326-688</span>{" "}
                              for assistance
                            </span>
                          </li>
                        </ul>

                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-600 font-bold">
                              ⚠️ TIME SENSITIVE:
                            </span>
                            <span className="text-red-700 font-semibold">
                              Expires in:
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700">
                              Complete your payment before time runs out
                            </p>
                            <div
                              className={`text-2xl font-bold font-mono ${
                                countdown < 300
                                  ? "text-red-600 animate-pulse"
                                  : countdown < 900
                                  ? "text-orange-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {formatCountdown(countdown)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Tab 3: Accommodation Form */}
              <TabPanel value={tabValue} index={2}>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Accommodation Registration Form
                  </h3>

                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-lg text-gray-700 mb-4">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student Number
                          </label>
                          <input
                            type="text"
                            value={studentData?.Student_ID || studentId || ""}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={studentData?.Customer_Name || ""}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Program of Study
                          </label>
                          <input
                            type="text"
                            value={studentData?.Program_Study || ""}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year of Study
                          </label>
                          <input
                            type="text"
                            value={studentData?.Year_Study || ""}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Accommodation Details Section */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-lg text-gray-700 mb-4">
                        Accommodation Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hostel
                          </label>
                          <input
                            type="text"
                            value={getDisplayData("hostel")}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Block
                          </label>
                          <input
                            type="text"
                            value={getDisplayData("block")}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Floor
                          </label>
                          <input
                            type="text"
                            value={getDisplayData("floor")}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Number
                          </label>
                          <input
                            type="text"
                            value={getDisplayData("room")}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Information Section */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-lg text-gray-700 mb-4">
                        Payment Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sangira Number
                          </label>
                          <input
                            type="text"
                            value={invoiceData?.Sangira_Number || ""}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Amount
                          </label>
                          <input
                            type="text"
                            value={`${formatter.format(
                              invoiceData?.grand_total_price ||
                                invoiceData?.Grand_Total_Price
                            )} ${
                              invoiceData?.currency ||
                              getPriceUnit(studentData?.Customer_Type)
                            }`}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded bg-gray-50 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Status
                          </label>
                          <input
                            type="text"
                            value={
                              invoiceData?.Sangira_Status === "pending"
                                ? "Pending Payment"
                                : "Paid"
                            }
                            readOnly
                            className={`w-full p-2 border rounded ${
                              invoiceData?.Sangira_Status === "pending"
                                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                : "border-green-300 bg-green-50 text-green-700"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiration Time
                          </label>
                          <input
                            type="text"
                            value={formatCountdown(countdown)}
                            readOnly
                            className={`w-full p-2 border rounded font-mono ${
                              countdown < 300
                                ? "border-red-300 bg-red-50 text-red-700"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Print Section */}
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-semibold text-lg text-gray-700 mb-2">
                        Document Actions
                      </h4>
                      <p className="text-gray-600 mb-4">
                        You can print this form for your records or to submit to
                        the warden's office.
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <LuPrinter className="w-4 h-4" />
                          Print Form
                        </button>
                        <button
                          onClick={() => setTabValue(0)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Back to Payment Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;
