import { MdAssignmentAdd, MdOutlineListAlt, MdPeople, MdTrendingUp } from "react-icons/md";
import { BiBuildingHouse, BiSolidBuildings } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import apiClient from "./api/Client";
import { capitalize, formatter } from "../helpers";
import ManagementCard from "./components/ManagementCard";
import { PiStudent } from "react-icons/pi";
import { RiListSettingsLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { IoBed  } from "react-icons/io5";

const Home = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [items, setItems] = useState([]);
  const [setups, setSetups] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [stats, setStatistics] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const hasFetchedData = useRef(false);

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

  const loadSetups = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/payment-category");

      if (!response.ok) {
        setLoading(false);
        //  toast.error(
        //    response.data?.error || "Failed to fetch payment categories"
        //  );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        //  toast.error(
        //    response.data.error || "Failed to fetch payment categories"
        //  );
        return;
      }

      // Adjust based on your API response structure
      const categoryData = response?.data?.data;
      const newData = categoryData?.map((category, index) => ({
        ...category,
        key: index + 1,
      }));
      // console.log(newData);
      setSetups(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch payment categories error:", error);
      setLoading(false);
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

  const loadItems = async () => {
    setLoading(true);
    try {
      let url = `/settings/item?&Item_Type=student_accomodatio`;

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
      loadSetups();
      loadStudents();
      loadItems();
      loadAssigned();
    }
  }, []);

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
              <h3 className="text-sm font-medium text-gray-600">
                Total Beds
              </h3>
              <IoBed className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {formatter.format(stats?.totalBeds || 0)}
            </p>
            <p className="text-xs text-sky-600 mt-2">
              {formatter.format(stats?.totalRooms || 0)} available beds
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
              {formatter.format(stats?.occupants || 5)}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {formatter.format(stats?.rates || 2)}% occupancy rate
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
                property: "BSM - Room 205",
                time: "1 hour ago",
                status: "Completed",
              },
              {
                id: 2,
                type: "Payment",
                property: "BSM - Room 34",
                time: "3 hours ago",
                status: "Completed",
              },
              {
                id: 3,
                type: "Payment",
                property: "Nuru - B12",
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
              title="Payment Items"
              icon={MdOutlineListAlt}
              items={items}
              route="/projects/hostels/items"
              header={"Status"}
              headerValue={"Item_Status"}
            />
            <ManagementCard
              title="Payment Types"
              icon={RiListSettingsLine}
              items={setups}
              route="/projects/hostels/setups"
              header={"Months"}
              headerValue={"Category_Quantity"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
