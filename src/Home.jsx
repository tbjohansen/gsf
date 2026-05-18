import {
  MdAssignmentAdd,
  MdOutlineListAlt,
  MdPeople,
  MdTrendingUp,
} from "react-icons/md";
import { BiBuildingHouse, BiSolidBuildings } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import apiClient from "./api/Client";
import {
  capitalize,
  currencyFormatter,
  formatter,
  removeUnderscore,
} from "../helpers";
import ManagementCard from "./components/ManagementCard";
import { PiStudent } from "react-icons/pi";
import { RiListSettingsLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBed } from "react-icons/io5";
import { GiPayMoney } from "react-icons/gi";

const Home = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [stats, setStatistics] = useState("");
  const [bedStats, setBedStatistics] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const hasFetchedData = useRef(false);

  const navigate = useNavigate();

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
    if (diffInSeconds < 2592000)
      // Less than 30 days
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      // Less than 365 days
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;

    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const setups = [
    { name: "Academic Year", status: "active" },
    { name: "Payment Categories", status: "active" },
  ];

  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        "/customer/customer-request?&Request_Type=hostel",
      );

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

  const loadBedStats = async () => {
    setStatsLoading(true);
    try {
      const response = await apiClient.get("/customer/hostel-bed-statistics");

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
      setBedStatistics(userData);
      setStatsLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setStatsLoading(false);
      // toast.error("Failed to load employees");
    }
  };

    const loadMonthlyPayments = async () => {
    setStatsLoading(true);
    try {
      const response = await apiClient.get("/customer/hostel-beloe-five-month");

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
      const userData = response?.data?.data?.data;
      // console.log(userData);
      setMonthlyPayments(userData);
      setStatsLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setStatsLoading(false);
      // toast.error("Failed to load employees");
    }
  };

  const loadHostels = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/hostel");

      if (!response.ok) {
        setLoading(false);
        //  toast.error("Failed to fetch hostels");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        //  toast.error("Failed to fetch hostels");
        return;
      }

      // Adjust based on your API response structure
      const hostelData = response?.data?.data;
      const newData = hostelData?.map((hostel, index) => ({
        ...hostel,
        key: index + 1,
      }));
      // console.log(newData);
      setHostels(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      setLoading(false);
      //  toast.error("Failed to load hostels");
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer?&Customer_Nature=student`;

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
      setStudents(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      let url = `/settings/sms`;

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
      setMessages(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoading(false);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      let url = `/settings/item?&Item_Type=student_accomodatio,caution_money`;

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

  const loadAssigned = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Customer_Status=paid&Room_Status=paid&Request_Type=hostel`;

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
      const paymentsData = response?.data?.data?.data;
      const newData = paymentsData?.map((payment, index) => ({
        ...payment,
        key: index + 1,
      }));
      // console.log(newData);
      setAssigned(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch payments error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadPaymentsData();
      loadHostelStats();
      loadHostels();
      loadStudents();
      loadItems();
      loadAssigned();
      loadMessages();
      loadBedStats();
      loadMonthlyPayments();
    }
  }, []);

  const getBedTotals = (data) => {
    return {
      totalBeds: data?.reduce(
        (sum, item) => sum + parseInt(item.total_beds),
        0,
      ),
      totalOccupiedBeds: data?.reduce(
        (sum, item) => sum + parseInt(item.occupied_beds),
        0,
      ),
      totalRemainingBeds: data?.reduce(
        (sum, item) => sum + parseInt(item.remaining_beds),
        0,
      ),
      totalRevenue: data?.reduce(
        (sum, item) => sum + item.occupied_total_price,
        0,
      ),
      totalMale: data?.reduce(
        (sum, item) => sum + parseInt(item.total_male),
        0,
      ),
      totalFemale: data?.reduce(
        (sum, item) => sum + parseInt(item.total_female),
        0,
      ),
      totalOccupiedGender: data?.reduce(
        (sum, item) => sum + parseInt(item.total_occupied_gender),
        0,
      ),
    };
  };

  function getOverallOccupancyRate(data) {
    const totalBeds = data?.reduce(
      (sum, item) => sum + parseInt(item.total_beds),
      0,
    );
    const totalOccupied = data?.reduce(
      (sum, item) => sum + parseInt(item.occupied_beds),
      0,
    );

    const occupancyRate = (totalOccupied / totalBeds) * 100;
    return parseFloat(occupancyRate.toFixed(2));
  }

  const occupancyRate = getOverallOccupancyRate(bedStats);

  const bedTotals = getBedTotals(bedStats);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Student Hostels
              </h3>
              <BiSolidBuildings className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.totalHostel || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              {formatter.format(stats?.totalRooms || 0)} total rooms
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Beds</h3>
              <IoBed className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(stats?.totalBeds || 0)}
            </p>
            <p className="text-xs text-sky-600 mt-2">
              {formatter.format(bedTotals?.totalRemainingBeds || 0)} available
              beds
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Occupants
              </h3>
              <MdPeople className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(bedTotals?.totalOccupiedBeds || 0)}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {formatter.format(occupancyRate || 0)}% occupancy rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Year Revenue
              </h3>
              <MdTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {currencyFormatter.format(bedTotals?.totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-2">+1% from last year</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            onClick={() => navigate("/projects/hostels/payments")}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/projects/hostels/payments")
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
                if (
                  item?.Customer_Status === "served" ||
                  item?.Customer_Status === "paid"
                ) {
                  return {
                    label: "Served",
                    color: "text-green-600 bg-green-50",
                  };
                } else if (
                  item?.Customer_Status === "requested" &&
                  item?.Received_Time
                ) {
                  return {
                    label: "Requested",
                    color: "text-blue-600 bg-blue-50",
                  };
                } else if (item?.Customer_Status === "requested") {
                  return {
                    label: "Pending",
                    color: "text-yellow-600 bg-yellow-50",
                  };
                } else if (item?.sangira?.Sangira_Status === "pending") {
                  return {
                    label: "Pending Payment",
                    color: "text-yellow-600 bg-yellow-50",
                  };
                } else if (item?.Customer_Status === "expired") {
                  return {
                    label: "Expired",
                    color: "text-red-600 bg-red-50",
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
                item?.Customer_Status === "served" && !item.Sangira_ID
                  ? item.Served_Date
                  : item.Request_Date;

              const timeAgo = formatTimeAgo(displayDate);
              // console.log(timeAgo);
              const hostelName = item?.room?.hostel?.Hostel_Name || "N/A";
              const blockName = item?.room?.block?.Block_Name || "N/A";
              const floorName = item?.room?.flow?.Flow_Name || "N/A";
              const roomName = item?.room?.Room_Name || "N/A";

              return (
                <div
                  key={item?.Request_ID}
                  className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaHome className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {`${capitalize(removeUnderscore(item?.Request_Type))}
                              - ${hostelName} - ${blockName} - ${floorName} - ${roomName}`}
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
              onClick={() => navigate("/projects/hostels/payments")}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate("/projects/hostels/payments")
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
              Manage student accommodation details and payment items
            </p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ManagementCard
              title="Hostels"
              icon={BiBuildingHouse}
              items={hostels}
              route="/projects/hostels/list"
              header={"Status"}
              headerValue={"Hostel_Status"}
            />
            <ManagementCard
              title="Students"
              icon={PiStudent}
              items={students}
              route="/projects/hostels/students"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Pending Room Assignment"
              icon={MdAssignmentAdd}
              items={assigned}
              route="/projects/hostels/pending-room-assignments"
              header={"Status"}
              headerValue={"Room_Status"}
            />
            <ManagementCard
              title="Monthly Payments"
              icon={GiPayMoney}
              items={monthlyPayments}
              route="/projects/hostels/monthly-payments"
              header={"Months"}
              headerValue={"Quantity"}
            />
            <ManagementCard
              title="Setups"
              icon={RiListSettingsLine}
              items={setups}
              route="/projects/hostels/setups"
              header={"Status"}
              headerValue={"status"}
            />
            <ManagementCard
              title="Broadcast Announcements"
              icon={AiOutlineMessage}
              items={messages}
              route="/projects/hostels/announcements"
              tableHeader={"Date"}
              header={"Status"}
              headerValue={"status"}
            />
            <ManagementCard
              title="Payment Items"
              icon={MdOutlineListAlt}
              items={items}
              route="/projects/hostels/items"
              header={"Status"}
              headerValue={"Item_Status"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
