import {
  MdOutlineListAlt,
  MdOutlineWorkOutline,
  MdPeople,
  MdTrendingUp,
} from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import apiClient from "./api/Client";
import {
  capitalize,
  currencyFormatter,
  formatter,
  removeUnderscore,
} from "../helpers";
import ManagementCard from "./components/ManagementCard";
import { LuLandPlot } from "react-icons/lu";
import {
  BsBoxes,
  BsClipboard2Plus,
  BsHouseCheck,
  BsPeople,
} from "react-icons/bs";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";

const EstateDashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [houseUnits, setHouseUnits] = useState([]);
  const [availbleHouseUnits, setAvailableHouseUnits] = useState([]);
  const [spaceUnits, setSpaceUnits] = useState([]);
  const [availableSpaceUnits, setAvailableSpaceUnits] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [spaces, setSpaceRequests] = useState([]);
  const [features, setFeatures] = useState([]);
  const [stats, setStatistics] = useState("");
  const [rentedHouses, setRentedHouses] = useState([]);
  const [rentedSpace, setRenetedSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const navigate = useNavigate();

  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/customer/customer-request");

      if (!response.ok) {
        setLoading(false);
        // toast.error(response.data?.error || "Failed to fetch employees");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        // toast.error(response.data.error || "Failed to fetch employees");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));
      // console.log(newData);
      setPayments(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setLoading(false);
      // toast.error("Failed to load employees");
    }
  };

  const loadUnits = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        "/settings/real-estate?&all_real_estate=yes",
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;

      // Houses only
      const housesData = userData
        ?.filter((user) => user?.real_estate_type === "house")
        ?.map((user, index) => ({
          ...user,
          key: index + 1,
        }));

      // Available houses only
      const availableHouses = housesData
        ?.filter((user) => user?.available === "yes")
        ?.map((user, index) => ({
          ...user,
          key: index + 1,
        }));

      // Business land only
      const businessLandData = userData
        ?.filter((user) => user?.real_estate_type === "business land")
        ?.map((user, index) => ({
          ...user,
          key: index + 1,
        }));

      // Available business land only
      const availableSpace = businessLandData
        ?.filter((user) => user?.available === "yes")
        ?.map((user, index) => ({
          ...user,
          key: index + 1,
        }));

      // console.log(newData);
      setUnits(Array.isArray(userData) ? userData : []);
      setHouseUnits(Array.isArray(housesData) ? housesData : []);
      setAvailableHouseUnits(
        Array.isArray(availableHouses) ? availableHouses : [],
      );
      setSpaceUnits(Array.isArray(businessLandData) ? businessLandData : []);
      setAvailableSpaceUnits(
        Array.isArray(availableSpace) ? availableSpace : [],
      );
      setLoading(false);
    } catch (error) {
      console.error("Fetch units error:", error);
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/real-estate-feature");

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const featuresData = response?.data?.data;
      const newData = featuresData?.map((feature, index) => ({
        ...feature,
        key: index + 1,
      }));
      // console.log(newData);
      setFeatures(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch features error:", error);
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/unit-location");

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const locationsData = response?.data?.data;
      const newData = locationsData?.map((location, index) => ({
        ...location,
        key: index + 1,
      }));
      // console.log(newData);
      setLocations(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch locations error:", error);
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer?&Customer_Nature=house_rent`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));
      // console.log(newData);
      // setCustomers(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const url = `/customer/customer?&Customer_Nature=house_rent`;
      const response = await apiClient.get(url);

      // For axios, check status or data.error
      if (
        response.status >= 400 ||
        response.data?.error ||
        response.data?.code >= 400
      ) {
        return;
      }

      const userData = response?.data?.data?.data || [];

      const employeesArray = [];
      const customersArray = [];

      userData.forEach((user, index) => {
        const mappedUser = {
          ...user,
          key: index + 1,
        };

        // Use strict equality
        if (user?.Student_ID !== null) {
          employeesArray.push(mappedUser);
        } else {
          customersArray.push(mappedUser);
        }
      });

      setEmployees(employeesArray);
      setCustomers(customersArray);
    } catch (error) {
      console.error("Fetch customers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHouseRequests = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=house_rent`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const itemData = response?.data?.data?.data;
      const newData = itemData?.map((item, index) => ({
        ...item,
        key: index + 1,
      }));

      // rented houses only
      const houseRented = itemData
        ?.filter(
          (house) =>
            house?.Customer_Status === "served" ||
            house?.Customer_Status === "assign" ||
            house?.Customer_Status === "requested",
        )
        ?.map((house, index) => ({
          ...house,
          key: index + 1,
        }));
      // console.log(newData);
      setRequests(Array.isArray(newData) ? newData : []);

      setRentedHouses(Array.isArray(houseRented) ? houseRented : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
    }
  };

  const loadSpaceRequests = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=business_land`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        return;
      }

      // Adjust based on your API response structure
      const itemData = response?.data?.data?.data;
      const newData = itemData?.map((item, index) => ({
        ...item,
        key: index + 1,
      }));

      // rented spaces only
      const spaceRented = itemData
        ?.filter(
          (house) =>
            house?.Customer_Status === "served" ||
            house?.Customer_Status === "assign" ||
            house?.Customer_Status === "requested",
        )
        ?.map((house, index) => ({
          ...house,
          key: index + 1,
        }));
      // console.log(newData);
      setSpaceRequests(Array.isArray(newData) ? newData : []);

      setRenetedSpaces(Array.isArray(spaceRented) ? spaceRented : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsData();
    loadUnits();
    loadFeatures();
    loadCustomers();
    loadEmployees();
    loadLocations();
    loadHouseRequests();
    loadSpaceRequests();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  // Function to get total occupants (occupied units)
function getTotalOccupants(realEstateData) {
  return realEstateData?.filter(unit => unit?.available === "no")?.length;
}

// Function to calculate occupancy rate
function getOccupancyRate(realEstateData) {
  const totalUnits = realEstateData?.length;
  const occupiedUnits = getTotalOccupants(realEstateData);
  
  if (totalUnits === 0) return 0;
  
  const rate = (occupiedUnits / totalUnits) * 100;
  return parseFloat(rate.toFixed(2));
}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Rental Houses
              </h3>
              <FaHome className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {houseUnits?.length || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              {formatter.format(availbleHouseUnits?.length || 0)} units
              available
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Rental Spaces
              </h3>
              <LuLandPlot className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(spaceUnits?.length || 0)}
            </p>
            <p className="text-xs text-sky-600 mt-2">
              {formatter.format(availableSpaceUnits?.length || 0)} available
              spaces
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Year Revenue
              </h3>
              <MdTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {currencyFormatter.format(0)}
            </p>
            <p className="text-xs text-green-600 mt-2">+5% from last year</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Occupants
              </h3>
              <MdPeople className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(getTotalOccupants(units) || 0)}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {getOccupancyRate(units)}% occupancy rate
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            onClick={() => navigate("/projects/real-estates/payments")}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/projects/real-estates/payments")
            }
            role="button"
            tabIndex={0}
            className="flex justify-between cursor-pointer"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Recent Payments & Updates
            </h3>
            <FiArrowRight className="w-5 h-5 text-slate-400 hover:text-sky-600 transition-colors" />
          </div>

          <div className="space-y-4">
            {payments?.slice(0, 4).map((item) => {
              // Determine status display
              const getStatusInfo = () => {
                if (item.Customer_Status === "served") {
                  return {
                    label: "Served",
                    color: "text-green-600 bg-green-50",
                  };
                } else if (
                  item.Customer_Status === "requested" &&
                  item.Received_Time
                ) {
                  return {
                    label: "Requested",
                    color: "text-blue-600 bg-blue-50",
                  };
                } else if (item.Customer_Status === "requested") {
                  return {
                    label: "Pending",
                    color: "text-yellow-600 bg-yellow-50",
                  };
                } else if (item.sangira?.Sangira_Status === "pending") {
                  return {
                    label: "Payment Pending",
                    color: "text-yellow-600 bg-yellow-50",
                  };
                }
                return {
                  label: "Processing",
                  color: "text-gray-600 bg-gray-50",
                };
              };

              const statusInfo = getStatusInfo();

              // Use Served_Date for served items without sangira, otherwise use Request_Date
              const displayDate =
                item.Customer_Status === "served" && !item.Sangira_ID
                  ? item.Served_Date
                  : item.Request_Date;

              const timeAgo = formatTimeAgo(displayDate);
              const unitName = item.estate?.name || "N/A";

              return (
                <div
                  key={item.Request_ID}
                  className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaHome className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {`${capitalize(removeUnderscore(item?.Request_Type))}
                      - Unit - ${unitName}`}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="py-2 border-t border-slate-100">
            <p
              onClick={() => navigate("/projects/real-estates/payments")}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate("/projects/real-estates/payments")
              }
              role="button"
              tabIndex={0}
              className="cursor-pointer text-sm hover:text-blue-900 text-sky-600 font-medium text-center"
            >
              View all payments →
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <header className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Management</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage rental units, spaces and applications
            </p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ManagementCard
              title="Rental Units"
              icon={BsBoxes}
              items={units}
              route="/projects/real-estates/units"
              header={"Status"}
              header1={"Price"}
              headerValue={"status"}
              header1Value={"price"}
            />
            <ManagementCard
              title="Unit Features"
              icon={BsClipboard2Plus}
              items={features}
              route="/projects/real-estates/features"
            />

            <ManagementCard
              title="Rental House Requests"
              icon={HiOutlineInboxArrowDown}
              items={requests}
              route="/projects/real-estates/house-requests"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Rental Space Requests"
              icon={HiOutlineInboxArrowDown}
              items={spaces}
              route="/projects/real-estates/space-requests"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Rented Houses"
              icon={BsHouseCheck}
              items={rentedHouses}
              route="/projects/real-estates/rented-houses"
              rental={true}
            />
            <ManagementCard
              title="Rented Spaces"
              icon={LuLandPlot}
              items={rentedSpace}
              route="/projects/real-estates/rented-spaces"
              rental={true}
            />
            <ManagementCard
              title="Employees"
              icon={MdOutlineWorkOutline}
              items={employees}
              route="/projects/real-estates/employees"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Customers"
              icon={BsPeople}
              items={customers}
              route="/projects/real-estates/customers"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Unit Locations"
              icon={FiMapPin}
              items={locations}
              route="/projects/real-estates/locations"
              header={"Status"}
              headerValue={"Location_Status"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstateDashboard;
