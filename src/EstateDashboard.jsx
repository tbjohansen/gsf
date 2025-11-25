import { MdPeople, MdTrendingUp } from "react-icons/md";
import { BiSolidBuildings } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { useEffect, useState } from "react";
import apiClient from "./api/Client";
import { capitalize, formatter } from "../helpers";

const EstateDashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [stats, setStatistics] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch payments request from API

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

//   console.log(stats);

  useEffect(() => {
    loadPaymentsData();
    loadHostelStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome to GSF Houses and Space Renting Dashboard
          </h2>
          <p className="opacity-90 mb-4">
            Managing employee housing and space renting
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
              <span>House Renting</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Houses
              </h3>
              <BiSolidBuildings className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.totalHostel || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              {formatter.format(stats?.totalBeds || 0)} units available
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Blocks / Wings
              </h3>
              <FaHome className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(stats?.totalHostel || 0)}
            </p>
            <p className="text-xs text-sky-600 mt-2">
              {formatter.format(stats?.totalRooms || 0)} available rooms
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Semester Revenue
              </h3>
              <MdTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">TZS 12.5M</p>
            <p className="text-xs text-green-600 mt-2">
              +18% from last semester
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
              {formatter.format(stats?.occupants || 0)}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {formatter.format(stats?.rates || 0)}% occupancy rate
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Payments & Updates
          </h3>
          <div className="space-y-4">
            {[
              {
                id: 1,
                type: "Booking",
                property: "Hostel Room 205",
                time: "1 hour ago",
                status: "Confirmed",
              },
              {
                id: 2,
                type: "Payment",
                property: "BSM - Room 34",
                time: "3 hours ago",
                status: "Received",
              },
              {
                id: 3,
                type: "Check-out",
                property: "Nuru B12",
                time: "5 hours ago",
                status: "Completed",
              },
              {
                id: 4,
                type: "Booking",
                property: "Kilimanjaro - Room 1",
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
        </div>
      </div>
    </div>
  );
};

export default EstateDashboard;
