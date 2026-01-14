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
import { capitalize, formatter } from "../helpers";
import ManagementCard from "./components/ManagementCard";
import { LuLandPlot } from "react-icons/lu";
import { BsBoxes, BsClipboard2Plus, BsHouseCheck, BsPeople } from "react-icons/bs";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";

const EstateDashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [features, setFeatures] = useState([]);
  const [stats, setStatistics] = useState("");
  const [availableHouses, setAvailableHouses] = useState("");
  const [availableSpace, setAvailableSpaces] = useState("");
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

  const loadHostelStats = async () => {
    setStatsLoading(true);
    try {
      const response = await apiClient.get("/customer/hostel-statistics");

      if (!response.ok) {
        setStatsLoading(false);
        // toast.error(response.data?.error || "Failed to fetch employees");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setStatsLoading(false);
        // toast.error(response.data.error || "Failed to fetch employees");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data;
      // console.log(userData);
      setStatistics(userData);
      setStatsLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setStatsLoading(false);
      // toast.error("Failed to load employees");
    }
  };

  const loadUnits = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/real-estate");

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
      setUnits(Array.isArray(newData) ? newData : []);
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
      let url = `/customer/customer?&Customer_Nature=real_estate`;

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
      setCustomers(Array.isArray(newData) ? newData : []);
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

      if (!response.ok || response.data?.error || response.data?.code >= 400) {
        setLoading(false);
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

        if (user?.Student_ID != null) {
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

  const loadItems = async () => {
    setLoading(true);
    try {
      let url = `/settings/item?&Item_Type=student_accomodation`;

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
      const itemData = response?.data?.data;
      const newData = itemData?.map((item, index) => ({
        ...item,
        key: index + 1,
      }));
      // console.log(newData);
      setItems(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
    }
  };

  const loadHouseRequests = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=real_estate`;

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
      // console.log(newData);
      setRequests(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
    }
  };

   const loadSpaceRequests = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=real_estate`;

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
      // console.log(newData);
      setRequests(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsData();
    loadHostelStats();
    loadUnits();
    loadFeatures();
    loadCustomers();
    loadItems();
    loadEmployees();
    loadLocations();
    loadHouseRequests();
    loadSpaceRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Rental Units
              </h3>
              <FaHome className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {units?.length || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              {formatter.format(units?.length || 0)} units available
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
              {formatter.format(units?.length || 0)}
            </p>
            <p className="text-xs text-sky-600 mt-2">
              {formatter.format(units?.length || 0)} available spaces
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Year Revenue
              </h3>
              <MdTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">TZS 12.5M</p>
            <p className="text-xs text-green-600 mt-2">+18% from last year</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Occupants
              </h3>
              <MdPeople className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(stats?.occupants || 0)}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {formatter.format(stats?.rates || 0)}% occupancy rate
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            onClick={() => navigate("/projects/hostels/payments")}
            className="flex justify-between cursor-pointer"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Recent Payments & Updates
            </h3>
            <FiArrowRight className="w-5 h-5 text-slate-400 hover:text-sky-600 transition-colors" />
          </div>
          <div className="space-y-4">
            {[
              {
                id: 1,
                type: "Payment",
                property: "Unit - A21",
                time: "1 hour ago",
                status: "Completed",
              },
              {
                id: 2,
                type: "Payment",
                property: "Unit - E43",
                time: "3 hours ago",
                status: "Completed",
              },
              {
                id: 3,
                type: "Payment",
                property: "Unit - B12",
                time: "5 hours ago",
                status: "Completed",
              },
              {
                id: 4,
                type: "Payment",
                property: "Unit - C78",
                time: "1 day ago",
                status: "Pending",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaHome className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {item.type} - {item.property}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    item.status === "Completed" ||
                    item.status === "Confirmed" ||
                    item.status === "Received"
                      ? "text-green-600 bg-green-50"
                      : "text-yellow-600 bg-yellow-50"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <div className="py-2 border-t border-slate-100">
            <p
              onClick={() => navigate("/projects/hostels/payments")}
              className="cursor-pointer text-sm hover:text-blue-900 text-sky-600 font-medium text-center group-hover:text-sky-700"
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
              items={requests}
              route="/projects/real-estates/space-requests"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Rented Houses"
              icon={BsHouseCheck}
              items={requests}
              route="/projects/real-estates/house-requests"
              header={"Status"}
              headerValue={"Room_Status"}
            />
            <ManagementCard
              title="Rented Spaces"
              icon={LuLandPlot}
              items={requests}
              route="/projects/real-estates/space-requests"
              header={"Status"}
              headerValue={"Room_Status"}
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
